import os
import aiofiles
from fastapi import UploadFile
from app.config import settings

async def save_upload_file(file: UploadFile) -> str:
    """Save uploaded file and return file path"""
    os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_FOLDER, filename)
    
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    return file_path