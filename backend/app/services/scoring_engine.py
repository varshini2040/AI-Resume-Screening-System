from typing import List, Dict
import re
from app.ml_model.model import MLModel

class ScoringEngine:
    def __init__(self, job_data: Dict):
        self.job_data = job_data
        self.required_skills = job_data.get('required_skills', [])
        self.required_experience = job_data.get('required_experience', 0)
        self.job_description = job_data.get('description', '')
        
        # Load trained ML model
        self.ml_model = MLModel()
        self.model_loaded = self.ml_model.is_trained
        
        if self.model_loaded:
            print("✅ Trained ML Model loaded successfully")
        else:
            print("⚠️ Trained ML Model not available, using fallback scoring")
    
    def calculate_skills_score(self, candidate_skills: List[str]) -> float:
        """Score based on skills match"""
        if not self.required_skills:
            return 50.0
        
        matching = set(candidate_skills).intersection(set(self.required_skills))
        return (len(matching) / len(self.required_skills)) * 100
    
    def calculate_experience_score(self, years: float) -> float:
        """Score based on experience"""
        if self.required_experience == 0:
            return 100.0
        return min((years / self.required_experience) * 100, 100)
    
    def calculate_education_score(self, education: str) -> float:
        """Score based on education"""
        education_lower = education.lower()
        required_edu = self.job_data.get('required_education', '').lower()
        
        if not required_edu:
            return 70.0
        
        # Simple education matching
        edu_keywords = ['bachelor', 'master', 'phd', 'degree', 'computer science']
        score = 50
        
        for keyword in edu_keywords:
            if keyword in education_lower:
                score += 10
        
        if required_edu in education_lower:
            score += 20
        
        return min(score, 100)
    
    def extract_experience_years(self, resume_text: str) -> float:
        """Extract years of experience from resume"""
        exp_pattern = r'(\d+)[\+]?\s*years?\s*(of)?\s*experience'
        exp_matches = re.findall(exp_pattern, resume_text.lower())
        if exp_matches:
            return max([int(y[0]) for y in exp_matches])
        return 0.0
    
    def calculate_keyword_score(self, resume_text: str) -> float:
        """Score using trained ML model's similarity"""
        if self.model_loaded:
            return self.ml_model.calculate_similarity(self.job_description, resume_text)
        else:
            # Fallback to keyword matching
            return self.ml_model._keyword_fallback(self.job_description, resume_text)
    
    def calculate_category_prediction(self, resume_text: str) -> Dict:
        """Get ML model's category prediction"""
        if self.model_loaded:
            return self.ml_model.predict_category(resume_text)
        return {}
    
    def calculate_overall_score(self, skills: List[str], experience: float, 
                                education: str, resume_text: str) -> Dict:
        """Calculate all scores using trained model + traditional metrics"""
        
        skills_score = self.calculate_skills_score(skills)
        exp_score = self.calculate_experience_score(experience)
        edu_score = self.calculate_education_score(education)
        keyword_score = self.calculate_keyword_score(resume_text)
        
        # Get ML model category prediction if available
        category_pred = {}
        model_status = "fallback"
        if self.model_loaded:
            category_pred = self.calculate_category_prediction(resume_text)
            if category_pred.get("status") == "success":
                model_status = "trained_ensemble"
            else:
                model_status = "fallback_prediction_failed"
        
        # Weighted overall score (with higher weight on ML-based scoring)
        overall = (
            skills_score * 0.25 +
            exp_score * 0.20 +
            edu_score * 0.10 +
            keyword_score * 0.45  # Higher weight on ML similarity
        )
        
        return {
            "skills_score": round(skills_score, 2),
            "experience_score": round(exp_score, 2),
            "education_score": round(edu_score, 2),
            "keyword_score": round(keyword_score, 2),
            "overall_score": round(overall, 2),
            "category_prediction": category_pred,
            "model_used": model_status
        }