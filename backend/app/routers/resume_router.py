from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List
from datetime import datetime
from bson import ObjectId
import os
import re

from app.services.scoring_engine import ScoringEngine

router = APIRouter()

def extract_text_from_file(file_path: str, file_type: str) -> str:
    """Extract text from PDF or DOCX"""
    try:
        if file_type == 'pdf':
            import PyPDF2
            text = ""
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() or ""
            return text
        elif file_type in ['docx', 'doc']:
            import docx
            doc = docx.Document(file_path)
            return " ".join([p.text for p in doc.paragraphs])
    except Exception as e:
        print(f"Error reading file: {e}")
    return ""

def calculate_scores_with_ml(job_data: dict, resume_text: str) -> dict:
    """Calculate scores using trained ML model + traditional metrics"""
    
    # Initialize scoring engine with trained ML model
    scoring_engine = ScoringEngine(job_data)
    
    # Get job requirements
    required_skills = job_data.get('required_skills', [])
    job_description = job_data.get('description', '').lower()
    
    # Extract candidate skills from resume
    candidate_skills = []
    resume_text_lower = resume_text.lower()
    for skill in required_skills:
        if skill.lower() in resume_text_lower:
            candidate_skills.append(skill)
    
    # Extract years of experience
    exp_pattern = r'(\d+)[\+]?\s*years?\s*(of)?\s*experience'
    exp_match = re.findall(exp_pattern, resume_text_lower)
    if exp_match:
        years = max([int(y[0]) for y in exp_match])
    else:
        years = 0
    
    # Extract education info
    education_keywords = ['bachelor', 'master', 'phd', 'degree', 'b.tech', 'm.tech', 'b.e', 'm.e', 'computer science']
    education = " ".join([k for k in education_keywords if k in resume_text_lower])
    if not education:
        education = "Not mentioned"
    
    # Check if it's actually a resume
    resume_indicators = ['experience', 'education', 'skills', 'work', 'project', 'email', 'phone']
    resume_score = sum(1 for ind in resume_indicators if ind in resume_text_lower)
    is_resume = resume_score >= 3
    
    # Calculate scores using ML model
    scores = scoring_engine.calculate_overall_score(
        candidate_skills,
        years,
        education,
        resume_text
    )
    
    # If not a resume, penalize the overall score
    if not is_resume:
        scores["overall_score"] = scores["overall_score"] * 0.3
        scores["is_resume"] = False
    else:
        scores["is_resume"] = True
    
    return scores

@router.post("/upload-resumes")
async def upload_resumes(
    job_id: str = Form(...),
    files: List[UploadFile] = File(...)
):
    from app.database import MongoDB
    db = MongoDB.get_db()
    
    # Get job details
    job = await db.job_descriptions.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    os.makedirs("uploads", exist_ok=True)
    results = []
    
    for file in files:
        # Save file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = f"uploads/{timestamp}_{file.filename}"
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Extract text
        file_type = file.filename.split('.')[-1].lower()
        resume_text = extract_text_from_file(file_path, file_type)
        
        # Extract name from filename or text
        candidate_name = file.filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()
        
        # Calculate scores using trained ML model
        scores = calculate_scores_with_ml(job, resume_text)
        
        # Save to MongoDB
        try:
            resume_doc = {
                "job_id": job_id,
                "candidate_name": candidate_name,
                "email": "",
                "file_path": file_path,
                "parsed_text": resume_text[:1000],
                "is_resume": scores["is_resume"],
                "upload_date": datetime.utcnow()
            }
            result = await db.resumes.insert_one(resume_doc)
            
            score_doc = {
                "resume_id": str(result.inserted_id),
                "job_id": job_id,
                "candidate_name": candidate_name,
                "skills_score": scores.get("skills_score", 0),
                "experience_score": scores.get("experience_score", 0),
                "education_score": scores.get("education_score", 0),
                "keyword_score": scores.get("keyword_score", 0),
                "overall_score": scores.get("overall_score", 0),
                "is_resume": scores.get("is_resume", False),
                "category_prediction": scores.get("category_prediction", {}),
                "model_used": scores.get("model_used", "fallback"),
                "created_at": datetime.utcnow()
            }
            await db.resume_scores.insert_one(score_doc)
            
            # Flag non-resumes
            flag = " ⚠️ NOT A RESUME" if not scores["is_resume"] else ""
            
            # Extract category prediction details
            category_pred = scores.get("category_prediction", {})
            predicted_category = category_pred.get("predicted_category", "Unknown")
            confidence = category_pred.get("confidence_percentage", "N/A")
            top_3 = category_pred.get("top_3_predictions", [])
            
            results.append({
                "filename": file.filename,
                "candidate_name": candidate_name + flag,
                "overall_score": scores["overall_score"],
                "category_prediction": {
                    "predicted_category": predicted_category,
                    "confidence": confidence,
                    "top_3_candidates": top_3
                },
                "breakdown": {
                    "skills_score": scores["skills_score"],
                    "experience_score": scores["experience_score"],
                    "education_score": scores["education_score"],
                    "keyword_score": scores["keyword_score"]
                },
                "model_used": scores.get("model_used", "fallback"),
                "is_resume": scores.get("is_resume", False)
            })
            
        except Exception as e:
            print(f"DB Error: {e}")
    
    # Update rankings
    await update_rankings(job_id)
    
    return {"message": f"Processed {len(results)} resumes", "results": results}

async def update_rankings(job_id: str):
    from app.database import MongoDB
    db = MongoDB.get_db()
    
    cursor = db.resume_scores.find({"job_id": job_id}).sort("overall_score", -1)
    rank = 0
    async for score in cursor:
        rank += 1
        await db.resume_scores.update_one(
            {"_id": score["_id"]},
            {"$set": {"ranking": rank}}
        )

@router.get("/rankings/{job_id}")
async def get_rankings(job_id: str):
    from app.database import MongoDB
    db = MongoDB.get_db()
    
    rankings = []
    cursor = db.resume_scores.find({"job_id": job_id}).sort("overall_score", -1)
    
    rank = 0
    async for score in cursor:
        rank += 1
        category_pred = score.get("category_prediction", {})
        ranking_data = {
            "rank": rank,
            "resume_id": score.get("resume_id", ""),
            "candidate_name": score.get("candidate_name", ""),
            "overall_score": score.get("overall_score", 0),
            "skills_score": score.get("skills_score", 0),
            "experience_score": score.get("experience_score", 0),
            "education_score": score.get("education_score", 0),
            "keyword_score": score.get("keyword_score", 0),
            "category_prediction": {
                "predicted_category": category_pred.get("predicted_category", "Unknown"),
                "confidence": category_pred.get("confidence_percentage", "N/A"),
                "top_3_candidates": category_pred.get("top_3_predictions", [])
            },
            "model_used": score.get("model_used", "fallback"),
            "is_valid_resume": score.get("is_resume", True)
        }
        rankings.append(ranking_data)
    
    return {"job_id": job_id, "rankings": rankings}