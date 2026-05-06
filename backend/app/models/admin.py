from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminResponse(BaseModel):
    id: str
    username: str
    email: Optional[str] = None
    created_at: Optional[datetime] = None