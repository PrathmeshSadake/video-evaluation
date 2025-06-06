import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFViewer,
  PDFDownloadLink,
  Font,
  Image
} from '@react-pdf/renderer';

// Types from main component
interface RequiredSkill {
  name: string;
}

interface TechnicalSkill {
  skill_name: string;
  level: string;
  rating_text: string;
  rating_score: number;
  detailed_feedback: string;
  strengths: string[];
  areas_for_improvement: string[];
  examples_mentioned: string[];
  is_required?: boolean;
  availability_status?: string;
}

interface TechnicalSkills {
  skills: TechnicalSkill[];
  required_skills?: RequiredSkill[];
  overall_tech_review: string;
  depth_in_core_topics: number;
  breadth_of_tech_stack: number;
  strengths_summary: string;
  weaknesses_summary: string;
  verdict: string;
}

interface TranscriptionResponse {
  transcription: Array<{
    start_time: number;
    end_time: number;
    text: string;
    confidence: number;
  }>;
  full_text: string;
  duration: number;
  feedback: {
    overall_sentiment: string;
    key_topics: string[];
    summary: string;
    recommendations: string[];
    quality_score: number;
    word_count: number;
    content_analysis: {
      clarity: string;
      engagement: string;
      information_density: string;
      speaker_confidence: string;
    };
    speaking_patterns: {
      pace: string;
      filler_words: number;
      repetitions: number;
      technical_terms: string[];
    };
    actionable_insights: string[];
    questions: Array<{
      question: string;
      answer: string;
      rating: number;
      feedback: string;
    }>;
    communication_skills: {
      summary: string;
      impact: string;
      rating: number;
      language_fluency: number;
      technical_articulation: number;
    };
    technical_skills: TechnicalSkills;
    interviewer_notes: string;
    confidence_level: number;
    culture_fit: number;
    learning_aptitude: number;
    final_assessment: string;
  };
}

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf', fontStyle: 'italic' },
  ]
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Roboto',
  },
  header: {
    backgroundColor: '#4338ca',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerDate: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 5,
  },
  text: {
    fontSize: 10,
    marginBottom: 5,
    color: '#374151',
  },
  bold: {
    fontWeight: 'bold',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 3,
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableRowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
  },
  tableCol: {
    padding: 5,
    flex: 1,
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  summaryText: {
    fontSize: 10,
    color: '#1E40AF',
    fontStyle: 'italic',
  },
  scoreRow: {
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 10,
    flex: 2,
    color: '#374151',
  },
  scoreValue: {
    fontSize: 10,
    flex: 1,
    fontWeight: 'bold',
    color: '#111827',
  },
  scoreBar: {
    flex: 3,
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: '#4338ca',
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 8,
    color: '#FFFFFF',
    backgroundColor: '#4338ca',
    textAlign: 'center',
    marginRight: 4,
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9CA3AF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bullet: {
    width: 10,
    fontSize: 10,
  },
  listItemContent: {
    flex: 1,
    fontSize: 10,
    color: '#374151',
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 8,
    padding: 5,
    backgroundColor: '#F9FAFB',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skillName: {
    fontSize: 10,
    fontWeight: 'bold',
    flex: 2,
    color: '#111827',
  },
  skillLevel: {
    fontSize: 9,
    flex: 1,
    color: '#4B5563',
  },
  skillRating: {
    fontSize: 9,
    flex: 1,
    color: '#4B5563',
  },
  ratingDots: {
    flexDirection: 'row',
    flex: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 2,
  },
  dotFilled: {
    backgroundColor: '#4338ca',
  },
  dotEmpty: {
    backgroundColor: '#E5E7EB',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#9CA3AF',
  },
  flexRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

// Helper function to format time
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Helper to get rating color
const getRatingColor = (rating: number): string => {
  if (rating >= 4) return '#10B981'; // Green
  if (rating >= 3) return '#3B82F6'; // Blue
  if (rating >= 2) return '#F59E0B'; // Amber
  return '#EF4444'; // Red
};
const getDuration = (transcriptionResult: TranscriptionResponse | null) => {
    if (!transcriptionResult) return 0;
    return transcriptionResult.transcription.reduce((acc, segment) => {
      return acc + (segment.end_time - segment.start_time);
    }, 0);
  };

// PDF Document component
const PDFReport = ({ data }: { data: TranscriptionResponse }) => {
  const feedback = data.feedback;
  const duration = getDuration(data);
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Video Analysis Report</Text>
          <Text style={styles.headerDate}>Generated on: {new Date().toLocaleDateString()}</Text>
        </View>

        {/* Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>{feedback.summary}</Text>
          </View>
          
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Quality Score:</Text>
            <View style={styles.scoreBar}>
              <View style={{...styles.scoreBarFill, width: `${Math.round(feedback.quality_score * 20)}%`}} />
            </View>
            <Text style={styles.scoreValue}>{Math.round(feedback.quality_score * 20)}%</Text>
          </View>
          
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Duration:</Text>
            <Text style={styles.scoreValue}>{formatTime(duration)}</Text>
          </View>
          
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Word Count:</Text>
            <Text style={styles.scoreValue}>{feedback.word_count}</Text>
          </View>
          
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Overall Sentiment:</Text>
            <Text style={styles.scoreValue}>{feedback.overall_sentiment}</Text>
          </View>
        </View>

        {/* Key Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Topics</Text>
          <View style={styles.flexRow}>
            {feedback.key_topics && feedback.key_topics.length > 0 ? (
              feedback.key_topics.map((topic, index) => (
                <Text key={index} style={styles.badge}>{topic}</Text>
              ))
            ) : (
              <Text style={styles.text}>No key topics identified</Text>
            )}
          </View>
        </View>

        {/* Content Analysis Section - New */}
        {feedback.content_analysis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content Analysis</Text>
            
            <View style={styles.tableRow}>
              <View style={{...styles.tableCol, flex: 2}}>
                <Text style={styles.tableCellHeader}>Metric</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellHeader}>Rating</Text>
              </View>
            </View>
            
            {Object.entries(feedback.content_analysis).map(([key, value], index) => (
              <View key={index} style={styles.tableRow}>
                <View style={{...styles.tableCol, flex: 2}}>
                  <Text style={styles.tableCell}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{value}</Text>
                </View>
              </View>
            ))}
            
            {/* Speaking Patterns */}
            {feedback.speaking_patterns && (
              <View style={{marginTop: 15}}>
                <Text style={{...styles.text, fontWeight: 'bold', marginBottom: 10}}>Speaking Patterns:</Text>
                
                <View style={styles.tableRow}>
                  <View style={{...styles.tableCol, flex: 2}}>
                    <Text style={styles.tableCellHeader}>Metric</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCellHeader}>Value</Text>
                  </View>
                </View>
                
                <View style={styles.tableRow}>
                  <View style={{...styles.tableCol, flex: 2}}>
                    <Text style={styles.tableCell}>Pace</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{feedback.speaking_patterns.pace}</Text>
                  </View>
                </View>
                
                <View style={styles.tableRow}>
                  <View style={{...styles.tableCol, flex: 2}}>
                    <Text style={styles.tableCell}>Filler Words</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{feedback.speaking_patterns.filler_words}</Text>
                  </View>
                </View>
                
                <View style={styles.tableRow}>
                  <View style={{...styles.tableCol, flex: 2}}>
                    <Text style={styles.tableCell}>Repetitions</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{feedback.speaking_patterns.repetitions}</Text>
                  </View>
                </View>
                
                {/* Technical Terms */}
                {feedback.speaking_patterns.technical_terms && feedback.speaking_patterns.technical_terms.length > 0 && (
                  <View style={{marginTop: 10}}>
                    <Text style={{...styles.text, fontWeight: 'bold', marginBottom: 5}}>Technical Terms Used:</Text>
                    <View style={styles.flexRow}>
                      {feedback.speaking_patterns.technical_terms.map((term, idx) => (
                        <Text key={idx} style={{...styles.badge, backgroundColor: '#4B5563'}}>{term}</Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </Page>
      <Page size="A4" style={styles.page}>
               {/* Tabular Assessment - New Section */}
               <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assessment Summary</Text>
          
          <View style={styles.table}>
            <View style={styles.tableRowHeader}>
              <View style={{...styles.tableCol, flex: 2}}>
                <Text style={styles.tableCellHeader}>Category</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellHeader}>Score</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellHeader}>Rating</Text>
              </View>
              <View style={{...styles.tableCol, flex: 2}}>
                <Text style={styles.tableCellHeader}>Comments</Text>
              </View>
            </View>
            
            {/* Technical Skills */}
            {feedback.technical_skills && (
              <View style={styles.tableRow}>
                <View style={{...styles.tableCol, flex: 2}}>
                  <Text style={{...styles.tableCell, fontWeight: 'bold'}}>Technical Skills</Text>
                </View>
                <View style={styles.tableCol}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{width: 30, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2}}>
                      <View 
                        style={{
                          width: `${(((feedback.technical_skills.depth_in_core_topics || 0) + 
                            (feedback.technical_skills.breadth_of_tech_stack || 0)) / 10) * 100}%`,
                          height: 4,
                          backgroundColor: '#8B5CF6',
                          borderRadius: 2
                        }} 
                      />
                    </View>
                    <Text style={{...styles.tableCell, marginLeft: 4}}>
                      {Math.round(((feedback.technical_skills.depth_in_core_topics || 0) + 
                        (feedback.technical_skills.breadth_of_tech_stack || 0)) / 2 * 20)}%
                    </Text>
                  </View>
                </View>
                <View style={styles.tableCol}>
                  <Text style={{...styles.tableCell, backgroundColor: '#F3E8FF', color: '#7E22CE', padding: 2, borderRadius: 4, textAlign: 'center', fontSize: 8}}>
                    {feedback.technical_skills.verdict ? feedback.technical_skills.breadth_of_tech_stack : 'N/A'} / 5
                  </Text>
                </View>
                <View style={{...styles.tableCol, flex: 2}}>
                  <Text style={{...styles.tableCell, fontSize: 8}}>
                    {(feedback.technical_skills?.strengths_summary || '').substring(0, 80)}
                    {(feedback.technical_skills?.strengths_summary || '').length > 80 ? '...' : ''}
                  </Text>
                </View>
              </View>
            )}
            
            {/* Communication */}
            {feedback.communication_skills && (
              <View style={styles.tableRow}>
                <View style={{...styles.tableCol, flex: 2}}>
                  <Text style={{...styles.tableCell, fontWeight: 'bold'}}>Communication</Text>
                </View>
                <View style={styles.tableCol}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{width: 30, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2}}>
                      <View 
                        style={{
                          width: `${((feedback.communication_skills.rating || 0) / 5) * 100}%`,
                          height: 4,
                          backgroundColor: '#3B82F6',
                          borderRadius: 2
                        }} 
                      />
                    </View>
                    <Text style={{...styles.tableCell, marginLeft: 4}}>
                      {Math.round(((feedback.communication_skills.rating || 0) / 5) * 100)}%
                    </Text>
                  </View>
                </View>
                <View style={styles.tableCol}>
                  <Text style={{
                    ...styles.tableCell, 
                    backgroundColor: (feedback.communication_skills.rating || 0) >= 4 
                      ? '#DCFCE7' : (feedback.communication_skills.rating || 0) >= 3
                        ? '#DBEAFE' : '#FEF3C7',
                    color: (feedback.communication_skills.rating || 0) >= 4 
                      ? '#166534' : (feedback.communication_skills.rating || 0) >= 3
                        ? '#1E40AF' : '#92400E',
                    padding: 2, 
                    borderRadius: 4, 
                    textAlign: 'center',
                    fontSize: 8
                  }}>
                    {(feedback.communication_skills.rating || 0) >= 4 
                      ? "Excellent" 
                      : (feedback.communication_skills.rating || 0) >= 3
                        ? "Good"
                        : "Fair"}
                  </Text>
                </View>
                <View style={{...styles.tableCol, flex: 2}}>
                  <Text style={{...styles.tableCell, fontSize: 8}}>
                    {(feedback.communication_skills?.summary || '').substring(0, 80)}
                    {(feedback.communication_skills?.summary || '').length > 80 ? '...' : ''}
                  </Text>
                </View>
              </View>
            )}
            
            {/* Content Quality */}
            <View style={styles.tableRow}>
              <View style={{...styles.tableCol, flex: 2}}>
                <Text style={{...styles.tableCell, fontWeight: 'bold'}}>Content Quality</Text>
              </View>
              <View style={styles.tableCol}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View style={{width: 30, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2}}>
                    <View 
                      style={{
                        width: `${(feedback.quality_score || 0) * 20}%`,
                        height: 4,
                        backgroundColor: '#10B981',
                        borderRadius: 2
                      }} 
                    />
                  </View>
                  <Text style={{...styles.tableCell, marginLeft: 4}}>
                    {Math.round((feedback.quality_score || 0) * 20)}%
                  </Text>
                </View>
              </View>
              <View style={styles.tableCol}>
                <Text style={{
                  ...styles.tableCell, 
                  backgroundColor: (feedback.quality_score || 0) >= 4 
                    ? '#DCFCE7' : (feedback.quality_score || 0) >= 3
                      ? '#DBEAFE' : (feedback.quality_score || 0) >= 2
                        ? '#FEF3C7' : '#FEE2E2',
                  color: (feedback.quality_score || 0) >= 4 
                    ? '#166534' : (feedback.quality_score || 0) >= 3
                      ? '#1E40AF' : (feedback.quality_score || 0) >= 2
                        ? '#92400E' : '#B91C1C',
                  padding: 2, 
                  borderRadius: 4, 
                  textAlign: 'center',
                  fontSize: 8
                }}>
                  {(feedback.quality_score || 0) >= 4 
                    ? "Excellent" 
                    : (feedback.quality_score || 0) >= 3
                      ? "Good"
                      : (feedback.quality_score || 0) >= 2
                        ? "Fair"
                        : "Poor"}
                </Text>
              </View>
              <View style={{...styles.tableCol, flex: 2}}>
                <Text style={{...styles.tableCell, fontSize: 8}}>
                  {feedback.content_analysis?.information_density || "Standard"} information density, 
                  {feedback.content_analysis?.clarity || "Average"} clarity
                </Text>
              </View>
            </View>
            
            {/* Overall Assessment */}
            <View style={styles.tableRow}>
              <View style={{...styles.tableCol, flex: 2}}>
                <Text style={{...styles.tableCell, fontWeight: 'bold'}}>Overall Assessment</Text>
              </View>
              <View style={styles.tableCol}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View style={{width: 30, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2}}>
                    <View 
                      style={{
                        width: `${((feedback.confidence_level || 0) / 5) * 100}%`,
                        height: 4,
                        backgroundColor: '#6366F1',
                        borderRadius: 2
                      }} 
                    />
                  </View>
                  <Text style={{...styles.tableCell, marginLeft: 4}}>
                    {Math.round(((feedback.confidence_level || 0) / 5) * 100)}%
                  </Text>
                </View>
              </View>
              <View style={styles.tableCol}>
                <Text style={{
                  ...styles.tableCell, 
                  backgroundColor: feedback.overall_sentiment === "positive" 
                    ? '#DCFCE7' : feedback.overall_sentiment === "neutral"
                      ? '#DBEAFE' : '#FEF3C7',
                  color: feedback.overall_sentiment === "positive" 
                    ? '#166534' : feedback.overall_sentiment === "neutral"
                      ? '#1E40AF' : '#92400E',
                  padding: 2, 
                  borderRadius: 4, 
                  textAlign: 'center',
                  fontSize: 8
                }}>
                  {feedback.overall_sentiment || 'N/A'}
                </Text>
              </View>
              <View style={{...styles.tableCol, flex: 2}}>
                <Text style={{...styles.tableCell, fontSize: 8}}>
                  {(feedback.final_assessment || '').substring(0, 80)}
                  {(feedback.final_assessment || '').length > 80 ? '...' : ''}
                </Text>
              </View>
            </View>
            
            {/* Required Skills Coverage */}
            {feedback.technical_skills?.skills && (
              <View style={styles.tableRow}>
                <View style={{...styles.tableCol, flex: 2}}>
                  <Text style={{...styles.tableCell, fontWeight: 'bold'}}>Required Skills Coverage</Text>
                </View>
                <View style={styles.tableCol}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{width: 30, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2}}>
                      <View 
                        style={{
                          width: `${(feedback.technical_skills.skills.filter(
                            s => s.is_required && s.availability_status !== "Not Available"
                          ).length / Math.max(1, feedback.technical_skills.skills.filter(s => s.is_required).length)) * 100}%`,
                          height: 4,
                          backgroundColor: '#8B5CF6',
                          borderRadius: 2
                        }} 
                      />
                    </View>
                    <Text style={{...styles.tableCell, marginLeft: 4}}>
                      {Math.round((feedback.technical_skills.skills.filter(
                        s => s.is_required && s.availability_status !== "Not Available"
                      ).length / Math.max(1, feedback.technical_skills.skills.filter(s => s.is_required).length)) * 100)}%
                    </Text>
                  </View>
                </View>
                <View style={styles.tableCol}>
                  <Text style={{
                    ...styles.tableCell, 
                    backgroundColor: '#EDE9FE',
                    color: '#6D28D9',
                    padding: 2, 
                    borderRadius: 4, 
                    textAlign: 'center',
                    fontSize: 8
                  }}>
                    {feedback.technical_skills.skills.filter(
                      s => s.is_required && s.availability_status !== "Not Available"
                    ).length} / {feedback.technical_skills.skills.filter(s => s.is_required).length}
                  </Text>
                </View>
                <View style={{...styles.tableCol, flex: 2}}>
                  <Text style={{...styles.tableCell, fontSize: 8}}>
                    {feedback.technical_skills.skills.filter(s => s.is_required).length === 0 
                      ? "No required skills specified" 
                      : `${feedback.technical_skills.skills.filter(
                          s => s.is_required && s.availability_status !== "Not Available"
                        ).length} out of ${feedback.technical_skills.skills.filter(s => s.is_required).length} required skills covered`}
                  </Text>
                </View>
              </View>
            )}
          </View>
          
          {/* Skills Assessment Table */}
          {feedback.technical_skills?.skills && feedback.technical_skills.skills.length > 0 && (
            <View style={{marginTop: 15}}>
              <Text style={{...styles.text, fontWeight: 'bold', fontSize: 12, marginBottom: 5}}>Skills Assessment Table</Text>
              <View style={styles.table}>
                <View style={styles.tableRowHeader}>
                  <View style={{...styles.tableCol, flex: 2}}>
                    <Text style={styles.tableCellHeader}>Skill</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCellHeader}>Level</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCellHeader}>Rating</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCellHeader}>Score</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCellHeader}>Required</Text>
                  </View>
                </View>
                
                {feedback.technical_skills.skills.map((skill, index) => (
                  <View key={index} style={styles.tableRow}>
                    <View style={{...styles.tableCol, flex: 2}}>
                      <Text style={{...styles.tableCell, fontWeight: 'bold'}}>{skill.skill_name}</Text>
                    </View>
                    <View style={styles.tableCol}>
                      {skill.availability_status === "Not Available" ? (
                        <Text style={{
                          ...styles.tableCell, 
                          backgroundColor: '#F3F4F6',
                          color: '#6B7280',
                          padding: 2, 
                          borderRadius: 4, 
                          textAlign: 'center',
                          fontSize: 8
                        }}>
                          Not Mentioned
                        </Text>
                      ) : (
                        <Text style={{
                          ...styles.tableCell, 
                          backgroundColor: skill.level === "Expert" 
                            ? '#EDE9FE' : skill.level === "Professional"
                              ? '#DBEAFE' : skill.level === "Intermediate"
                                ? '#DCFCE7' : '#FEF3C7',
                          color: skill.level === "Expert" 
                            ? '#6D28D9' : skill.level === "Professional"
                              ? '#1E40AF' : skill.level === "Intermediate"
                                ? '#166534' : '#92400E',
                          padding: 2, 
                          borderRadius: 4, 
                          textAlign: 'center',
                          fontSize: 8
                        }}>
                          {skill.level}
                        </Text>
                      )}
                    </View>
                    <View style={styles.tableCol}>
                      {skill.availability_status === "Not Available" ? (
                        <Text style={{...styles.tableCell}}>-</Text>
                      ) : (
                        <Text style={{
                          ...styles.tableCell, 
                          backgroundColor: skill.rating_text === "Excellent" 
                            ? '#DCFCE7' : skill.rating_text === "Very Good"
                              ? '#DBEAFE' : skill.rating_text === "Good"
                                ? '#EDE9FE' : skill.rating_text === "Satisfactory"
                                  ? '#FEF3C7' : '#FEE2E2',
                          color: skill.rating_text === "Excellent" 
                            ? '#166534' : skill.rating_text === "Very Good"
                              ? '#1E40AF' : skill.rating_text === "Good"
                                ? '#6D28D9' : skill.rating_text === "Satisfactory"
                                  ? '#92400E' : '#B91C1C',
                          padding: 2, 
                          borderRadius: 4, 
                          textAlign: 'center',
                          fontSize: 8
                        }}>
                          {skill.rating_text}
                        </Text>
                      )}
                    </View>
                    <View style={styles.tableCol}>
                      {skill.availability_status === "Not Available" ? (
                        <Text style={{...styles.tableCell}}>-</Text>
                      ) : (
                        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                          {[1, 2, 3, 4, 5].map((dot) => (
                            <View 
                              key={dot} 
                              style={{
                                width: 3,
                                height: 3,
                                borderRadius: 1.5,
                                backgroundColor: dot <= skill.rating_score ? '#8B5CF6' : '#E5E7EB',
                                marginHorizontal: 1
                              }} 
                            />
                          ))}
                        </View>
                      )}
                    </View>
                    <View style={styles.tableCol}>
                      {skill.is_required ? (
                        <Text style={{
                          ...styles.tableCell, 
                          backgroundColor: '#DBEAFE',
                          color: '#1E40AF',
                          padding: 2, 
                          borderRadius: 4, 
                          textAlign: 'center',
                          fontSize: 8
                        }}>
                          Yes
                        </Text>
                      ) : (
                        <Text style={{
                          ...styles.tableCell, 
                          backgroundColor: '#F3F4F6',
                          color: '#6B7280',
                          padding: 2, 
                          borderRadius: 4, 
                          textAlign: 'center',
                          fontSize: 8
                        }}>
                          No
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </Page>


      
      {/* Interview Questions Page */}
      <Page size="A4" style={styles.page}>


        {/* Interview Questions */}
        {feedback.questions && feedback.questions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interview Questions Analysis</Text>
            
            {feedback.questions.map((q, index) => (
              <View key={index} style={{marginBottom: 15, borderBottomWidth: index < feedback.questions.length - 1 ? 1 : 0, borderBottomColor: '#E5E7EB', paddingBottom: 10}}>
                <Text style={{...styles.text, fontWeight: 'bold'}}>Question {index + 1}:</Text>
                <Text style={{...styles.text, marginBottom: 5}}>{q.question}</Text>
                
                <Text style={{...styles.text, fontWeight: 'bold'}}>Answer:</Text>
                <Text style={{...styles.text, marginBottom: 5, fontStyle: 'italic'}}>{q.answer}</Text>
                
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>Rating:</Text>
                  <View style={styles.scoreBar}>
                    <View style={{
                      ...styles.scoreBarFill, 
                      width: `${(q.rating / 5) * 100}%`,
                      backgroundColor: getRatingColor(q.rating)
                    }} />
                  </View>
                  <Text style={styles.scoreValue}>{q.rating}/5</Text>
                </View>
                
                <Text style={{...styles.text, fontWeight: 'bold', marginTop: 5}}>Feedback:</Text>
                <Text style={styles.text}>{q.feedback}</Text>
              </View>
            ))}
          </View>
        )}
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>

            {/* Technical Skills Page */}
            <Page size="A4" style={styles.page}>
        {/* Technical Skills Assessment */}
        {feedback.technical_skills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Skills Assessment</Text>
            
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Core Topics Depth:</Text>
              <View style={styles.scoreBar}>
                <View style={{...styles.scoreBarFill, width: `${(feedback.technical_skills.depth_in_core_topics / 5) * 100}%`}} />
              </View>
              <Text style={styles.scoreValue}>{feedback.technical_skills.depth_in_core_topics}/5</Text>
            </View>
            
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Tech Stack Breadth:</Text>
              <View style={styles.scoreBar}>
                <View style={{...styles.scoreBarFill, width: `${(feedback.technical_skills.breadth_of_tech_stack / 5) * 100}%`}} />
              </View>
              <Text style={styles.scoreValue}>{feedback.technical_skills.breadth_of_tech_stack}/5</Text>
            </View>
            
            <Text style={{...styles.text, marginTop: 10, marginBottom: 5, fontWeight: 'bold'}}>Overall Technical Review:</Text>
            <Text style={styles.text}>{feedback.technical_skills.overall_tech_review}</Text>
            
            <View style={{marginTop: 15}}>
              <Text style={{...styles.text, fontWeight: 'bold', color: '#047857'}}>Strengths Summary:</Text>
              <Text style={{...styles.text, color: '#047857'}}>{feedback.technical_skills.strengths_summary}</Text>
            </View>
            
            <View style={{marginTop: 10}}>
              <Text style={{...styles.text, fontWeight: 'bold', color: '#B45309'}}>Areas for Improvement:</Text>
              <Text style={{...styles.text, color: '#B45309'}}>{feedback.technical_skills.weaknesses_summary}</Text>
            </View>
            
            <Text style={{...styles.text, marginTop: 15, marginBottom: 5, fontWeight: 'bold'}}>Skills Assessment:</Text>
            
            {/* Required Skills First */}
            {feedback.technical_skills.skills && feedback.technical_skills.skills.filter(s => s.is_required).length > 0 && (
              <View style={{marginBottom: 10}}>
                <Text style={{...styles.text, fontWeight: 'bold', fontSize: 11, color: '#4338CA', marginBottom: 5}}>Required Skills:</Text>
                
                {feedback.technical_skills.skills.filter(s => s.is_required).map((skill, index) => (
                  <View key={index} style={{...styles.skillRow, borderColor: skill.availability_status === "Not Available" ? '#E5E7EB' : '#C7D2FE'}}>
                    <Text style={styles.skillName}>{skill.skill_name}</Text>
                    <Text style={styles.skillLevel}>
                      {skill.availability_status === "Not Available" ? "Not Mentioned" : skill.level}
                    </Text>
                    <Text style={styles.skillRating}>
                      {skill.availability_status === "Not Available" ? "-" : skill.rating_text}
                    </Text>
                    <View style={styles.ratingDots}>
                      {skill.availability_status === "Not Available" ? (
                        <Text style={{fontSize: 8, color: '#6B7280'}}>N/A</Text>
                      ) : (
                        [1, 2, 3, 4, 5].map((dot) => (
                          <View 
                            key={dot} 
                            style={[
                              styles.dot, 
                              dot <= skill.rating_score ? {...styles.dotFilled, backgroundColor: '#4338CA'} : styles.dotEmpty
                            ]} 
                          />
                        ))
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            {/* Other Skills */}
            {feedback.technical_skills.skills && feedback.technical_skills.skills.filter(s => !s.is_required).length > 0 && (
              <View>
                <Text style={{...styles.text, fontWeight: 'bold', fontSize: 11, marginBottom: 5}}>Other Skills Detected:</Text>
                
                {feedback.technical_skills.skills.filter(s => !s.is_required).map((skill, index) => (
                  <View key={index} style={styles.skillRow}>
                    <Text style={styles.skillName}>{skill.skill_name}</Text>
                    <Text style={styles.skillLevel}>{skill.level}</Text>
                    <Text style={styles.skillRating}>{skill.rating_text}</Text>
                    <View style={styles.ratingDots}>
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <View 
                          key={dot} 
                          style={[
                            styles.dot, 
                            dot <= skill.rating_score ? styles.dotFilled : styles.dotEmpty
                          ]} 
                        />
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            <Text style={{...styles.text, marginTop: 15, fontWeight: 'bold'}}>Technical Verdict:</Text>
            <Text style={{...styles.text, fontStyle: 'italic', color: '#4338CA'}}>{feedback.technical_skills.verdict}</Text>
          </View>
        )}
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
      
      {/* Final Assessment Page */}
      <Page size="A4" style={styles.page}>
                {/* Communication Skills */}
                {feedback.communication_skills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Communication Skills</Text>
            
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Overall Rating:</Text>
              <View style={styles.scoreBar}>
                <View style={{
                  ...styles.scoreBarFill, 
                  width: `${(feedback.communication_skills.rating / 5) * 100}%`,
                  backgroundColor: getRatingColor(feedback.communication_skills.rating)
                }} />
              </View>
              <Text style={styles.scoreValue}>{feedback.communication_skills.rating}/5</Text>
            </View>
            
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Language Fluency:</Text>
              <View style={styles.scoreBar}>
                <View style={{
                  ...styles.scoreBarFill, 
                  width: `${(feedback.communication_skills.language_fluency / 5) * 100}%`,
                  backgroundColor: getRatingColor(feedback.communication_skills.language_fluency)
                }} />
              </View>
              <Text style={styles.scoreValue}>{feedback.communication_skills.language_fluency}/5</Text>
            </View>
            
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Technical Articulation:</Text>
              <View style={styles.scoreBar}>
                <View style={{
                  ...styles.scoreBarFill, 
                  width: `${(feedback.communication_skills.technical_articulation / 5) * 100}%`,
                  backgroundColor: getRatingColor(feedback.communication_skills.technical_articulation)
                }} />
              </View>
              <Text style={styles.scoreValue}>{feedback.communication_skills.technical_articulation}/5</Text>
            </View>
            
            <Text style={{...styles.text, marginTop: 10, fontWeight: 'bold'}}>Communication Summary:</Text>
            <Text style={styles.text}>{feedback.communication_skills.summary}</Text>
            
            <Text style={{...styles.text, marginTop: 5, fontWeight: 'bold'}}>Impact:</Text>
            <Text style={styles.text}>{feedback.communication_skills.impact}</Text>
          </View>
        )}
        {/* Actionable Insights */}
        {feedback.actionable_insights && feedback.actionable_insights.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actionable Insights</Text>
            
            {feedback.actionable_insights.map((insight, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listItemContent}>{insight}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recommendations */}
        {feedback.recommendations && feedback.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            
            {feedback.recommendations.map((rec, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listItemContent}>{rec}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Final Assessment */}
        {feedback.final_assessment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Final Assessment</Text>
            
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>{feedback.final_assessment}</Text>
            </View>
            
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Confidence Level:</Text>
              <View style={styles.scoreBar}>
                <View style={{
                  ...styles.scoreBarFill, 
                  width: `${(feedback.confidence_level / 5) * 100}%`
                }} />
              </View>
              <Text style={styles.scoreValue}>{feedback.confidence_level}/5</Text>
            </View>
            
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Culture Fit:</Text>
              <View style={styles.scoreBar}>
                <View style={{
                  ...styles.scoreBarFill, 
                  width: `${(feedback.culture_fit / 5) * 100}%`
                }} />
              </View>
              <Text style={styles.scoreValue}>{feedback.culture_fit}/5</Text>
            </View>
            
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Learning Aptitude:</Text>
              <View style={styles.scoreBar}>
                <View style={{
                  ...styles.scoreBarFill, 
                  width: `${(feedback.learning_aptitude / 5) * 100}%`
                }} />
              </View>
              <Text style={styles.scoreValue}>{feedback.learning_aptitude}/5</Text>
            </View>
            
            {feedback.interviewer_notes && (
              <>
                <Text style={{...styles.text, marginTop: 10, fontWeight: 'bold'}}>Interviewer Notes:</Text>
                <Text style={{...styles.text, fontStyle: 'italic'}}>{feedback.interviewer_notes}</Text>
              </>
            )}
          </View>
        )}
        
 
        
        <View style={styles.footer}>
          <Text>Video Analysis Report • Generated by Build Fast with AI • {new Date().toLocaleDateString()}</Text>
        </View>
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

// PDF Download Button Component
export const PDFDownloadButton = ({ data }: { data: TranscriptionResponse }) => {
  return (
    <PDFDownloadLink 
      document={<PDFReport data={data} />} 
      fileName="video-analysis-report.pdf"
      className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg flex items-center transition-colors shadow-md"
    >
      {({ blob, url, loading, error }) => 
        loading ? 
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating PDF...
          </> : 
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Download PDF Report
          </>
      }
    </PDFDownloadLink>
  );
};

// PDF Preview Component
export const PDFPreview = ({ data }: { data: TranscriptionResponse }) => {
  return (
    <PDFViewer style={{width: '100%', height: '80vh', border: 'none', borderRadius: '0.5rem'}}>
      <PDFReport data={data} />
    </PDFViewer>
  );
};

export default PDFReport;
