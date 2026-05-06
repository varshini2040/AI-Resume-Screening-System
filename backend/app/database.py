from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None
    
    @classmethod
    async def connect_db(cls):
        try:
            cls.client = AsyncIOMotorClient(settings.MONGODB_URL)
            cls.db = cls.client[settings.DATABASE_NAME]
            await cls.db.command("ping")
            print(f"✅ MongoDB Atlas Connected: {settings.DATABASE_NAME}")
        except Exception as e:
            print(f"❌ MongoDB Connection Error: {e}")
            raise e
    
    @classmethod
    async def close_db(cls):
        if cls.client:
            cls.client.close()
            print("🔒 MongoDB Connection Closed")
    
    @classmethod
    def get_db(cls):
        return cls.db