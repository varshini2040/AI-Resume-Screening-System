from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(request: LoginRequest):
    # Simple hardcoded check FIRST
    if request.username == "varshini" and request.password == "varshu":
        return {
            "access_token": "test_token_abc123",
            "token_type": "bearer",
            "message": "Login successful",
            "admin": {
                "id": "1",
                "username": "varshini",
                "email": "varshini@example.com"
            }
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")