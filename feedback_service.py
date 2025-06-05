import torch
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import json
import logging
from typing import Dict, Any, List
import re

logger = logging.getLogger(__name__)

class FeedbackService:
    def __init__(self):
        """Initialize Hugging Face models for text analysis"""
        logger.info("Loading Hugging Face models for feedback analysis...")
        
        # Initialize sentiment analysis pipeline
        self.sentiment_analyzer = pipeline(
            "sentiment-analysis", 
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",
            return_all_scores=True
        )
        
        # Initialize text generation model for summaries and recommendations
        self.text_generator = pipeline(
            "text2text-generation",
            model="google/flan-t5-base",
            device=0 if torch.cuda.is_available() else -1
        )
        
        logger.info("Feedback analysis models loaded successfully")
    
    def generate_feedback(self, transcription_text: str) -> Dict[str, Any]:
        """Generate comprehensive feedback based on transcription using Hugging Face models"""
        try:
            logger.info("Generating feedback using Hugging Face models...")
            
            # Analyze sentiment
            sentiment_result = self._analyze_sentiment(transcription_text)
            
            # Generate summary
            summary = self._generate_summary(transcription_text)
            
            # Extract key topics and patterns
            key_topics = self._extract_key_topics(transcription_text)
            
            # Analyze speaking patterns
            speaking_patterns = self._analyze_speaking_patterns(transcription_text)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(transcription_text)
            
            # Calculate quality score
            quality_score = self._calculate_quality_score(transcription_text)
            
            # Compile feedback
            feedback = {
                "overall_sentiment": sentiment_result["label"],
                "key_topics": key_topics,
                "summary": summary,
                "recommendations": recommendations,
                "quality_score": quality_score,
                "word_count": len(transcription_text.split()),
                "content_analysis": {
                    "clarity": self._assess_clarity(transcription_text),
                    "engagement": self._assess_engagement(transcription_text),
                    "information_density": self._assess_information_density(transcription_text),
                    "speaker_confidence": self._assess_confidence(transcription_text)
                },
                "speaking_patterns": speaking_patterns,
                "actionable_insights": self._generate_insights(transcription_text)
            }
            
            logger.info("Feedback generated successfully")
            return feedback

        except Exception as e:
            logger.error(f"Error generating feedback: {str(e)}")
            return self._get_fallback_feedback(transcription_text)
    
    def _analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment using RoBERTa model"""
        try:
            # Truncate text if too long
            text = text[:512] if len(text) > 512 else text
            result = self.sentiment_analyzer(text)[0]
            
            # Convert to simple labels
            label_map = {"LABEL_0": "negative", "LABEL_1": "neutral", "LABEL_2": "positive"}
            best_result = max(result, key=lambda x: x['score'])
            
            return {
                "label": label_map.get(best_result['label'], best_result['label'].lower()),
                "confidence": best_result['score']
            }
        except Exception as e:
            logger.warning(f"Sentiment analysis failed: {e}")
            return {"label": "neutral", "confidence": 0.5}
    
    def _generate_summary(self, text: str) -> str:
        """Generate summary using FLAN-T5"""
        try:
            # Truncate for model limits
            text = text[:1000] if len(text) > 1000 else text
            prompt = f"Summarize this transcription in 2-3 sentences: {text}"
            result = self.text_generator(prompt, max_length=150, min_length=30)
            return result[0]['generated_text'].strip()
        except Exception as e:
            logger.warning(f"Summary generation failed: {e}")
            return f"Content analysis of {len(text.split())} words covering various topics."
    
    def _extract_key_topics(self, text: str) -> List[str]:
        """Extract key topics using simple keyword analysis"""
        try:
            # Simple keyword extraction based on frequency
            words = re.findall(r'\b\w+\b', text.lower())
            word_freq = {}
            
            # Filter out common words
            stop_words = {"the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "this", "that", "these", "those", "a", "an"}
            
            for word in words:
                if len(word) > 3 and word not in stop_words:
                    word_freq[word] = word_freq.get(word, 0) + 1
            
            # Get top topics
            top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:5]
            return [word[0] for word in top_words] if top_words else ["general discussion"]
        except Exception as e:
            logger.warning(f"Topic extraction failed: {e}")
            return ["general content"]
    
    def _analyze_speaking_patterns(self, text: str) -> Dict[str, Any]:
        """Analyze speaking patterns"""
        try:
            words = text.split()
            
            # Count filler words
            filler_words = ["uh", "um", "er", "ah", "like", "you know", "actually", "basically", "literally"]
            filler_count = sum(1 for word in words if word.lower().strip(".,!?") in filler_words)
            
            # Estimate pace (words per minute - rough estimate)
            # Assuming average speaking pace
            estimated_minutes = len(words) / 150  # average words per minute
            pace = "fast" if len(words) / estimated_minutes > 180 else "medium" if len(words) / estimated_minutes > 120 else "slow"
            
            # Find technical terms (longer words)
            technical_terms = [word for word in words if len(word) > 8 and word.isalpha()][:5]
            
            return {
                "pace": pace,
                "filler_words": filler_count,
                "repetitions": 0,  # Simple implementation
                "technical_terms": technical_terms
            }
        except Exception as e:
            logger.warning(f"Speaking pattern analysis failed: {e}")
            return {"pace": "medium", "filler_words": 0, "repetitions": 0, "technical_terms": []}
    
    def _generate_recommendations(self, text: str) -> List[str]:
        """Generate recommendations using FLAN-T5"""
        try:
            prompt = f"Give 2 recommendations to improve this speech: {text[:500]}"
            result = self.text_generator(prompt, max_length=100)
            recommendations = result[0]['generated_text'].strip().split('. ')
            return [rec.strip() for rec in recommendations if rec.strip()][:3]
        except Exception as e:
            logger.warning(f"Recommendation generation failed: {e}")
            return ["Consider practicing clear articulation", "Maintain consistent pacing"]
    
    def _calculate_quality_score(self, text: str) -> float:
        """Calculate overall quality score"""
        try:
            score = 0.5  # Base score
            
            # Length factor
            word_count = len(text.split())
            if word_count > 50:
                score += 0.2
            if word_count > 200:
                score += 0.1
            
            # Sentence structure (rough estimate)
            sentences = text.split('.')
            avg_sentence_length = word_count / max(len(sentences), 1)
            if 10 <= avg_sentence_length <= 25:
                score += 0.2
            
            return min(score, 1.0)
        except Exception as e:
            logger.warning(f"Quality score calculation failed: {e}")
            return 0.7
    
    def _assess_clarity(self, text: str) -> str:
        """Assess content clarity"""
        word_count = len(text.split())
        avg_word_length = sum(len(word) for word in text.split()) / max(word_count, 1)
        
        if avg_word_length < 4:
            return "high"
        elif avg_word_length < 6:
            return "medium"
        else:
            return "low"
    
    def _assess_engagement(self, text: str) -> str:
        """Assess content engagement"""
        question_marks = text.count('?')
        exclamation_marks = text.count('!')
        
        if question_marks + exclamation_marks > 3:
            return "high"
        elif question_marks + exclamation_marks > 1:
            return "medium"
        else:
            return "low"
    
    def _assess_information_density(self, text: str) -> str:
        """Assess information density"""
        word_count = len(text.split())
        unique_words = len(set(word.lower() for word in text.split()))
        
        density_ratio = unique_words / max(word_count, 1)
        
        if density_ratio > 0.7:
            return "high"
        elif density_ratio > 0.5:
            return "medium"
        else:
            return "low"
    
    def _assess_confidence(self, text: str) -> str:
        """Assess speaker confidence"""
        uncertainty_words = ["maybe", "perhaps", "i think", "possibly", "probably"]
        uncertainty_count = sum(1 for word in uncertainty_words if word in text.lower())
        
        if uncertainty_count == 0:
            return "high"
        elif uncertainty_count <= 2:
            return "medium"
        else:
            return "low"
    
    def _generate_insights(self, text: str) -> List[str]:
        """Generate actionable insights"""
        insights = []
        
        word_count = len(text.split())
        if word_count < 50:
            insights.append("Consider expanding on key points for better coverage")
        elif word_count > 500:
            insights.append("Content is comprehensive - consider breaking into sections")
        
        if text.count('?') == 0:
            insights.append("Adding rhetorical questions could improve engagement")
        
        if not insights:
            insights.append("Content structure and flow appear well-balanced")
        
        return insights
    
    def _get_fallback_feedback(self, transcription_text: str) -> Dict[str, Any]:
        """Provide basic fallback feedback when LLM fails"""
        word_count = len(transcription_text.split())
        
        return {
            "overall_sentiment": "neutral",
            "key_topics": ["general content"],
            "summary": "Content analysis completed. Detailed feedback unavailable due to processing limitations.",
            "recommendations": [
                "Consider reviewing content for clarity",
                "Ensure key points are well-structured"
            ],
            "quality_score": 0.5,
            "word_count": word_count,
            "content_analysis": {
                "clarity": "medium",
                "engagement": "medium",
                "information_density": "medium",
                "speaker_confidence": "medium"
            },
            "speaking_patterns": {
                "pace": "medium",
                "filler_words": 0,
                "repetitions": 0,
                "technical_terms": []
            },
            "actionable_insights": [
                "Basic transcription completed successfully",
                f"Content contains {word_count} words"
            ]
        } 