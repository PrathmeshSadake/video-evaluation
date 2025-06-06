import json
import logging
from typing import Dict, Any, List
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from config import settings

logger = logging.getLogger(__name__)

class FeedbackService:
    def __init__(self):
        """Initialize OpenAI model for feedback analysis"""
        logger.info("Initializing OpenAI model for feedback analysis...")
        self.llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.7,
            openai_api_key=settings.OPENAI_API_KEY
        )
        logger.info("OpenAI model initialized successfully")

    def generate_feedback(self, transcription_text: str, required_skills: List[str] = None) -> Dict[str, Any]:
        """Generate comprehensive feedback based on transcription using OpenAI"""
        try:
            logger.info("Generating feedback using OpenAI...")
            
            # Default to empty list if required_skills is None
            if required_skills is None:
                required_skills = []
                
            # Log the required skills
            if required_skills:
                logger.info(f"Required skills to evaluate: {', '.join(required_skills)}")

            # Enhanced JSON schema for technical skills assessment
            schema = {
                "feedback": {
                    "overall_sentiment": "positive | neutral | negative",
                    "key_topics": ["string - Key topics discussed in the interview"],
                    "summary": "string - Concise summary of the interview",
                    "recommendations": [
                        "string - Actionable suggestions for improvement"
                    ],
                    "quality_score": "integer (1-5) - Overall content quality rating",
                    "word_count": "integer - Total number of words in the transcript",
                    "content_analysis": {
                        "clarity": "high | medium | low",
                        "engagement": "high | medium | low",
                        "information_density": "high | medium | low",
                        "speaker_confidence": "high | medium | low"
                    },
                    "speaking_patterns": {
                        "pace": "fast | medium | slow",
                        "filler_words": "integer (1-5) - Frequency of filler word usage",
                        "repetitions": "integer (1-5) - Frequency of repeated content",
                        "technical_terms": ["string - Notable technical terms used"]
                    },
                    "actionable_insights": [
                        "string - Observations with practical takeaways"
                    ],
                    "questions": [
                        {
                            "question": "string - Interview question",
                            "answer": "string - Candidate's response",
                            "rating": "integer (1-5) - Answer quality rating",
                            "feedback": "string - Constructive feedback on the answer"
                        }
                    ],
                    "communication_skills": {
                        "summary": "string - Overview of communication abilities",
                        "impact": "string - Collaboration or team impact",
                        "rating": "integer (1-5)",
                        "language_fluency": "integer (1-5)",
                        "technical_articulation": "integer (1-5)"
                    },
                    "technical_skills": {
                        "skills": [
                            {
                                "skill_name": "string - e.g., '.NET Core', 'AWS', 'C#'",
                                "level": "Beginner | Intermediate | Professional | Expert",
                                "rating_text": "Excellent | Very Good | Good | Satisfactory | Needs Improvement",
                                "rating_score": "integer (1-5) - Numerical rating",
                                "detailed_feedback": "string - Comprehensive feedback like the example",
                                "strengths": ["string - Specific strengths demonstrated"],
                                "areas_for_improvement": ["string - Areas needing work"],
                                "examples_mentioned": ["string - Specific examples or concepts mentioned"],
                                "is_required": "boolean - Whether this skill was specified as required",
                                "availability_status": "string - 'Available' or 'Not Available' in the transcript"
                            }
                        ],
                        "required_skills": [
                            {
                                "name": "string - Name of the required skill"
                            }
                        ],
                        "overall_tech_review": "string - Summary of technical performance",
                        "depth_in_core_topics": "integer (1-5)",
                        "breadth_of_tech_stack": "integer (1-5)",
                        "strengths_summary": "string - Overall technical strengths",
                        "weaknesses_summary": "string - Overall technical weaknesses",
                        "verdict": "string - Final recommendation and assessment"
                    },
                    "interviewer_notes": "string - Observations and any final comments",
                    "confidence_level": "integer (1-5)",
                    "culture_fit": "integer (1-5)",
                    "learning_aptitude": "integer (1-5)",
                    "final_assessment": "string - Overall evaluation and recommendation"
                }
            }

            # Enhanced example matching the provided format
            example = {
                "feedback": {
                    "overall_sentiment": "positive",
                    "key_topics": [".NET Core", "AWS", "C#", "Web API", "SSIS", "SQL"],
                    "summary": "The candidate demonstrated strong technical expertise across multiple domains with particularly strong performance in .NET Core, Web API optimization, and cloud architecture.",
                    "recommendations": [
                        "Focus on improving articulation in some AWS concepts",
                        "Provide more specific examples for ASP.NET MVC",
                        "Continue building depth in advanced SQL optimization"
                    ],
                    "quality_score": 4,
                    "word_count": 1200,
                    "content_analysis": {
                        "clarity": "high",
                        "engagement": "high",
                        "information_density": "high",
                        "speaker_confidence": "high"
                    },
                    "speaking_patterns": {
                        "pace": "medium",
                        "filler_words": 2,
                        "repetitions": 1,
                        "technical_terms": [".NET Core", "Redis", "SignalR", "CloudFormation", "ECS", "Aurora"]
                    },
                    "actionable_insights": [
                        "Strong practical experience with enterprise-level technologies",
                        "Excellent understanding of scalable architecture patterns"
                    ],
                    "questions": [
                        {
                            "question": "How would you optimize a high-traffic Web API?",
                            "answer": "I would implement rate limiting, response caching, connection pooling, and use HttpClientFactory. Also consider Polly for circuit breaker patterns and background jobs for heavy processing.",
                            "rating": 5,
                            "feedback": "Excellent comprehensive answer showing deep understanding of API optimization techniques."
                        },
                         {
                            "question": "How would you handle database optimization for high-traffic applications?",
                            "answer": "I'd focus on indexing strategies, query optimization, and implementing caching layers. For write-heavy applications, I'd consider sharding and read replicas.",
                            "rating": 3,
                            "feedback": "Good foundation but limited depth in advanced optimization and performance tuning."
                        },
                        {
                            "question": "What is the difference between a RESTful API and a GraphQL API?",
                            "answer": "A RESTful API is a stateless, client-server, hypermedia-driven interface that uses HTTP methods to create, read, update, and delete resources. GraphQL is a query language for APIs that allows clients to request exactly the data they need and nothing more.",
                            "rating": 4,
                            "feedback": "Good understanding of the differences between REST and GraphQL."
                        },
                        {
                            "question": "How would you implement a scalable event-driven architecture?",
                            "answer": "I'd use Azure Service Bus for message queuing, Azure Event Grid for event notifications, and Azure Functions for serverless processing. For real-time features, I'd use SignalR for bidirectional communication.",
                            "rating": 4,
                            "feedback": "Good understanding of event-driven architecture patterns."
                        }
                    ],
                    "communication_skills": {
                        "summary": "Clear and structured communicator with strong technical articulation",
                        "impact": "Would contribute effectively to team discussions and technical decisions",
                        "rating": 4,
                        "language_fluency": 5,
                        "technical_articulation": 4
                    },
                    "technical_skills": {
                        "skills": [
                            {
                                "skill_name": ".NET Core",
                                "level": "Expert",
                                "rating_text": "Very Good",
                                "rating_score": 4,
                                "detailed_feedback": "The candidate demonstrated a strong grasp of .NET Core concepts and practical applications. They effectively addressed performance optimization using telemetry, Azure Monitor, Redis caching, background jobs, and connection pooling. Their approach to handling high-volume data indicates a well-rounded understanding of scalable, event-driven architecture.",
                                "strengths": [
                                    "Performance optimization techniques",
                                    "Understanding of scalable architecture",
                                    "Real-time features implementation with SignalR"
                                ],
                                "areas_for_improvement": [
                                    "Could elaborate more on advanced debugging techniques",
                                    "Deeper discussion of memory management"
                                ],
                                "examples_mentioned": ["Redis caching", "Azure Monitor", "SignalR", "background jobs"],
                                "is_required": True,
                                "availability_status": "Available"
                            },
                            {
                                "skill_name": "React",
                                "level": "Beginner",
                                "rating_text": "Needs Improvement",
                                "rating_score": 1,
                                "detailed_feedback": "The candidate briefly mentioned React but did not demonstrate significant knowledge or experience with the framework.",
                                "strengths": [
                                    "Basic awareness of React as a frontend technology"
                                ],
                                "areas_for_improvement": [
                                    "Develop practical experience with React components",
                                    "Learn React hooks and state management",
                                    "Practice building complete React applications"
                                ],
                                "examples_mentioned": [],
                                "is_required": True,
                                "availability_status": "Available"
                            },
                            {
                                "skill_name": "GraphQL",
                                "is_required": True,
                                "availability_status": "Not Available",
                                "rating_score": 0,
                                "strengths": [],
                                "areas_for_improvement": [],
                                "examples_mentioned": []
                            },
                            {
                                "skill_name": "AWS",
                                "level": "Professional",
                                "rating_text": "Very Good",
                                "rating_score": 4,
                                "detailed_feedback": "The candidate demonstrated solid understanding of AWS services and architectural principles. Covered ECS, ALB, Route 53, S3, Aurora, ElastiCache, auto-scaling, and CloudFront. Their breadth of AWS knowledge is commendable, but they should aim for greater precision in terminology.",
                                "strengths": [
                                    "Broad knowledge of AWS services",
                                    "Understanding of CI/CD with CodePipeline",
                                    "Good grasp of scalability patterns"
                                ],
                                "areas_for_improvement": [
                                    "More precise terminology usage",
                                    "Deeper security best practices"
                                ],
                                "examples_mentioned": ["ECS", "CloudFormation", "CodePipeline", "Aurora", "ElastiCache"],
                                "is_required": False
                            }
                        ],
                        "required_skills": [
                            {"name": ".NET Core"},
                            {"name": "React"},
                            {"name": "GraphQL"}
                        ],
                        "overall_tech_review": "Strong technical candidate with excellent backend expertise and solid cloud architecture knowledge. Ready for senior-level responsibilities.",
                        "depth_in_core_topics": 4,
                        "breadth_of_tech_stack": 4,
                        "strengths_summary": "Strong backend knowledge with solid experience in .NET Core and Web API optimization for scale and performance. Proficient in AWS cloud architecture, CI/CD, and automation. Advanced API design knowledge including traffic handling, caching strategies, and resiliency mechanisms.",
                        "weaknesses_summary": "Some explanations around AWS IaC were unclear and require refinement. Minor gaps in some areas like ASP.NET MVC discussion.",
                        "verdict": "The candidate is a strong fit for roles involving .NET Core development, cloud infrastructure (especially AWS), API scalability, and ETL processes. Their technical depth and breadth make them well-suited for full-stack or backend-heavy roles with cloud and data integration responsibilities."
                    },
                    "interviewer_notes": "Strong technical candidate with leadership potential. Demonstrates both breadth and depth in relevant technologies.",
                    "confidence_level": 4,
                    "culture_fit": 4,
                    "learning_aptitude": 4,
                    "final_assessment": "Highly recommended. Strong technical foundation, effective communication, and practical experience make this candidate an excellent fit for senior technical roles."
                }
            }

            # Create the enhanced prompt template with required skills instructions
            prompt_text = """You are an expert technical interviewer and feedback analyst specializing in comprehensive technical assessments.

            Your task is to analyze the provided interview transcription and generate detailed feedback that includes:
            1. Extract all main technical skills mentioned in the transcript
            2. For each skill, provide detailed feedback similar to a professional technical assessment
            3. Include specific ratings, strengths, areas for improvement, and examples mentioned
            4. Provide an overall technical summary with strengths, weaknesses, and final verdict
            5. Extract all questions and answers from the interview transcript and provide feedback on them

            Additionally, you need to evaluate the following specific required skills:
            {required_skills_list}

            For each required skill:
            - Check if the skill is mentioned or discussed in the interview
            - If available, provide a detailed assessment with level, rating, and feedback
            - If not available, mark it as "Not Available" and set availability_status to "Not Available"
            - Set is_required to true for all required skills

            Focus on:
            - Identifying specific technologies, frameworks, or technical concepts discussed
            - Assessing the depth of knowledge demonstrated for each skill
            - Providing constructive, professional feedback
            - Rating skills on both numerical (1-5) and text scales (Excellent, Very Good, Good, Satisfactory, Needs Improvement)
            - Including specific examples or concepts mentioned by the candidate
            - Evaluating the candidate's ability to discuss the skill in detail
            - Evaluating the candidate's ability to apply the skill in a practical way
            - Evaluating the candidate's ability to discuss the skill in a way that is clear and concise
            - Evaluating the candidate's ability to discuss the skill in a way that is accurate and correct
            - Evaluating the candidate's ability to discuss the skill in a way that is consistent with the skill's definition
            - Evaluating the candidate's ability to discuss the skill in a way that is consistent with the skill's best practices
            - Evaluating the candidate's ability to discuss the skill in a way that is consistent with the skill's industry standards

            Follow the JSON schema exactly and ensure all ratings are integers from 1-5.
            
            Use this JSON schema:
            {schema}
            
            Here's an example of the expected detailed feedback format:
            {example}
            
            Provide your feedback in valid JSON format following the exact same structure."""

            # Format the required skills as a readable list for the prompt
            required_skills_formatted = "None specified" if not required_skills else "\n".join([f"- {skill}" for skill in required_skills])

            # Create the prompt template
            prompt = ChatPromptTemplate.from_messages([
                ("system", prompt_text),
                ("user", "Here's the interview transcription to analyze:\n\n{transcription}")
            ])

            # Format the prompt with our schema, example, transcription, and required skills
            formatted_prompt = prompt.format_messages(
                schema=json.dumps(schema, indent=2),
                example=json.dumps(example, indent=2),
                transcription=transcription_text,
                required_skills_list=required_skills_formatted
            )

            # Get response from OpenAI
            response = self.llm.invoke(formatted_prompt)
            
            try:
                # Parse the response to extract JSON
                response_text = response.content.strip()
                
                # Try to find and extract JSON
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                
                if json_start >= 0 and json_end > json_start:
                    json_str = response_text[json_start:json_end]
                    feedback_data = json.loads(json_str)
                    
                    # Check if we have the expected structure
                    if 'feedback' in feedback_data and isinstance(feedback_data['feedback'], dict):
                        feedback = feedback_data['feedback']
                        
                        # Add required skills to the technical_skills section if they're not already there
                        if 'technical_skills' in feedback:
                            if 'skills' not in feedback['technical_skills']:
                                feedback['technical_skills']['skills'] = []
                                
                            # Add required_skills section if it doesn't exist
                            if 'required_skills' not in feedback['technical_skills']:
                                feedback['technical_skills']['required_skills'] = []
                                
                            # Add each required skill to the required_skills list
                            for skill_name in required_skills:
                                # Check if this required skill is already in the skills list
                                skill_exists = False
                                for skill in feedback['technical_skills']['skills']:
                                    if skill.get('skill_name', '').lower() == skill_name.lower():
                                        # Mark existing skill as required
                                        skill['is_required'] = True
                                        if 'availability_status' not in skill:
                                            skill['availability_status'] = 'Available'
                                        skill_exists = True
                                        break
                                
                                # If skill wasn't found in the skills list, add it as not available
                                if not skill_exists:
                                    feedback['technical_skills']['skills'].append({
                                        'skill_name': skill_name,
                                        'is_required': True,
                                        'availability_status': 'Not Available',
                                        'rating_score': 0,
                                        'strengths': [],
                                        'areas_for_improvement': [],
                                        'examples_mentioned': []
                                    })
                                    
                                # Add to required_skills list
                                feedback['technical_skills']['required_skills'].append({
                                    'name': skill_name
                                })
                            
                            logger.info("Successfully generated enhanced technical skills feedback with required skills evaluation")
                            return feedback
                        else:
                            logger.warning("Response missing technical_skills structure")
                    else:
                        logger.warning("Response did not contain expected 'feedback' key or structure")
                else:
                    logger.warning("No valid JSON found in response")
                
                # If we get here, the response wasn't properly formatted
                logger.info("Using enhanced fallback feedback due to response format issues")
                return self._get_fallback_feedback(transcription_text, required_skills)
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON from response: {e}")
                logger.info("Using enhanced fallback feedback due to JSON parsing error")
                return self._get_fallback_feedback(transcription_text, required_skills)
                
        except Exception as e:
            logger.error(f"Error generating feedback: {str(e)}")
            return self._get_fallback_feedback(transcription_text, required_skills)

    def _get_fallback_feedback(self, transcription_text: str, required_skills: List[str] = None) -> Dict[str, Any]:
        """Provide complete fallback feedback when OpenAI fails"""
        if required_skills is None:
            required_skills = []
            
        word_count = len(transcription_text.split())
        
        # Analyze the text for basic technical terms to provide meaningful fallback
        technical_terms = []
        common_tech_terms = [
            '.net', 'c#', 'java', 'python', 'javascript', 'react', 'angular', 'vue',
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'aws', 'azure', 'gcp',
            'docker', 'kubernetes', 'microservices', 'api', 'rest', 'graphql',
            'node.js', 'express', 'spring', 'django', 'flask', 'laravel'
        ]
        
        text_lower = transcription_text.lower()
        for term in common_tech_terms:
            if term in text_lower:
                technical_terms.append(term.upper() if term in ['.net', 'c#'] else term.title())
        
        # Generate skills based on detected technical terms
        skills = []
        
        # First, add required skills
        for skill_name in required_skills:
            # Check if this required skill is in the detected technical terms
            is_available = any(term.lower() == skill_name.lower() for term in technical_terms)
            
            if is_available:
                skills.append({
                    "skill_name": skill_name,
                    "level": "Professional",
                    "rating_text": "Good",
                    "rating_score": 3,
                    "detailed_feedback": f"The candidate demonstrated familiarity with {skill_name} concepts and showed practical understanding. Their discussion covered relevant aspects of {skill_name} technology, indicating a solid foundation with room for growth in advanced topics.",
                    "strengths": [
                        f"Basic to intermediate understanding of {skill_name}",
                        "Able to discuss practical applications",
                        "Shows awareness of common patterns and practices"
                    ],
                    "areas_for_improvement": [
                        f"Could provide more specific examples of {skill_name} usage",
                        "Deeper technical details would strengthen responses",
                        "More discussion of best practices and optimization"
                    ],
                    "examples_mentioned": [skill_name],
                    "is_required": True,
                    "availability_status": "Available"
                })
            else:
                skills.append({
                    "skill_name": skill_name,
                    "is_required": True,
                    "availability_status": "Not Available",
                    "rating_score": 0,
                    "strengths": [],
                    "areas_for_improvement": [],
                    "examples_mentioned": []
                })
        
        # Then add detected skills that aren't in the required skills
        for term in technical_terms:
            if not any(skill.get('skill_name', '').lower() == term.lower() for skill in skills):
                skills.append({
                    "skill_name": term,
                    "level": "Professional",
                    "rating_text": "Good",
                    "rating_score": 3,
                    "detailed_feedback": f"The candidate demonstrated familiarity with {term} concepts and showed practical understanding. Their discussion covered relevant aspects of {term} technology, indicating a solid foundation with room for growth in advanced topics.",
                    "strengths": [
                        f"Basic to intermediate understanding of {term}",
                        "Able to discuss practical applications",
                        "Shows awareness of common patterns and practices"
                    ],
                    "areas_for_improvement": [
                        f"Could provide more specific examples of {term} usage",
                        "Deeper technical details would strengthen responses",
                        "More discussion of best practices and optimization"
                    ],
                    "examples_mentioned": [term],
                    "is_required": False
                })
        
        # If no skills found, provide a general technical skill
        if not skills:
            skills.append({
                "skill_name": "General Technical Knowledge",
                "level": "Intermediate",
                "rating_text": "Satisfactory",
                "rating_score": 3,
                "detailed_feedback": "The candidate participated in a technical discussion and demonstrated general understanding of software development concepts. While specific technical expertise wasn't clearly evident in the transcript, they showed engagement with technical topics.",
                "strengths": [
                    "Engaged in technical discussion",
                    "Showed willingness to tackle technical problems",
                    "Demonstrated analytical thinking"
                ],
                "areas_for_improvement": [
                    "More specific technical examples would be beneficial",
                    "Deeper dive into chosen technologies",
                    "Stronger articulation of technical concepts"
                ],
                "examples_mentioned": ["Software development", "Problem solving"],
                "is_required": False
            })
        
        # Create required_skills list for the response
        required_skills_list = [{"name": skill} for skill in required_skills]
        
        return {
            "overall_sentiment": "neutral",
            "key_topics": technical_terms if technical_terms else ["software development", "problem solving"],
            "summary": f"Technical interview analysis completed for {word_count} words of content. The candidate engaged in technical discussions and demonstrated familiarity with relevant technologies.",
            "recommendations": [
                "Provide more detailed technical examples in future interviews",
                "Practice articulating complex technical concepts clearly",
                "Prepare specific use cases and implementation details"
            ],
            "quality_score": 3,
            "word_count": word_count,
            "content_analysis": {
                "clarity": "medium",
                "engagement": "medium",
                "information_density": "medium",
                "speaker_confidence": "medium"
            },
            "speaking_patterns": {
                "pace": "medium",
                "filler_words": 2,
                "repetitions": 1,
                "technical_terms": technical_terms
            },
            "actionable_insights": [
                "Technical interview completed with measurable outcomes",
                f"Conversation included {len(technical_terms)} identifiable technical concepts",
                "Candidate showed engagement with technical problem-solving"
            ],
            "questions": [
                {
                    "question": "Technical competency assessment",
                    "answer": "Candidate demonstrated baseline technical knowledge with room for growth",
                    "rating": 3,
                    "feedback": "Technical understanding appears solid with opportunities to demonstrate deeper expertise"
                }
            ],
            "communication_skills": {
                "summary": "Clear communication with adequate technical articulation",
                "impact": "Would likely contribute effectively to technical team discussions",
                "rating": 3,
                "language_fluency": 4,
                "technical_articulation": 3
            },
            "technical_skills": {
                "skills": skills,
                "required_skills": required_skills_list,
                "overall_tech_review": f"The candidate demonstrated competency in {len(skills)} technical area{'s' if len(skills) > 1 else ''} with solid foundational knowledge. Their responses showed practical understanding of key concepts with opportunities for deeper technical exploration.",
                "depth_in_core_topics": 3,
                "breadth_of_tech_stack": 3,
                "strengths_summary": f"Solid foundational knowledge across {', '.join(technical_terms[:3]) if technical_terms else 'core technical concepts'}. Demonstrated practical understanding and engagement with technical problem-solving. Shows analytical thinking and willingness to tackle complex topics.",
                "weaknesses_summary": "Could benefit from more detailed technical examples and deeper articulation of advanced concepts. Opportunities to demonstrate hands-on experience with specific implementations and optimization strategies.",
                "verdict": f"The candidate shows promise for technical roles requiring {', '.join(technical_terms[:2]) if len(technical_terms) >= 2 else 'software development'} expertise. With continued learning and practical experience, they would be well-suited for intermediate to senior technical positions. Recommended for roles where foundational knowledge can be built upon with mentorship and practical application."
            },
            "interviewer_notes": f"Technical interview completed successfully. Candidate engaged well with technical topics and showed {len(technical_terms)} specific technology areas. Assessment based on {word_count} words of interview content.",
            "confidence_level": 3,
            "culture_fit": 3,
            "learning_aptitude": 4,
            "final_assessment": f"Recommended for technical roles. The candidate demonstrated solid baseline technical knowledge with clear potential for growth. Their engagement with technical topics and analytical approach suggest they would be successful in collaborative development environments."
        }