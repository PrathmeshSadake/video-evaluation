"use client";

import { useState } from "react";
import { Upload, Send, FileVideo, Loader2 } from "lucide-react";

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
        body: JSON.stringify({ videoUrl }),
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      setTranscriptionResult(data);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎬 Video Transcription & AI Feedback
          </h1>
          <p className="text-lg text-gray-600">
            Upload your video and get AI-powered transcription with detailed
            feedback analysis
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Upload className="mr-2" />
            Upload Video
          </h2>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="video/*,audio/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <FileVideo className="w-12 h-12 text-gray-400" />
                <span className="text-gray-600">
                  {selectedFile
                    ? selectedFile.name
                    : "Click to select video file"}
                </span>
              </label>
            </div>

            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload to Cloud
                  </>
                )}
              </button>
            )}

            {videoUrl && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  ✅ File uploaded successfully! Ready for transcription.
                </p>
                <p className="text-sm text-green-600 mt-1 break-all">
                  URL: {videoUrl}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Transcription Section */}
        {videoUrl && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Send className="mr-2" />
              Transcribe & Analyze
            </h2>

            <button
              onClick={handleTranscribe}
              disabled={isTranscribing}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing... This may take a few minutes
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Start Transcription & AI Analysis
                </>
              )}
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {/* Results Section */}
        {transcriptionResult && (
          <div className="space-y-6">
            {/* AI Feedback Overview */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">
                🧠 AI Feedback Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">
                    Quality Score
                  </p>
                  <p className="text-2xl font-bold text-blue-800">
                    {Math.round(
                      transcriptionResult.feedback.quality_score * 100
                    )}
                    %
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">
                    Sentiment
                  </p>
                  <p className="text-lg font-semibold text-green-800 capitalize">
                    {transcriptionResult.feedback.overall_sentiment}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">
                    Word Count
                  </p>
                  <p className="text-2xl font-bold text-purple-800">
                    {transcriptionResult.feedback.word_count}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-600 font-medium">
                    Duration
                  </p>
                  <p className="text-lg font-semibold text-orange-800">
                    {formatTime(transcriptionResult.duration)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Summary</h4>
                  <p className="text-gray-700">
                    {transcriptionResult.feedback.summary}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Key Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {transcriptionResult.feedback.key_topics.map(
                      (topic, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {topic}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Recommendations
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {transcriptionResult.feedback.recommendations.map(
                      (rec, index) => (
                        <li key={index} className="text-gray-700">
                          {rec}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Actionable Insights
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {transcriptionResult.feedback.actionable_insights.map(
                      (insight, index) => (
                        <li key={index} className="text-gray-700">
                          {insight}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Content Analysis */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">
                📊 Content Analysis
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(
                  transcriptionResult.feedback.content_analysis
                ).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="text-sm text-gray-600 capitalize">
                      {key.replace("_", " ")}
                    </p>
                    <p className="font-semibold capitalize">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Speaking Patterns */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">
                🗣️ Speaking Patterns
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Pace</p>
                  <p className="font-semibold capitalize">
                    {transcriptionResult.feedback.speaking_patterns.pace}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Filler Words</p>
                  <p className="font-semibold">
                    {
                      transcriptionResult.feedback.speaking_patterns
                        .filler_words
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Repetitions</p>
                  <p className="font-semibold">
                    {transcriptionResult.feedback.speaking_patterns.repetitions}
                  </p>
                </div>
              </div>
              {transcriptionResult.feedback.speaking_patterns.technical_terms
                .length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Technical Terms</p>
                  <div className="flex flex-wrap gap-2">
                    {transcriptionResult.feedback.speaking_patterns.technical_terms.map(
                      (term, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
                        >
                          {term}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Full Transcription */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">
                📝 Full Transcription
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {transcriptionResult.full_text}
                </p>
              </div>
            </div>

            {/* Timestamped Segments */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">
                ⏰ Timestamped Segments
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transcriptionResult.transcription.map((segment, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-blue-400 pl-4 py-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-blue-600">
                        {formatTime(segment.start_time)} -{" "}
                        {formatTime(segment.end_time)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Confidence: {Math.round(segment.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-gray-800">{segment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
