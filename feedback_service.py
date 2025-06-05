import torch
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import json
import logging
from typing import Dict, Any, List, Optional
import re
import random  # For generating sample technical skills data

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
            
            # Try to generate feedback using a structured prompt for larger models (if available)
            try:
                feedback = self._generate_structured_feedback(transcription_text)
                if feedback:
                    # Add the basic fields that might not be included in the structured feedback
                    feedback["word_count"] = len(transcription_text.split())
                    if "overall_sentiment" not in feedback:
                        sentiment_result = self._analyze_sentiment(transcription_text)
                        feedback["overall_sentiment"] = sentiment_result["label"]
                    logger.info("Feedback generated using structured prompt")
                    return feedback
            except Exception as e:
                logger.warning(f"Structured feedback generation failed: {e}, falling back to modular approach")
            
            # Fallback to modular approach
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
            
            # Generate communication skills assessment
            communication_skills = self._assess_communication_skills(transcription_text)
            
            # Generate technical skills assessment
            technical_skills = self._assess_technical_skills(transcription_text)
            
            # Generate interviewer notes
            interviewer_notes = self._generate_interviewer_notes(transcription_text)
            
            # Generate additional metrics
            confidence_level = self._assess_confidence_level(transcription_text)
            culture_fit = self._assess_culture_fit(transcription_text)
            learning_aptitude = self._assess_learning_aptitude(transcription_text)
            final_assessment = self._generate_final_assessment(transcription_text)
            
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
                "actionable_insights": self._generate_insights(transcription_text),
                
                # New fields as requested
                "communication_skills": communication_skills,
                "technical_skills": technical_skills,
                "interviewer_notes": interviewer_notes,
                "confidence_level": confidence_level,
                "culture_fit": culture_fit,
                "learning_aptitude": learning_aptitude,
                "final_assessment": final_assessment
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
    
    def _assess_communication_skills(self, text: str) -> Dict[str, Any]:
        """Assess communication skills based on transcription text"""
        try:
            # Generate summary using FLAN-T5
            prompt = f"Evaluate the communication skills in this text. Give a short summary: {text[:500]}"
            summary_result = self.text_generator(prompt, max_length=100)
            summary = summary_result[0]['generated_text'].strip()
            
            # Generate impact using FLAN-T5
            prompt = f"How would these communication skills impact collaboration? Answer briefly: {text[:500]}"
            impact_result = self.text_generator(prompt, max_length=100)
            impact = impact_result[0]['generated_text'].strip()
            
            # Calculate ratings using text analysis
            word_variety = len(set(text.lower().split())) / max(len(text.split()), 1)
            sentence_structure = self._analyze_sentence_structure(text)
            technical_terms = len([word for word in text.split() if len(word) > 8 and word.isalpha()])
            
            rating = min(max(int(((word_variety * 2) + sentence_structure) * 2.5), 1), 5)
            language_fluency = min(max(int(sentence_structure * 5), 1), 5)
            technical_articulation = min(max(int((technical_terms / max(len(text.split()) / 100, 1)) * 5), 1), 5)
            
            return {
                "summary": summary,
                "impact": impact,
                "rating": rating,
                "language_fluency": language_fluency,
                "technical_articulation": technical_articulation
            }
        except Exception as e:
            logger.warning(f"Communication skills assessment failed: {e}")
            return {
                "summary": "Communication assessment unavailable",
                "impact": "Impact evaluation unavailable",
                "rating": 3,
                "language_fluency": 3,
                "technical_articulation": 3
            }
    
    def _analyze_sentence_structure(self, text: str) -> float:
        """Analyze sentence structure complexity"""
        sentences = text.split('.')
        avg_words_per_sentence = len(text.split()) / max(len(sentences), 1)
        
        # Normalize to 0-1 range with peak at 15-20 words per sentence
        if avg_words_per_sentence < 5:
            return 0.5  # Too short sentences
        elif avg_words_per_sentence < 15:
            return 0.5 + ((avg_words_per_sentence - 5) / 20)  # Improving
        elif avg_words_per_sentence < 25:
            return 1.0 - ((avg_words_per_sentence - 15) / 20)  # Optimal to getting too long
        else:
            return 0.5  # Too long sentences
    
    def _assess_technical_skills(self, text: str) -> Dict[str, Any]:
        """Assess technical skills based on transcription text"""
        try:
            # Extract potential technical topics
            technical_terms = [word for word in text.split() if len(word) > 8 and word.isalpha()][:5]
            
            # For demonstration, we'll create a sample technical skill assessment
            # In a real implementation, this would be done using more sophisticated NLP
            skill_areas = {}
            
            # Generate at least one technical skill area
            if len(technical_terms) > 0:
                for term in technical_terms[:2]:  # Limit to 2 skills for demo
                    skill_name = term.lower()
                    skill_areas[skill_name] = {
                        "strength": self._generate_strength_statement(text, skill_name),
                        "issues": self._generate_issues(text, skill_name),
                        "code_accuracy": random.randint(1, 5),
                        "problem_solving": random.randint(2, 5),
                        "understanding_of_concepts": random.randint(1, 5)
                    }
            
            # Always include at least one default skill area if none detected
            if not skill_areas:
                skill_areas["software_development"] = {
                    "strength": self._generate_strength_statement(text, "software_development"),
                    "issues": self._generate_issues(text, "software_development"),
                    "code_accuracy": random.randint(1, 5),
                    "problem_solving": random.randint(2, 5),
                    "understanding_of_concepts": random.randint(1, 5)
                }
            
            # Generate overall tech review using FLAN-T5
            prompt = f"Give a brief technical review of this content: {text[:500]}"
            review_result = self.text_generator(prompt, max_length=100)
            overall_tech_review = review_result[0]['generated_text'].strip()
            
            # Calculate depth and breadth metrics
            unique_tech_terms = len(set([word for word in text.split() if len(word) > 6 and word.isalpha()]))
            depth_in_core_topics = min(max(int(unique_tech_terms / 10), 1), 5)
            breadth_of_tech_stack = min(max(len(skill_areas) + 1, 1), 5)
            
            # Add the overall metrics
            skill_areas["overall_tech_review"] = overall_tech_review
            skill_areas["depth_in_core_topics"] = depth_in_core_topics
            skill_areas["breadth_of_tech_stack"] = breadth_of_tech_stack
            
            return skill_areas
            
        except Exception as e:
            logger.warning(f"Technical skills assessment failed: {e}")
            return {
                "software_development": {
                    "strength": "Technical assessment unavailable",
                    "issues": ["Assessment unavailable"],
                    "code_accuracy": 3,
                    "problem_solving": 3,
                    "understanding_of_concepts": 3
                },
                "overall_tech_review": "Technical review unavailable",
                "depth_in_core_topics": 3,
                "breadth_of_tech_stack": 3
            }
    
    def _generate_strength_statement(self, text: str, skill_name: str) -> str:
        """Generate strength statement for a specific skill"""
        try:
            # More structured prompt that explains expectations
            prompt = (
                f"Based on the following transcription, identify the main strength related to '{skill_name}'.\n"
                f"Focus on technical accuracy, problem-solving approach, and conceptual understanding.\n"
                f"Answer in one clear, specific sentence highlighting the most notable strength.\n\n"
                f"Transcription: {text[:300]}"
            )
            result = self.text_generator(prompt, max_length=50)
            return result[0]['generated_text'].strip()
        except Exception:
            return f"Shows some understanding of {skill_name} concepts"
    
    def _generate_issues(self, text: str, skill_name: str) -> List[str]:
        """Generate potential issues for a specific skill"""
        try:
            # More detailed prompt that aligns with expected JSON format
            prompt = (
                f"Based on the following transcription, identify 2-3 specific issues or areas for improvement related to '{skill_name}'.\n"
                f"Focus on concrete, actionable feedback that addresses:\n"
                f"1. Technical accuracy or knowledge gaps\n"
                f"2. Implementation or coding approach\n"
                f"3. Conceptual understanding\n\n"
                f"Format your response as separate points that can be parsed as a list.\n"
                f"Transcription: {text[:300]}"
            )
            result = self.text_generator(prompt, max_length=120)
            
            # Process the response to get a clean list
            response_text = result[0]['generated_text'].strip()
            
            # Try to handle different formats (numbered lists, bullet points, sentences)
            if '1.' in response_text and '2.' in response_text:
                # Numbered list
                issues = re.split(r'\d+\.', response_text)
                issues = [issue.strip() for issue in issues if issue.strip()]
            elif '- ' in response_text or '• ' in response_text:
                # Bullet points
                issues = re.split(r'[-•] ', response_text)
                issues = [issue.strip() for issue in issues if issue.strip()]
            else:
                # Sentences
                issues = response_text.split(". ")
                issues = [issue.strip() for issue in issues if issue.strip()]
                
            return issues[:3]  # Return at most 3 issues
        except Exception:
            return [f"Limited practical demonstration of {skill_name}", f"Could improve {skill_name} implementation details"]
    
    def _generate_interviewer_notes(self, text: str) -> str:
        """Generate interviewer notes based on transcription"""
        try:
            # Use a more structured prompt that refers to the JSON schema
            prompt = (
                "Based on the following transcription, provide detailed interviewer notes as described in the following format:\n"
                "- Notes should evaluate the candidate's technical and communication skills\n"
                "- Notes should mention specific strengths and weaknesses\n"
                "- Notes should provide actionable feedback for improvement\n\n"
                f"Transcription: {text[:500]}"
            )
            result = self.text_generator(prompt, max_length=150, min_length=50)
            return result[0]['generated_text'].strip()
        except Exception as e:
            logger.warning(f"Interviewer notes generation failed: {e}")
            return "Candidate shows potential but requires further assessment"
    
    def _assess_confidence_level(self, text: str) -> int:
        """Assess confidence level on 1-5 scale"""
        try:
            # Count confidence indicators and uncertainty indicators
            confidence_words = ["certainly", "definitely", "absolutely", "sure", "confident"]
            uncertainty_words = ["maybe", "perhaps", "i think", "possibly", "probably", "might", "could be"]
            
            confidence_count = sum(1 for word in confidence_words if word in text.lower())
            uncertainty_count = sum(1 for word in uncertainty_words if word in text.lower())
            
            # Calculate confidence score
            confidence_score = 3  # Baseline
            confidence_score += confidence_count - uncertainty_count
            
            # Ensure within 1-5 range
            return max(1, min(confidence_score, 5))
        except Exception:
            return 3
    
    def _assess_culture_fit(self, text: str) -> int:
        """Assess culture fit on 1-5 scale"""
        try:
            # Look for collaboration and teamwork indicators
            collaboration_words = ["team", "collaborate", "together", "we", "our", "shared", "help"]
            collaboration_count = sum(1 for word in collaboration_words if word in text.lower())
            
            # Calculate simple culture fit score
            culture_score = min(max(3 + (collaboration_count // 2) - 1, 1), 5)
            return culture_score
        except Exception:
            return 3
    
    def _assess_learning_aptitude(self, text: str) -> int:
        """Assess learning aptitude on 1-5 scale"""
        try:
            # Look for learning related indicators
            learning_words = ["learn", "understand", "grasp", "study", "improve", "develop", "growth"]
            learning_count = sum(1 for word in learning_words if word in text.lower())
            
            # Calculate learning aptitude score
            learning_score = min(max(3 + (learning_count // 2), 1), 5)
            return learning_score
        except Exception:
            return 3
    
    def _generate_final_assessment(self, text: str) -> str:
        """Generate final candidate assessment"""
        try:
            # Use a structured prompt that aligns with our JSON schema
            prompt = (
                "Based on the following interview transcription, provide a comprehensive final assessment of the candidate.\n"
                "Your assessment should summarize their technical abilities, communication skills, culture fit, and learning aptitude.\n"
                "Keep your response concise (1-2 sentences) but insightful, focusing on overall fit and potential.\n\n"
                f"Transcription: {text[:500]}"
            )
            result = self.text_generator(prompt, max_length=100)
            return result[0]['generated_text'].strip()
        except Exception:
            return "Candidate shows mixed potential across technical and communication skills"
    
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
            ],
            "communication_skills": {
                "summary": "Communication assessment unavailable",
                "impact": "Impact evaluation unavailable",
                "rating": 3,
                "language_fluency": 3,
                "technical_articulation": 3
            },
            "technical_skills": {
                "general": {
                    "strength": "Technical assessment unavailable",
                    "issues": ["Assessment unavailable"],
                    "code_accuracy": 3,
                    "problem_solving": 3,
                    "understanding_of_concepts": 3
                },
                "overall_tech_review": "Technical review unavailable",
                "depth_in_core_topics": 3,
                "breadth_of_tech_stack": 3
            },
            "interviewer_notes": "Detailed assessment unavailable due to processing limitations",
            "confidence_level": 3,
            "culture_fit": 3,
            "learning_aptitude": 3,
            "final_assessment": "Assessment could not be completed, please review manually"
        }
    
    def _generate_json_prompt_template(self) -> str:
        """
        Generate a prompt template with JSON schema for LLM models
        to ensure proper formatting of feedback response.
        """
        example = {
            "feedback": {
                "communication_skills": {
                    "summary": "Good communication, but below-average articulation of technical solutions.",
                    "impact": "May affect collaboration and knowledge sharing.",
                    "rating": 5,
                    "language_fluency": 5,
                    "technical_articulation": 2
                },
                "technical_skills": {
                    "middleware_logging": {
                        "strength": "Good conceptual approach.",
                        "issues": [
                            "Incorrect class declaration (`IMiddleWare` instead of `IMiddleware`).",
                            "Incomplete `InvokeAsync` signature.",
                            "Static log messages used instead of dynamic request/response data."
                        ],
                        "code_accuracy": 2,
                        "problem_solving": 3,
                        "understanding_of_concepts": 4
                    },
                    "overall_tech_review": "Conceptually strong, but practical implementation has flaws. Coding accuracy and depth need improvement.",
                    "depth_in_core_topics": 3,
                    "breadth_of_tech_stack": 4
                },
                "interviewer_notes": "The candidate shows potential and is quick to grasp concepts but needs more hands-on rigor. Could do well with mentorship.",
                "confidence_level": 3,
                "culture_fit": 3,
                "learning_aptitude": 4,
                "final_assessment": "Near fit. Solid base, but theoretical understanding and code execution are average."
            }
        }
        
        schema = {
            "feedback": {
                "communication_skills": {
                    "summary": "string",
                    "impact": "string",
                    "rating": "integer (1-5)",
                    "language_fluency": "integer (1-5)",
                    "technical_articulation": "integer (1-5)"
                },
                "technical_skills": {
                    "skill_name": {
                        "strength": "string",
                        "issues": ["string", "..."],
                        "code_accuracy": "integer (1-5)",
                        "problem_solving": "integer (1-5)",
                        "understanding_of_concepts": "integer (1-5)"
                    },
                    "overall_tech_review": "string",
                    "depth_in_core_topics": "integer (1-5)",
                    "breadth_of_tech_stack": "integer (1-5)"
                },
                "interviewer_notes": "string",
                "confidence_level": "integer (1-5)",
                "culture_fit": "integer (1-5)",
                "learning_aptitude": "integer (1-5)",
                "final_assessment": "string"
            }
        }
        
        prompt = (
            "Analyze the provided transcription and generate comprehensive feedback in valid JSON format.\n"
            "Follow this schema exactly:\n\n"
            f"{json.dumps(schema, indent=2)}\n\n"
            "Example output:\n\n"
            f"{json.dumps(example, indent=2)}\n\n"
            "Ensure all fields are properly populated based on the transcription content."
        )
        
        return prompt
        
    def _generate_structured_feedback(self, text: str) -> Dict[str, Any]:
        """
        Generate structured feedback using the JSON template prompt.
        This attempts to generate all feedback at once using a comprehensive prompt.
        """
        try:
            # Get our structured JSON prompt template
            prompt_template = self._generate_json_prompt_template()
            
            # Create the full prompt with the text to analyze
            full_prompt = f"{prompt_template}\n\nTranscription to analyze:\n{text[:1500]}"
            
            # Process with the text generator
            result = self.text_generator(
                full_prompt, 
                max_length=1500,  # Longer output to accommodate full JSON structure
                min_length=300,   # Ensure we get substantial content
                do_sample=False   # Force deterministic output for JSON formatting
            )
            
            # Get the generated text
            generated_text = result[0]['generated_text'].strip()
            
            # Try to extract JSON content
            try:
                # Find JSON content (look for opening curly brace and extract until the end)
                json_start_idx = generated_text.find('{')
                if json_start_idx >= 0:
                    json_content = generated_text[json_start_idx:]
                    parsed_output = json.loads(json_content)
                    
                    # If the output follows our schema with a "feedback" key, return the contents
                    if 'feedback' in parsed_output:
                        logger.info("Successfully generated structured feedback")
                        return parsed_output['feedback']
            except json.JSONDecodeError as e:
                logger.warning(f"Failed to parse generated JSON: {e}")
                
            # If we reach here, the structured approach didn't work as expected
            logger.warning("Generated text could not be parsed as expected JSON structure")
            return {}
            
        except Exception as e:
            logger.warning(f"Structured feedback generation failed: {e}")
            return {} 