from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import MongoDB

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting AI Resume Screening System...")
    await MongoDB.connect_db()
    print("✅ System Ready!")
    yield
    await MongoDB.close_db()

app = FastAPI(
    title="AI Resume Screening System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS - ALLOW ALL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers
from app.routers import admin_router, job_router, resume_router

app.include_router(admin_router.router, prefix="/api", tags=["Admin"])
app.include_router(job_router.router, prefix="/api", tags=["Jobs"])
app.include_router(resume_router.router, prefix="/api", tags=["Resumes"])

@app.get("/")
async def root():
    return {"message": "AI Resume Screening API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}