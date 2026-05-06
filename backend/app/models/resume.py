from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ResumeScore(BaseModel):
    resume_id: str
    candidate_name: str
    skills_score: float
    experience_score: float
    education_score: float
    keyword_score: float
    overall_score: float
    ranking: Optional[int] = None

class RankingResponse(BaseModel):
    job_id: str
    rankings: List[ResumeScore]