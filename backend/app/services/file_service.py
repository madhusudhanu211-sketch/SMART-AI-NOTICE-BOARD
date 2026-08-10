import os
import shutil
from fastapi import UploadFile
from app.core.config import settings

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class FileService:
    @staticmethod
    async def save_file(file: UploadFile) -> dict:
        filename = f"{os.urandom(6).hex()}_{file.filename}"
        
        # Check if Cloudinary credentials are set
        if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
            try:
                # pyrefly: ignore [missing-import]
                import cloudinary
                # pyrefly: ignore [missing-import]
                import cloudinary.uploader
                cloudinary.config(
                    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                    api_key=settings.CLOUDINARY_API_KEY,
                    api_secret=settings.CLOUDINARY_API_SECRET
                )
                res = cloudinary.uploader.upload(file.file)
                return {
                    "url": res.get("secure_url"),
                    "name": file.filename,
                    "type": file.content_type.split("/")[0] if file.content_type else "file"
                }
            except Exception as e:
                print(f"Cloudinary upload fallback to local: {e}")

        # Local storage fallback
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Serve static URL
        local_url = f"/static/uploads/{filename}"
        
        file_type = "file"
        if file.content_type:
            if "pdf" in file.content_type:
                file_type = "pdf"
            elif "image" in file.content_type:
                file_type = "image"
            elif "video" in file.content_type:
                file_type = "video"

        return {
            "url": local_url,
            "name": file.filename,
            "type": file_type
        }

file_service = FileService()
