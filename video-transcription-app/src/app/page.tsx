"use client";

import { useState } from "react";
import {
  Upload,
  Send,
  FileVideo,
  Loader2,
  Clipboard,
  BarChart3,
  Brain,
  User,
  LineChart,
  Plus,
  X,
  Download,
  Table,
} from "lucide-react";
import dynamic from "next/dynamic";
import { PDFDownloadButton } from "../components/report";

// Dynamically load the Chart.js components to avoid SSR issues
// const Chart = dynamic(() => import('react-chartjs-2').then(mod => ({
//   default: mod.Chart
// })), { ssr: false });

// Dynamically load specific chart types
const Bar = dynamic(
  () => import("react-chartjs-2").then((mod) => ({ default: mod.Bar })),
  { ssr: false }
);
const Radar = dynamic(
  () => import("react-chartjs-2").then((mod) => ({ default: mod.Radar })),
  { ssr: false }
);
const Doughnut = dynamic(
  () => import("react-chartjs-2").then((mod) => ({ default: mod.Doughnut })),
  { ssr: false }
);

// Import Chart.js utilities and components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  ArcElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  ArcElement
);

interface RequiredSkill {
  name: string;
}

interface TechnicalSkill {
  skill_name: string;
  level: string; // Beginner | Intermediate | Professional | Expert
  rating_text: string; // Excellent | Very Good | Good | Satisfactory | Needs Improvement
  rating_score: number; // 1-5
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
    // New fields
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

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] =
    useState<TranscriptionResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [duration, setDuration] = useState<string>("00:00");
  const [requiredSkills, setRequiredSkills] = useState<RequiredSkill[]>([]);
  const [newSkill, setNewSkill] = useState<string>("");

  const getDuration = (transcriptionResult: TranscriptionResponse | null) => {
    if (!transcriptionResult) return 0;
    return transcriptionResult.transcription.reduce((acc, segment) => {
      return acc + (segment.end_time - segment.start_time);
    }, 0);
  };

  // PDF export is now handled by the PDFDownloadButton component

  const handleAddSkill = () => {
    if (newSkill.trim() !== "") {
      setRequiredSkills([...requiredSkills, { name: newSkill.trim() }]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = [...requiredSkills];
    updatedSkills.splice(index, 1);
    setRequiredSkills(updatedSkills);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setVideoUrl(data.file.url);
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleTranscribe = async () => {
    if (!videoUrl) return;

    setIsTranscribing(true);
    setError("");

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl,
          requiredSkills: requiredSkills.map((skill) => skill.name),
        }),
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      setTranscriptionResult(data);
      setDuration(formatTime(getDuration(data)));
    } catch (error) {
      console.error("Transcription error:", error);
      setError("Failed to transcribe video");
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Function to convert string ratings to numeric values for charts
  const getRatingValue = (rating: string): number => {
    const ratingMap: Record<string, number> = {
      low: 1,
      medium: 2,
      high: 3,
    };
    return ratingMap[rating.toLowerCase()] || 2;
  };

  const getRatingColor = (rating: string): string => {
    switch (rating?.toLowerCase()) {
      case "excellent":
        return "text-green-600 bg-green-50 border-green-200";
      case "very good":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "good":
        return "text-indigo-600 bg-indigo-50 border-indigo-200";
      case "satisfactory":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "needs improvement":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getLevelColor = (level: string): string => {
    switch (level?.toLowerCase()) {
      case "expert":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "professional":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "intermediate":
        return "text-green-600 bg-green-50 border-green-200";
      case "beginner":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-800 mb-6 tracking-tight">
            Video Analysis AI
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your video interview and get comprehensive AI-powered
            analysis with detailed feedback and insights
          </p>
        </div>

        {/* Upload Section - Improved */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-10 border border-slate-100">
          <h2 className="text-2xl font-semibold mb-6 flex items-center text-slate-800">
            <Upload className="mr-3 text-blue-500" />
            Upload Your Video
          </h2>

          <div className="space-y-6">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center transition-all hover:border-blue-400 hover:bg-blue-50/50">
              <input
                type="file"
                accept="video/*,audio/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-4"
              >
                <FileVideo className="w-16 h-16 text-slate-400" />
                <span className="text-slate-600 text-lg">
                  {selectedFile
                    ? selectedFile.name
                    : "Drop your video file here or click to browse"}
                </span>
              </label>
            </div>

            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-lg shadow-blue-100"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-3" />
                    Upload to Cloud
                  </>
                )}
              </button>
            )}

            {videoUrl && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
                <p className="text-emerald-700 font-medium">
                  ✨ File uploaded successfully! Ready for analysis.
                </p>
                <p className="text-sm text-emerald-600 mt-2 break-all">
                  URL: {videoUrl}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Required Skills Section - New */}
        {videoUrl && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-10 border border-slate-100">
            <h2 className="text-2xl font-semibold mb-6 flex items-center text-slate-800">
              <Brain className="mr-3 text-purple-500" />
              Required Skills to Evaluate
            </h2>

            <div className="space-y-6">
              <p className="text-slate-600">
                Add specific skills you want to evaluate in this interview. The
                AI will assess if these skills are mentioned and provide
                ratings.
              </p>

              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Enter a skill (e.g., React, Python, AWS)"
                  className="flex-1 px-4 py-3 border border-slate-200 text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                />
                <button
                  onClick={handleAddSkill}
                  className="bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {requiredSkills.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-slate-700 mb-3">
                    Skills to evaluate:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {requiredSkills.map((skill, index) => (
                      <div
                        key={index}
                        className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium border border-purple-100 flex items-center"
                      >
                        {skill.name}
                        <button
                          onClick={() => handleRemoveSkill(index)}
                          className="ml-2 text-purple-400 hover:text-purple-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transcription Section - Improved */}
        {videoUrl && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-10 border border-slate-100">
            <h2 className="text-2xl font-semibold mb-6 flex items-center text-slate-800">
              <Send className="mr-3 text-indigo-500" />
              Start Analysis
            </h2>

            <button
              onClick={handleTranscribe}
              disabled={isTranscribing}
              className="w-full bg-indigo-500 text-white py-4 px-6 rounded-xl font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-lg shadow-indigo-100 text-lg"
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Processing your video... This may take a few minutes
                </>
              ) : (
                <>
                  <Send className="w-6 h-6 mr-3" />
                  Begin Video Analysis
                </>
              )}
            </button>
          </div>
        )}

        {/* Error Display - Improved */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 mb-10">
            <p className="text-rose-700 font-medium flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </p>
          </div>
        )}

        {/* Results Section - Improved */}
        {transcriptionResult && (
          <div className="space-y-10">
            {/* Export to PDF Button */}
            <div className="flex justify-end">
              <PDFDownloadButton data={transcriptionResult} />
            </div>

            {/* AI Feedback Overview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-100 report-section">
              <h3 className="text-2xl font-semibold mb-8 text-slate-800 flex items-center">
                <Brain className="mr-3 text-blue-500" />
                AI Analysis Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-xl border border-blue-100">
                  <p className="text-sm font-medium text-blue-700 mb-2">
                    Quality Score
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {Math.round(
                      transcriptionResult.feedback.quality_score * 20
                    )}
                    %
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 rounded-xl border border-emerald-100">
                  <p className="text-sm font-medium text-emerald-700 mb-2">
                    Sentiment
                  </p>
                  <p className="text-xl font-semibold text-emerald-900 capitalize">
                    {transcriptionResult.feedback.overall_sentiment}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 p-6 rounded-xl border border-violet-100">
                  <p className="text-sm font-medium text-violet-700 mb-2">
                    Word Count
                  </p>
                  <p className="text-3xl font-bold text-violet-900">
                    {transcriptionResult.feedback.word_count}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 rounded-xl border border-amber-100">
                  <p className="text-sm font-medium text-amber-700 mb-2">
                    Duration
                  </p>
                  <p className="text-xl font-semibold text-amber-900">
                    {duration}
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-slate-50 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-800 mb-3 text-lg">
                    Summary
                  </h4>
                  <p className="text-slate-700 leading-relaxed">
                    {transcriptionResult.feedback.summary}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 mb-4 text-lg">
                    Key Topics
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {transcriptionResult.feedback.key_topics &&
                    transcriptionResult.feedback.key_topics.length > 0 ? (
                      transcriptionResult.feedback.key_topics.map(
                        (topic, index) => (
                          <span
                            key={index}
                            className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium border border-blue-100"
                          >
                            {topic}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-slate-600">
                        No key topics identified
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-800 mb-4 text-lg">
                    Recommendations
                  </h4>
                  <ul className="space-y-3">
                    {transcriptionResult.feedback.recommendations &&
                    transcriptionResult.feedback.recommendations.length > 0 ? (
                      transcriptionResult.feedback.recommendations.map(
                        (rec, index) => (
                          <li
                            key={index}
                            className="flex items-start text-slate-700"
                          >
                            <span className="mr-3 text-blue-500">•</span>
                            <span>{rec}</span>
                          </li>
                        )
                      )
                    ) : (
                      <li className="text-slate-600">
                        No recommendations available
                      </li>
                    )}
                  </ul>
                </div>

                <div className="bg-slate-50 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-800 mb-4 text-lg">
                    Actionable Insights
                  </h4>
                  <ul className="space-y-3">
                    {transcriptionResult.feedback.actionable_insights &&
                    transcriptionResult.feedback.actionable_insights.length >
                      0 ? (
                      transcriptionResult.feedback.actionable_insights.map(
                        (insight, index) => (
                          <li
                            key={index}
                            className="flex items-start text-slate-700"
                          >
                            <span className="mr-3 text-indigo-500">•</span>
                            <span>{insight}</span>
                          </li>
                        )
                      )
                    ) : (
                      <li className="text-slate-600">
                        No actionable insights available
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Tabular Assessment - New Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-100 report-section">
              <h3 className="text-2xl font-semibold mb-8 text-slate-800 flex items-center">
                <Table className="mr-3 text-purple-500" />
                Tabular Assessment
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-slate-200 rounded-lg">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700 border-b">
                        Category
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700 border-b">
                        Score
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700 border-b">
                        Rating
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700 border-b">
                        Comments
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Technical Skills */}
                    <tr className="border-b">
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        Technical Skills
                      </td>
                      <td className="py-3 px-4">
                        {transcriptionResult.feedback.technical_skills ? (
                          <div className="flex items-center">
                            <div className="w-12 bg-slate-200 rounded-full h-2.5">
                              <div
                                className="bg-purple-600 h-2.5 rounded-full"
                                style={{
                                  width: `${
                                    (((transcriptionResult.feedback
                                      .technical_skills.depth_in_core_topics ||
                                      0) +
                                      (transcriptionResult.feedback
                                        .technical_skills
                                        .breadth_of_tech_stack || 0)) /
                                      10) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-slate-700">
                              {Math.round(
                                (((transcriptionResult.feedback.technical_skills
                                  .depth_in_core_topics || 0) +
                                  (transcriptionResult.feedback.technical_skills
                                    .breadth_of_tech_stack || 0)) /
                                  2) *
                                  20
                              )}
                              %
                            </span>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {transcriptionResult.feedback.technical_skills
                          ?.verdict ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            {
                              transcriptionResult.feedback.technical_skills
                                .breadth_of_tech_stack
                            }{" "}
                            / 5
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {transcriptionResult.feedback.technical_skills?.strengths_summary?.substring(
                          0,
                          250
                        )}
                        ...
                      </td>
                    </tr>

                    {/* Communication */}
                    <tr className="border-b">
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        Communication
                      </td>
                      <td className="py-3 px-4">
                        {transcriptionResult.feedback.communication_skills ? (
                          <div className="flex items-center">
                            <div className="w-12 bg-slate-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{
                                  width: `${
                                    ((transcriptionResult.feedback
                                      .communication_skills.rating || 0) /
                                      5) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-slate-700">
                              {Math.round(
                                ((transcriptionResult.feedback
                                  .communication_skills.rating || 0) /
                                  5) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {transcriptionResult.feedback.communication_skills
                          ?.rating ? (
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              (transcriptionResult.feedback.communication_skills
                                .rating || 0) >= 4
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : (transcriptionResult.feedback
                                    .communication_skills.rating || 0) >= 3
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {(transcriptionResult.feedback.communication_skills
                              .rating || 0) >= 4
                              ? "Excellent"
                              : (transcriptionResult.feedback
                                  .communication_skills.rating || 0) >= 3
                              ? "Good"
                              : "Fair"}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {transcriptionResult.feedback.communication_skills?.summary?.substring(
                          0,
                          250
                        )}
                        ...
                      </td>
                    </tr>

                    {/* Content Quality */}
                    <tr className="border-b">
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        Content Quality
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-12 bg-slate-200 rounded-full h-2.5">
                            <div
                              className="bg-emerald-600 h-2.5 rounded-full"
                              style={{
                                width: `${
                                  (transcriptionResult.feedback.quality_score ||
                                    0) * 20
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm font-medium text-slate-700">
                            {Math.round(
                              (transcriptionResult.feedback.quality_score ||
                                0) * 20
                            )}
                            %
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            (transcriptionResult.feedback.quality_score || 0) >=
                            4
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : (transcriptionResult.feedback.quality_score ||
                                  0) >= 3
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : (transcriptionResult.feedback.quality_score ||
                                  0) >= 2
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {(transcriptionResult.feedback.quality_score || 0) >=
                          4
                            ? "Excellent"
                            : (transcriptionResult.feedback.quality_score ||
                                0) >= 3
                            ? "Good"
                            : (transcriptionResult.feedback.quality_score ||
                                0) >= 2
                            ? "Fair"
                            : "Poor"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {transcriptionResult.feedback.content_analysis
                          ?.information_density || "Standard"}{" "}
                        information density,
                        {transcriptionResult.feedback.content_analysis
                          ?.clarity || "Average"}{" "}
                        clarity
                      </td>
                    </tr>

                    {/* Overall Assessment */}
                    <tr className="border-b">
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        Overall Assessment
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-12 bg-slate-200 rounded-full h-2.5">
                            <div
                              className="bg-indigo-600 h-2.5 rounded-full"
                              style={{
                                width: `${
                                  ((transcriptionResult.feedback
                                    .confidence_level || 0) /
                                    5) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm font-medium text-slate-700">
                            {Math.round(
                              ((transcriptionResult.feedback.confidence_level ||
                                0) /
                                5) *
                                100
                            )}
                            %
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            transcriptionResult.feedback.overall_sentiment ===
                            "positive"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : transcriptionResult.feedback
                                  .overall_sentiment === "neutral"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {transcriptionResult.feedback.overall_sentiment ||
                            "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {transcriptionResult.feedback.final_assessment?.substring(
                          0,
                          250
                        )}
                        ...
                      </td>
                    </tr>

                    {/* Required Skills Coverage */}
                    <tr>
                      <td className="py-3 px-4 text-slate-800 font-medium">
                        Required Skills Coverage
                      </td>
                      <td className="py-3 px-4">
                        {transcriptionResult.feedback.technical_skills
                          ?.skills ? (
                          <div className="flex items-center">
                            <div className="w-12 bg-slate-200 rounded-full h-2.5">
                              <div
                                className="bg-violet-600 h-2.5 rounded-full"
                                style={{
                                  width: `${
                                    (transcriptionResult.feedback.technical_skills.skills.filter(
                                      (s) =>
                                        s.is_required &&
                                        s.availability_status !==
                                          "Not Available"
                                    ).length /
                                      Math.max(1, requiredSkills.length)) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-slate-700">
                              {Math.round(
                                (transcriptionResult.feedback.technical_skills.skills.filter(
                                  (s) =>
                                    s.is_required &&
                                    s.availability_status !== "Not Available"
                                ).length /
                                  Math.max(1, requiredSkills.length)) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {transcriptionResult.feedback.technical_skills
                          ?.skills ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                            {
                              transcriptionResult.feedback.technical_skills.skills.filter(
                                (s) =>
                                  s.is_required &&
                                  s.availability_status !== "Not Available"
                              ).length
                            }{" "}
                            / {requiredSkills.length}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {requiredSkills.length === 0
                          ? "No required skills specified"
                          : `${
                              transcriptionResult.feedback.technical_skills?.skills.filter(
                                (s) =>
                                  s.is_required &&
                                  s.availability_status !== "Not Available"
                              ).length
                            } out of ${
                              requiredSkills.length
                            } required skills covered`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Skills Table */}
              {transcriptionResult.feedback.technical_skills?.skills &&
                transcriptionResult.feedback.technical_skills.skills.length >
                  0 && (
                  <div className="mt-10">
                    <h4 className="text-xl font-semibold mb-6 text-slate-800">
                      Skills Assessment Table
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-slate-200 rounded-lg">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700 border-b">
                              Skill
                            </th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700 border-b">
                              Level
                            </th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700 border-b">
                              Rating
                            </th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700 border-b">
                              Score
                            </th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700 border-b">
                              Required
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {transcriptionResult.feedback.technical_skills.skills.map(
                            (skill, index) => (
                              <tr key={index} className="border-b">
                                <td className="py-3 px-4 text-slate-800 font-medium">
                                  {skill.skill_name}
                                </td>
                                <td className="py-3 px-4">
                                  {skill.availability_status ===
                                  "Not Available" ? (
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                                      Not Mentioned
                                    </span>
                                  ) : (
                                    <span
                                      className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(
                                        skill.level
                                      )}`}
                                    >
                                      {skill.level}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  {skill.availability_status ===
                                  "Not Available" ? (
                                    <span>-</span>
                                  ) : (
                                    <span
                                      className={`px-2 py-1 text-xs font-medium rounded-full ${getRatingColor(
                                        skill.rating_text
                                      )}`}
                                    >
                                      {skill.rating_text}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  {skill.availability_status ===
                                  "Not Available" ? (
                                    <span>-</span>
                                  ) : (
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <div
                                          key={i}
                                          className={`w-3 h-3 rounded-full mr-1 ${
                                            i < skill.rating_score
                                              ? "bg-purple-500"
                                              : "bg-slate-200"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  {skill.is_required ? (
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                      Yes
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                                      No
                                    </span>
                                  )}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </div>

            {/* Interview Questions Analysis */}
            {transcriptionResult?.feedback?.questions &&
              transcriptionResult.feedback.questions.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-100 report-section">
                  <h3 className="text-2xl font-semibold mb-8 text-slate-800 flex items-center">
                    <Clipboard className="mr-3 text-emerald-500" />
                    Interview Questions Analysis
                  </h3>

                  <div className="space-y-6">
                    {transcriptionResult.feedback.questions.map(
                      (questionItem, index) => (
                        <div
                          key={index}
                          className="bg-slate-50 rounded-xl p-6 border border-slate-100"
                        >
                          <div className="mb-4">
                            <h4 className="font-semibold text-slate-800 text-lg">
                              Question {index + 1}
                            </h4>
                            <p className="text-slate-700 bg-white p-4 rounded-lg border border-slate-200 mt-2 font-medium">
                              {questionItem.question}
                            </p>
                          </div>

                          <div className="mb-4">
                            <h5 className="font-medium text-slate-700">
                              Answer
                            </h5>
                            <p className="text-slate-600 bg-white p-4 rounded-lg border border-slate-200 mt-2 italic">
                              {questionItem.answer}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="font-medium text-slate-700 mb-2">
                                Rating
                              </h5>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-5 h-5 rounded-full mr-1 ${
                                      i < questionItem.rating
                                        ? "bg-emerald-500"
                                        : "bg-slate-200"
                                    }`}
                                  />
                                ))}
                                <span className="ml-2 font-semibold text-emerald-700">
                                  {questionItem.rating}/5
                                </span>
                              </div>
                            </div>

                            <div>
                              <h5 className="font-medium text-slate-700 mb-2">
                                Feedback
                              </h5>
                              <p className="text-slate-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                {questionItem.feedback}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Enhanced Technical Skills Analysis */}
            {transcriptionResult?.feedback?.technical_skills && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-100 report-section">
                <h3 className="text-2xl font-semibold mb-8 text-slate-800 flex items-center">
                  <Brain className="mr-3 text-violet-500" />
                  Technical Skills Assessment Report
                </h3>

                {/* Required Skills Evaluation - New Section */}
                {transcriptionResult.feedback.technical_skills.skills &&
                  transcriptionResult.feedback.technical_skills.skills.filter(
                    (skill) => skill.is_required
                  ).length > 0 && (
                    <div className="mb-12">
                      <h4 className="text-xl font-semibold mb-6 text-slate-800 flex items-center">
                        <span className="mr-2">🎯</span> Required Skills
                        Evaluation
                      </h4>
                      <div className="grid grid-cols-1 gap-6">
                        {transcriptionResult.feedback.technical_skills.skills
                          .filter((skill) => skill.is_required)
                          .map((skill, index) => (
                            <div
                              key={index}
                              className={`bg-gradient-to-r ${
                                skill.availability_status === "Not Available"
                                  ? "from-slate-50 to-slate-100"
                                  : "from-purple-50 to-purple-100"
                              } rounded-2xl p-6 border ${
                                skill.availability_status === "Not Available"
                                  ? "border-slate-200"
                                  : "border-purple-200"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="text-lg font-bold text-slate-800">
                                  {skill.skill_name}
                                </h5>
                                {skill.availability_status ===
                                "Not Available" ? (
                                  <span className="px-4 py-2 rounded-full text-sm font-semibold border text-slate-600 bg-slate-50 border-slate-200">
                                    Not Mentioned in Interview
                                  </span>
                                ) : (
                                  <div className="flex items-center space-x-4">
                                    <span
                                      className={`px-4 py-2 rounded-full text-sm font-semibold border ${getLevelColor(
                                        skill.level
                                      )}`}
                                    >
                                      {skill.level}
                                    </span>
                                    <span
                                      className={`px-4 py-2 rounded-full text-sm font-semibold border ${getRatingColor(
                                        skill.rating_text
                                      )}`}
                                    >
                                      {skill.rating_text}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {skill.availability_status === "Not Available" ? (
                                <p className="text-slate-600">
                                  This required skill was not mentioned or
                                  discussed in the interview.
                                </p>
                              ) : (
                                <div className="space-y-4">
                                  <p className="text-slate-700 leading-relaxed">
                                    {skill.detailed_feedback}
                                  </p>

                                  {skill.rating_score > 0 && (
                                    <div className="flex items-center mt-2">
                                      <span className="text-sm font-medium text-slate-600 mr-3">
                                        Rating:
                                      </span>
                                      <div className="flex space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                          <div
                                            key={i}
                                            className={`w-4 h-4 rounded-full ${
                                              i < skill.rating_score
                                                ? "bg-purple-500"
                                                : "bg-slate-200"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="ml-3 font-medium text-purple-700">
                                        {skill.rating_score}/5
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                {/* Skills Overview */}
                {transcriptionResult.feedback.technical_skills.skills &&
                  transcriptionResult.feedback.technical_skills.skills.filter(
                    (skill) => !skill.is_required
                  ).length > 0 && (
                    <div className="space-y-8 mb-12">
                      <h4 className="text-xl font-semibold mb-6 text-slate-800 flex items-center">
                        <span className="mr-2">💻</span> Detected Skills
                      </h4>
                      {transcriptionResult.feedback.technical_skills.skills
                        .filter((skill) => !skill.is_required)
                        .map((skill, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-8 border border-slate-200"
                          >
                            <div className="flex items-center justify-between mb-6">
                              <h5 className="text-2xl font-bold text-slate-800">
                                {skill.skill_name}
                              </h5>
                              <div className="flex items-center space-x-4">
                                <span
                                  className={`px-4 py-2 rounded-full text-sm font-semibold border ${getLevelColor(
                                    skill.level
                                  )}`}
                                >
                                  {skill.level}
                                </span>
                                <span
                                  className={`px-4 py-2 rounded-full text-sm font-semibold border ${getRatingColor(
                                    skill.rating_text
                                  )}`}
                                >
                                  {skill.rating_text}
                                </span>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-slate-800">
                                    {skill.rating_score}/5
                                  </div>
                                  <div className="text-sm text-slate-600">
                                    Rating
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                              {/* Detailed Feedback */}
                              <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-xl p-6 border border-slate-100">
                                  <h5 className="font-semibold text-slate-800 mb-3 text-lg">
                                    Assessment
                                  </h5>
                                  <p className="text-slate-700 leading-relaxed">
                                    {skill.detailed_feedback}
                                  </p>
                                </div>

                                {skill.strengths &&
                                  skill.strengths.length > 0 && (
                                    <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                                      <h5 className="font-semibold text-emerald-800 mb-4 text-lg flex items-center">
                                        <span className="mr-2">✅</span>{" "}
                                        Strengths
                                      </h5>
                                      <ul className="space-y-2">
                                        {skill.strengths.map((strength, i) => (
                                          <li
                                            key={i}
                                            className="flex items-start text-emerald-700"
                                          >
                                            <span className="mr-3 text-emerald-500">
                                              •
                                            </span>
                                            <span>{strength}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                {skill.areas_for_improvement &&
                                  skill.areas_for_improvement.length > 0 && (
                                    <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                                      <h5 className="font-semibold text-amber-800 mb-4 text-lg flex items-center">
                                        <span className="mr-2">🔄</span> Areas
                                        for Improvement
                                      </h5>
                                      <ul className="space-y-2">
                                        {skill.areas_for_improvement.map(
                                          (area, i) => (
                                            <li
                                              key={i}
                                              className="flex items-start text-amber-700"
                                            >
                                              <span className="mr-3 text-amber-500">
                                                •
                                              </span>
                                              <span>{area}</span>
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}
                              </div>

                              {/* Examples and Metrics */}
                              <div className="space-y-6">
                                {skill.examples_mentioned &&
                                  skill.examples_mentioned.length > 0 && (
                                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                                      <h5 className="font-semibold text-blue-800 mb-4 text-lg">
                                        Examples Mentioned
                                      </h5>
                                      <div className="flex flex-wrap gap-2">
                                        {skill.examples_mentioned.map(
                                          (example, i) => (
                                            <span
                                              key={i}
                                              className="bg-white text-blue-700 px-3 py-2 rounded-lg text-sm border border-blue-200 shadow-sm"
                                            >
                                              {example}
                                            </span>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                <div className="bg-white rounded-xl p-6 border border-slate-100">
                                  <h5 className="font-semibold text-slate-800 mb-4 text-lg text-center">
                                    Rating Breakdown
                                  </h5>
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                      <span className="text-slate-600">
                                        Performance
                                      </span>
                                      <div className="flex space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                          <div
                                            key={i}
                                            className={`w-4 h-4 rounded-full ${
                                              i < skill.rating_score
                                                ? "bg-violet-500"
                                                : "bg-slate-200"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    <div className="text-center text-3xl font-bold text-violet-600">
                                      {skill.rating_score}/5
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                {/* Overall Technical Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                    <h4 className="font-semibold text-emerald-800 mb-4 text-lg flex items-center">
                      <span className="mr-2">💪</span> Strengths Summary
                    </h4>
                    <p className="text-emerald-700 leading-relaxed">
                      {transcriptionResult.feedback.technical_skills
                        .strengths_summary ||
                        "Technical strengths assessment pending."}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                    <h4 className="font-semibold text-amber-800 mb-4 text-lg flex items-center">
                      <span className="mr-2">🎯</span> Development Areas
                    </h4>
                    <p className="text-amber-700 leading-relaxed">
                      {transcriptionResult.feedback.technical_skills
                        .weaknesses_summary ||
                        "Areas for improvement assessment pending."}
                    </p>
                  </div>
                </div>

                {/* Technical Proficiency Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                    <h4 className="font-semibold text-slate-800 mb-6 text-lg text-center">
                      Technical Proficiency
                    </h4>
                    <div className="h-64">
                      {typeof window !== "undefined" && (
                        <Radar
                          data={{
                            labels: [
                              "Depth in Core Topics",
                              "Breadth of Tech Stack",
                            ],
                            datasets: [
                              {
                                label: "Score (out of 5)",
                                data: [
                                  transcriptionResult.feedback.technical_skills
                                    .depth_in_core_topics || 0,
                                  transcriptionResult.feedback.technical_skills
                                    .breadth_of_tech_stack || 0,
                                ],
                                backgroundColor: "rgba(124, 58, 237, 0.2)",
                                borderColor: "rgb(124, 58, 237)",
                                pointBackgroundColor: "rgb(124, 58, 237)",
                                pointBorderColor: "#fff",
                                pointHoverBackgroundColor: "#fff",
                                pointHoverBorderColor: "rgb(124, 58, 237)",
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              r: {
                                min: 0,
                                max: 5,
                                ticks: { stepSize: 1, color: "#64748b" },
                                grid: { color: "#e2e8f0" },
                                pointLabels: { color: "#64748b" },
                              },
                            },
                            plugins: { legend: { display: false } },
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                    <h4 className="font-semibold text-slate-800 mb-4 text-lg">
                      Overall Technical Review
                    </h4>
                    <p className="text-slate-700 leading-relaxed mb-6">
                      {transcriptionResult.feedback.technical_skills
                        .overall_tech_review || "Technical review pending."}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center bg-white rounded-lg p-4 border border-slate-200">
                        <div className="text-2xl font-bold text-violet-600">
                          {transcriptionResult.feedback.technical_skills
                            .depth_in_core_topics || 0}
                          /5
                        </div>
                        <div className="text-sm text-slate-600 font-medium">
                          Core Depth
                        </div>
                      </div>
                      <div className="text-center bg-white rounded-lg p-4 border border-slate-200">
                        <div className="text-2xl font-bold text-blue-600">
                          {transcriptionResult.feedback.technical_skills
                            .breadth_of_tech_stack || 0}
                          /5
                        </div>
                        <div className="text-sm text-slate-600 font-medium">
                          Tech Breadth
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Verdict */}
                {transcriptionResult.feedback.technical_skills.verdict && (
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-8 border border-indigo-200">
                    <h4 className="font-semibold text-indigo-800 mb-4 text-xl flex items-center">
                      <span className="mr-2">🎯</span> Final Technical Verdict
                    </h4>
                    <p className="text-indigo-700 text-lg leading-relaxed italic">
                      &quot;
                      {transcriptionResult.feedback.technical_skills.verdict}
                      &quot;
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Communication Skills Analysis */}
            {transcriptionResult?.feedback?.communication_skills && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-100 report-section">
                <h3 className="text-2xl font-semibold mb-8 text-slate-800 flex items-center">
                  <User className="mr-3 text-blue-500" />
                  Communication Skills Analysis
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="col-span-1 md:col-span-2 space-y-6">
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                      <h4 className="font-semibold text-slate-800 mb-3 text-lg">
                        Summary
                      </h4>
                      <p className="text-slate-700 leading-relaxed">
                        {transcriptionResult.feedback.communication_skills
                          .summary || "No summary available"}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                      <h4 className="font-semibold text-slate-800 mb-3 text-lg">
                        Impact
                      </h4>
                      <p className="text-slate-700 leading-relaxed">
                        {transcriptionResult.feedback.communication_skills
                          .impact || "No impact analysis available"}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-1">
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                      <h4 className="font-semibold text-slate-800 mb-4 text-lg text-center">
                        Communication Ratings
                      </h4>
                      <div className="h-64">
                        {typeof window !== "undefined" && (
                          <Bar
                            data={{
                              labels: [
                                "Overall",
                                "Language Fluency",
                                "Technical Articulation",
                              ],
                              datasets: [
                                {
                                  label: "Score (out of 5)",
                                  data: [
                                    transcriptionResult.feedback
                                      .communication_skills.rating || 0,
                                    transcriptionResult.feedback
                                      .communication_skills.language_fluency ||
                                      0,
                                    transcriptionResult.feedback
                                      .communication_skills
                                      .technical_articulation || 0,
                                  ],
                                  backgroundColor: [
                                    "rgba(59, 130, 246, 0.6)",
                                    "rgba(16, 185, 129, 0.6)",
                                    "rgba(99, 102, 241, 0.6)",
                                  ],
                                  borderColor: [
                                    "rgb(59, 130, 246)",
                                    "rgb(16, 185, 129)",
                                    "rgb(99, 102, 241)",
                                  ],
                                  borderWidth: 1,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  max: 5,
                                  ticks: {
                                    stepSize: 1,
                                    color: "#64748b",
                                  },
                                  grid: {
                                    color: "#e2e8f0",
                                  },
                                },
                                x: {
                                  ticks: {
                                    color: "#64748b",
                                  },
                                  grid: {
                                    display: false,
                                  },
                                },
                              },
                              plugins: {
                                legend: {
                                  display: false,
                                },
                              },
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Analysis with Visualization */}
            {transcriptionResult?.feedback?.content_analysis && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-100 report-section">
                <h3 className="text-2xl font-semibold mb-8 text-slate-800 flex items-center">
                  <BarChart3 className="mr-3 text-emerald-500" />
                  Content Analysis
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        {Object.entries(
                          transcriptionResult?.feedback?.content_analysis || {}
                        ).map(([key, value]) => (
                          <div
                            key={key}
                            className="text-center bg-white rounded-lg p-4 shadow-sm"
                          >
                            <p className="text-sm text-slate-600 capitalize mb-2">
                              {key.replace("_", " ")}
                            </p>
                            <p className="font-semibold text-lg capitalize text-slate-800">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Visualization of content analysis */}
                      <div className="h-64 mt-6">
                        {typeof window !== "undefined" &&
                          Object.keys(
                            transcriptionResult.feedback.content_analysis || {}
                          ).length > 0 && (
                            <Doughnut
                              data={{
                                labels: Object.keys(
                                  transcriptionResult?.feedback
                                    ?.content_analysis || {}
                                ).map(
                                  (key) =>
                                    key
                                      .replace("_", " ")
                                      .charAt(0)
                                      .toUpperCase() +
                                    key.replace("_", " ").slice(1)
                                ),
                                datasets: [
                                  {
                                    data: Object.values(
                                      transcriptionResult?.feedback
                                        ?.content_analysis || {}
                                    ).map((value) =>
                                      getRatingValue(value as string)
                                    ),
                                    backgroundColor: [
                                      "rgba(59, 130, 246, 0.6)",
                                      "rgba(16, 185, 129, 0.6)",
                                      "rgba(99, 102, 241, 0.6)",
                                      "rgba(244, 63, 94, 0.6)",
                                    ],
                                    borderColor: [
                                      "rgb(59, 130, 246)",
                                      "rgb(16, 185, 129)",
                                      "rgb(99, 102, 241)",
                                      "rgb(244, 63, 94)",
                                    ],
                                    borderWidth: 2,
                                  },
                                ],
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: "bottom",
                                    labels: {
                                      padding: 20,
                                      color: "#64748b",
                                      font: {
                                        size: 12,
                                      },
                                    },
                                  },
                                },
                              }}
                            />
                          )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                      <h4 className="font-semibold text-slate-800 mb-6 text-lg">
                        Speaking Patterns
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                          <p className="text-sm text-blue-600 font-medium mb-1">
                            Pace
                          </p>
                          <p className="font-semibold text-blue-800 capitalize">
                            {transcriptionResult?.feedback?.speaking_patterns
                              ?.pace || "N/A"}
                          </p>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                          <p className="text-sm text-emerald-600 font-medium mb-1">
                            Filler Words
                          </p>
                          <p className="font-semibold text-emerald-800">
                            {transcriptionResult?.feedback?.speaking_patterns
                              ?.filler_words || 0}
                          </p>
                        </div>
                        <div className="bg-violet-50 rounded-lg p-4 border border-violet-100">
                          <p className="text-sm text-violet-600 font-medium mb-1">
                            Repetitions
                          </p>
                          <p className="font-semibold text-violet-800">
                            {transcriptionResult?.feedback?.speaking_patterns
                              ?.repetitions || 0}
                          </p>
                        </div>
                      </div>

                      {transcriptionResult?.feedback?.speaking_patterns
                        ?.technical_terms?.length > 0 && (
                        <div className="mt-6">
                          <h5 className="font-semibold text-slate-800 mb-4">
                            Technical Terms Used
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {transcriptionResult?.feedback?.speaking_patterns?.technical_terms?.map(
                              (term, index) => (
                                <span
                                  key={index}
                                  className="bg-white text-slate-700 px-3 py-2 rounded-lg text-sm border border-slate-200 shadow-sm"
                                >
                                  {term}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Final Assessment Card - Improved */}
            {(transcriptionResult.feedback.final_assessment ||
              transcriptionResult.feedback.confidence_level ||
              transcriptionResult.feedback.culture_fit ||
              transcriptionResult.feedback.learning_aptitude ||
              transcriptionResult.feedback.interviewer_notes) && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border-l-4 border-indigo-500 report-section">
                <h3 className="text-2xl font-semibold mb-6 flex items-center text-slate-800">
                  <Clipboard className="mr-3 text-indigo-500" />
                  Final Assessment
                </h3>
                {transcriptionResult.feedback.final_assessment && (
                  <p className="text-slate-700 text-lg italic bg-slate-50 p-6 rounded-xl border border-slate-100 mb-8">
                    &quot;{transcriptionResult.feedback.final_assessment}&quot;
                  </p>
                )}

                {(transcriptionResult.feedback.confidence_level ||
                  transcriptionResult.feedback.culture_fit ||
                  transcriptionResult.feedback.learning_aptitude) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200">
                    {transcriptionResult.feedback.confidence_level !==
                      undefined && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-xl border border-blue-100">
                        <p className="text-sm font-medium text-blue-700 mb-4">
                          Confidence Level
                        </p>
                        <div className="flex items-center justify-center space-x-2">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-6 h-6 rounded-lg ${
                                i <
                                (transcriptionResult.feedback
                                  .confidence_level || 0)
                                  ? "bg-blue-500 shadow-lg shadow-blue-200"
                                  : "bg-slate-200"
                              } transition-all`}
                            />
                          ))}
                        </div>
                        <p className="font-semibold mt-4 text-center text-blue-900">
                          {transcriptionResult.feedback.confidence_level || 0}/5
                        </p>
                      </div>
                    )}

                    {transcriptionResult.feedback.culture_fit !== undefined && (
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 rounded-xl border border-emerald-100">
                        <p className="text-sm font-medium text-emerald-700 mb-4">
                          Culture Fit
                        </p>
                        <div className="flex items-center justify-center space-x-2">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-6 h-6 rounded-lg ${
                                i <
                                (transcriptionResult.feedback.culture_fit || 0)
                                  ? "bg-emerald-500 shadow-lg shadow-emerald-200"
                                  : "bg-slate-200"
                              } transition-all`}
                            />
                          ))}
                        </div>
                        <p className="font-semibold mt-4 text-center text-emerald-900">
                          {transcriptionResult.feedback.culture_fit || 0}/5
                        </p>
                      </div>
                    )}

                    {transcriptionResult.feedback.learning_aptitude !==
                      undefined && (
                      <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 p-6 rounded-xl border border-violet-100">
                        <p className="text-sm font-medium text-violet-700 mb-4">
                          Learning Aptitude
                        </p>
                        <div className="flex items-center justify-center space-x-2">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-6 h-6 rounded-lg ${
                                i <
                                (transcriptionResult.feedback
                                  .learning_aptitude || 0)
                                  ? "bg-violet-500 shadow-lg shadow-violet-200"
                                  : "bg-slate-200"
                              } transition-all`}
                            />
                          ))}
                        </div>
                        <p className="font-semibold mt-4 text-center text-violet-900">
                          {transcriptionResult.feedback.learning_aptitude || 0}
                          /5
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {transcriptionResult.feedback.interviewer_notes && (
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-4 text-lg">
                      Interviewer Notes
                    </h4>
                    <p className="text-slate-700 bg-slate-50 p-6 rounded-xl border border-slate-100 italic leading-relaxed">
                      {transcriptionResult.feedback.interviewer_notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Full Transcription */}
            {transcriptionResult?.full_text && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-100 report-section">
                <h3 className="text-2xl font-semibold mb-6 text-slate-800 flex items-center">
                  <Clipboard className="mr-3 text-blue-500" />
                  Full Transcription
                </h3>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 max-h-[32rem] overflow-y-auto pr-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-slate-50">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {transcriptionResult.full_text}
                  </p>
                </div>
              </div>
            )}

            {/* Timestamped Segments */}
            {transcriptionResult?.transcription &&
              transcriptionResult.transcription.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-slate-100 report-section">
                  <h3 className="text-2xl font-semibold mb-6 text-slate-800 flex items-center">
                    <LineChart className="mr-3 text-indigo-500" />
                    Timestamped Segments
                  </h3>
                  <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-slate-50">
                    {transcriptionResult?.transcription?.map(
                      (segment, index) => (
                        <div
                          key={index}
                          className="border-l-4 border-indigo-400 pl-4 py-3 bg-white rounded-r-xl shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                              {formatTime(segment.start_time)} -{" "}
                              {formatTime(segment.end_time)}
                            </span>
                            <span className="text-xs bg-slate-50 text-slate-600 px-3 py-1 rounded-full font-medium">
                              Confidence:{" "}
                              {Math.round((segment?.confidence || 0) * 100)}%
                            </span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">
                            {segment.text}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
