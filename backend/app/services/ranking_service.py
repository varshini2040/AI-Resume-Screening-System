from typing import List, Dict
from app.database import MongoDB

class RankingService:
    @staticmethod
    async def update_rankings(job_id: str):
        """Update rankings for all resumes of a job"""
        db = MongoDB.get_db()
        
        # Get all scores sorted by overall_score
        cursor = db.resume_scores.find({"job_id": job_id}).sort("overall_score", -1)
        
        rank = 0
        async for score in cursor:
            rank += 1
            await db.resume_scores.update_one(
                {"_id": score["_id"]},
                {"$set": {"ranking": rank}}
            )
        
        print(f"✅ Rankings updated for job {job_id}: {rank} resumes ranked")
        return rank
    
    @staticmethod
    async def get_top_candidates(job_id: str, limit: int = 10) -> List[Dict]:
        """Get top ranked candidates"""
        db = MongoDB.get_db()
        
        cursor = db.resume_scores.find(
            {"job_id": job_id}
        ).sort("ranking", 1).limit(limit)
        
        candidates = []
        async for score in cursor:
            candidates.append({
                "rank": score.get("ranking"),
                "candidate_name": score.get("candidate_name"),
                "overall_score": score.get("overall_score"),
                "skills_score": score.get("skills_score"),
                "experience_score": score.get("experience_score")
            })
        
        return candidates