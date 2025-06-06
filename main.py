from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import logging
import os
from models import VideoTranscriptionRequest, TranscriptionResponse
from video_processor import VideoProcessor
from transcription_service import TranscriptionService
from feedback_service import FeedbackService
from config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Video Transcription & Feedback API",
    description="API for transcribing videos and generating feedback using LLM",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
video_processor = VideoProcessor(temp_dir=settings.TEMP_DIR)
transcription_service = TranscriptionService()
feedback_service = FeedbackService()

def cleanup_audio_file(file_path: str):
    """Background task to cleanup audio file"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Cleaned up audio file: {file_path}")
    except Exception as e:
        logger.warning(f"Failed to cleanup audio file {file_path}: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Video Transcription & Feedback API", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "using_huggingface_models": True}

@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_video(
    request: VideoTranscriptionRequest,
    background_tasks: BackgroundTasks
):
    """
    Transcribe video from URL and generate feedback
    
    - **video_url**: URL of the video to transcribe (YouTube, direct video links, etc.)
    - **required_skills**: Optional list of skills to evaluate in the interview
    
    Returns transcription segments, full text, and comprehensive feedback analysis.
    """
    
    # No API key needed for Hugging Face models
    
    audio_path = None
    
    try:
        logger.info(f"Processing video URL: {request.video_url}")
        
        if request.required_skills and len(request.required_skills) > 0:
            logger.info(f"Required skills to evaluate: {', '.join(request.required_skills)}")
        
        # Step 1: Download video and extract audio
        audio_path, duration = video_processor.process_video_url(str(request.video_url))
        logger.info(f"Audio extracted successfully, duration: {duration}s")
        
        # Step 2: Transcribe audio
        segments = transcription_service.transcribe_audio(audio_path)
        full_text = transcription_service.get_full_text(segments)
        logger.info(f"Transcription completed: {len(full_text)} characters")
        
        # Step 3: Generate feedback with required skills
        feedback = feedback_service.generate_feedback(full_text, request.required_skills)
        logger.info("Feedback generated successfully")

        print(feedback)
        
        # Schedule cleanup of audio file
        background_tasks.add_task(cleanup_audio_file, audio_path)
        
        # Return response
        return TranscriptionResponse(
            transcription=segments,
            full_text=full_text,
            duration=duration,
            feedback=feedback
        )
        
    except Exception as e:
        # Cleanup audio file on error
        if audio_path and os.path.exists(audio_path):
            try:
                os.remove(audio_path)
            except:
                pass
        
        logger.error(f"Error processing video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 