from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Any

class VideoTranscriptionRequest(BaseModel):
    video_url: HttpUrl

class TranscriptionSegment(BaseModel):
    start_time: float
    end_time: float
    text: str
    confidence: float = 0.0

class TranscriptionResponse(BaseModel):
    transcription: List[TranscriptionSegment]
    full_text: str
    duration: float
    feedback: Dict[str, Any]

class FeedbackAnalysis(BaseModel):
    overall_sentiment: str
    key_topics: List[str]
    summary: str
    recommendations: List[str]
    quality_score: float
    word_count: int 