import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video URL is required" },
        { status: 400 }
      );
    }

    // Call the FastAPI backend to process the video
    const response = await fetch(`${FASTAPI_URL}/transcribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        video_url: videoUrl,
        // Ensure backend knows to return the enhanced feedback structure
        include_enhanced_feedback: true 
      }),
    });

    if (!response.ok) {
      throw new Error(`FastAPI request failed: ${response.statusText}`);
    }

    // Parse the response data
    const data = await response.json();
    console.log(data);
    
    // Ensure the response includes the enhanced feedback structure
    // The returned JSON should match the TranscriptionResponse interface in page.tsx
    // Including the new communication_skills and technical_skills fields
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in transcription:", error);
    return NextResponse.json(
      { error: "Failed to process transcription" },
      { status: 500 }
    );
  }
}
