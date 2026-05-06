from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class JobCreate(BaseModel):
    title: str
    description: str
    required_skills: List[str] = []
    required_experience: int = 0
    required_education: str = ""

class JobResponse(BaseModel):
    id: str
    title: str
    description: str
    required_skills: List[str]
    required_experience: int
    required_education: str
    created_at: Optional[datetime] = None