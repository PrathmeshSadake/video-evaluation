import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    TEMP_DIR: str = "temp_files"
    ALLOWED_VIDEO_FORMATS: list = [".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv"]

settings = Settings() 