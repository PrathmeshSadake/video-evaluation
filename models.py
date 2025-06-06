from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Any, Optional

class VideoTranscriptionRequest(BaseModel):
    video_url: HttpUrl
    required_skills: Optional[List[str]] = []

class TranscriptionSegment(BaseModel):
    start_time: float
    end_time: float
    text: str
    confidence: float = 0.0

class RequiredSkill(BaseModel):
    name: str

class TechnicalSkill(BaseModel):
    skill_name: str
    level: Optional[str] = None  # Beginner | Intermediate | Professional | Expert
    rating_text: Optional[str] = None  # Excellent | Very Good | Good | Satisfactory | Needs Improvement
    rating_score: int  # 1-5
    detailed_feedback: Optional[str] = None
    strengths: List[str]
    areas_for_improvement: List[str]
    examples_mentioned: List[str]
    is_required: Optional[bool] = False
    availability_status: Optional[str] = None  # Available | Not Available

class TechnicalSkillsAssessment(BaseModel):
    skills: List[TechnicalSkill]
    required_skills: Optional[List[RequiredSkill]] = []
    overall_tech_review: str
    depth_in_core_topics: int
    breadth_of_tech_stack: int
    strengths_summary: str
    weaknesses_summary: str
    verdict: str

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
    technical_skills: Optional[TechnicalSkillsAssessment] = None 