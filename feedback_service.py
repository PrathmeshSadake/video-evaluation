import json
import logging
from typing import Dict, Any
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from config import settings

logger = logging.getLogger(__name__)

class FeedbackService:
    def __init__(self):
        """Initialize OpenAI model for feedback analysis"""
        logger.info("Initializing OpenAI model for feedback analysis...")
        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.7,
            openai_api_key=settings.OPENAI_API_KEY
        )
        logger.info("OpenAI model initialized successfully")

    def generate_feedback(self, transcription_text: str) -> Dict[str, Any]:
        """Generate comprehensive feedback based on transcription using OpenAI"""
        try:
            logger.info("Generating feedback using OpenAI...")

            # Define the JSON schema and example for the prompt
            schema = {
                "feedback": {
                    "overall_sentiment": "positive/neutral/negative",
                    "key_topics": ["general content"],
                    "summary": "Content analysis completed. Detailed feedback unavailable due to processing limitations.",
                    "recommendations": [
                        "Consider reviewing content for clarity",
                        "Ensure key points are well-structured"
                    ],
                    "quality_score": 0.5,
                    "word_count": "integer",
                    "content_analysis": {
                        "clarity": "high/medium/low",
                        "engagement": "high/medium/low",
                        "information_density": "high/medium/low",
                        "speaker_confidence": "high/medium/low"
                    },
                    "speaking_patterns": {
                        "pace": "fast/medium/slow",
                        "filler_words": 0,
                        "repetitions": 0,
                        "technical_terms": []
                    },
                    "actionable_insights": [
                        "Basic transcription completed successfully",
                        "Content contains word count details"
                    ],
                    "questions": [
                        {
                            "question": "string - The interview question asked",
                            "answer": "string - Candidate's response",
                            "rating": "integer (1-5) - Quality of answer",
                            "feedback": "string - Specific feedback on this answer"
                        }
                    ],
                    "communication_skills": {
                        "summary": "string - Brief evaluation of communication abilities",
                        "impact": "string - How these skills affect collaboration",
                        "rating": "integer (1-5) - Overall communication rating",
                        "language_fluency": "integer (1-5) - Language proficiency",
                        "technical_articulation": "integer (1-5) - Ability to explain technical concepts"
                    },
                    "technical_skills": {
                        "skills": [
                            {
                                "backend_development": {
                                    "strength": "Excellent understanding of API design and scalability",
                                    "issues": [
                                        "Could improve error handling patterns",
                                        "Database optimization knowledge needs enhancement"
                                    ],
                                    "code_accuracy": 4,
                                    "problem_solving": 5,
                                    "understanding_of_concepts": 4
                                }
                            }
                        ],
                        "overall_tech_review": "Strong backend developer with good architecture skills",
                        "depth_in_core_topics": 4,
                        "breadth_of_tech_stack": 4
                    },
                    "interviewer_notes": "string - Key observations and recommendations",
                    "confidence_level": "integer (1-5) - Overall confidence rating",
                    "culture_fit": "integer (1-5) - Team/culture compatibility",
                    "learning_aptitude": "integer (1-5) - Learning/adaptability rating",
                    "final_assessment": "string - Final evaluation and recommendation"
                }
            }

            example = {
                "feedback": {
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
                        "clarity": "high/medium/low",
                        "engagement": "high/medium/low",
                        "information_density": "high/medium/low",
                        "speaker_confidence": "high/medium/low"
                    },
                    "speaking_patterns": {
                        "pace": "fast/medium/slow",
                        "filler_words": 0,
                        "repetitions": 0,
                        "technical_terms": []
                    },
                    "actionable_insights": [
                        "Basic transcription completed successfully",
                        f"Content contains {word_count} words"
                    ],
                    "questions": [
                        {
                            "question": "Can you explain how you would design a scalable microservice architecture?",
                            "answer": "I would start by identifying bounded contexts and designing services around business domains. For scalability, I'd implement asynchronous communication using message queues, ensure statelessness, and use container orchestration like Kubernetes.",
                            "rating": 4,
                            "feedback": "Strong understanding of microservice principles and scalability concerns. Could have elaborated more on data consistency challenges."
                        },
                        {
                            "question": "How would you handle database optimization for high-traffic applications?",
                            "answer": "I'd focus on indexing strategies, query optimization, and implementing caching layers. For write-heavy applications, I'd consider sharding and read replicas.",
                            "rating": 3,
                            "feedback": "Good basic knowledge but lacks depth on specific optimization techniques and monitoring strategies."
                        }
                    ],
                    "communication_skills": {
                        "summary": "Strong verbal communication with clear technical explanations",
                        "impact": "Would effectively collaborate in team settings and mentor juniors",
                        "rating": 4,
                        "language_fluency": 5,
                        "technical_articulation": 4
                    },
                    "technical_skills": {
                        "skills": [
                            {
                                "backend_development": {
                                    "strength": "Excellent understanding of API design and scalability",
                                    "issues": [
                                        "Could improve error handling patterns",
                                        "Database optimization knowledge needs enhancement"
                                    ],
                                    "code_accuracy": 4,
                                    "problem_solving": 5,
                                    "understanding_of_concepts": 4
                                }
                            }
                        ],
                        "overall_tech_review": "Strong backend developer with good architecture skills",
                        "depth_in_core_topics": 4,
                        "breadth_of_tech_stack": 4
                    },
                    "interviewer_notes": "Strong candidate with leadership potential. Recommend for senior role.",
                    "confidence_level": 4,
                    "culture_fit": 5,
                    "learning_aptitude": 4,
                    "final_assessment": "Highly recommended. Technical strength and communication skills align well with our needs."
                }
            }

            # Create the prompt template
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are an expert technical interviewer and feedback analyst.
                Your task is to analyze the provided interview transcription and generate detailed feedback.
                Follow the JSON schema exactly and ensure all ratings are integers from 1-5.
                Focus on both technical and soft skills, providing specific examples from the transcription.
                
                Use this JSON schema:
                {schema}
                
                Here's an example of good feedback:
                {example}
                
                Provide your feedback in valid JSON format following the exact same structure."""),
                ("user", "Here's the transcription to analyze:\n{transcription}")
            ])

            # Format the prompt with our schema, example, and transcription
            formatted_prompt = prompt.format_messages(
                schema=json.dumps(schema, indent=2),
                example=json.dumps(example, indent=2),
                transcription=transcription_text
            )

            # Get response from OpenAI
            response = self.llm.invoke(formatted_prompt)
            
            try:
                # Parse the response to extract JSON
                response_text = response.content
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = response_text[json_start:json_end]
                    feedback_data = json.loads(json_str)
                    if 'feedback' in feedback_data:
                        logger.info("Successfully generated structured feedback")
                        return feedback_data['feedback']
                    
                logger.warning("Response did not contain expected 'feedback' key")
                return self._get_fallback_feedback(transcription_text)
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON from response: {e}")
                return self._get_fallback_feedback(transcription_text)
                
        except Exception as e:
            logger.error(f"Error generating feedback: {str(e)}")
            return self._get_fallback_feedback(transcription_text)

    def _get_fallback_feedback(self, transcription_text: str) -> Dict[str, Any]:
        """Provide basic fallback feedback when OpenAI fails"""
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
            "questions": [
                {
                    "question": "Assessment unavailable",
                    "answer": "Assessment unavailable",
                    "rating": 3,
                    "feedback": "Question-answer assessment unavailable due to processing limitations"
                }
            ],
            "communication_skills": {
                "summary": "Communication assessment unavailable",
                "impact": "Impact evaluation unavailable",
                "rating": 3,
                "language_fluency": 3,
                "technical_articulation": 3
            },
            "technical_skills": {
                "skills": [
                    {
                        "general": {
                            "strength": "Technical assessment unavailable",
                            "issues": ["Assessment unavailable"],
                            "code_accuracy": 3,
                            "problem_solving": 3,
                            "understanding_of_concepts": 3
                        }
                    }
                ],
                "overall_tech_review": "Technical review unavailable",
                "depth_in_core_topics": 3,
                "breadth_of_tech_stack": 3
            },
            "interviewer_notes": "Assessment unavailable due to processing limitations",
            "confidence_level": 3,
            "culture_fit": 3,
            "learning_aptitude": 3,
            "final_assessment": "Assessment could not be completed, please review manually"
        }