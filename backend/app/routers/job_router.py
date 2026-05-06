from fastapi import APIRouter, HTTPException, Body
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class JobCreate(BaseModel):
    title: str
    description: str
    required_skills: Optional[str] = ""
    required_experience: Optional[int] = 0
    required_education: Optional[str] = ""

@router.post("/jobs")
async def create_job(job: JobCreate):
    from app.database import MongoDB
    db = MongoDB.get_db()
    
    # Parse skills from string to list
    skills_list = []
    if job.required_skills:
        skills_list = [s.strip() for s in job.required_skills.split(",") if s.strip()]
    
    job_doc = {
        "title": job.title,
        "description": job.description,
        "required_skills": skills_list,
        "required_experience": job.required_experience,
        "required_education": job.required_education,
        "created_at": datetime.utcnow()
    }
    
    try:
        result = await db.job_descriptions.insert_one(job_doc)
        return {
            "id": str(result.inserted_id),
            **job_doc
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/jobs")
async def get_jobs():
    from app.database import MongoDB
    db = MongoDB.get_db()
    
    jobs = []
    try:
        cursor = db.job_descriptions.find().sort("created_at", -1)
        async for job in cursor:
            jobs.append({
                "id": str(job["_id"]),
                "title": job.get("title", ""),
                "description": job.get("description", "")[:100] + "...",
                "required_skills": job.get("required_skills", []),
                "required_experience": job.get("required_experience", 0),
                "required_education": job.get("required_education", "")
            })
    except Exception as e:
        print(f"Error fetching jobs: {e}")
    
    return jobs