# 🎬 Video Transcription & AI Feedback Web App

A beautiful, modern Next.js web application that provides a user-friendly interface for video transcription and AI-powered feedback analysis using your FastAPI backend.

## ✨ Features

- 📁 **Drag & Drop File Upload** - Easy video/audio file selection
- ☁️ **Cloud Storage** - Automatic upload to Digital Ocean Spaces
- 🎙️ **Real-time Transcription** - Powered by your FastAPI backend
- 🧠 **AI Feedback Analysis** - Comprehensive analysis with sentiment, quality scores, and recommendations
- 📊 **Beautiful Dashboard** - Clean, responsive UI with detailed analytics
- ⏰ **Timestamped Segments** - Interactive timeline view of transcription
- 📱 **Mobile Responsive** - Works perfectly on all devices

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Your FastAPI backend running (see parent directory)
- Digital Ocean Spaces account and credentials

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Digital Ocean Spaces Configuration
DIGITAL_OCEAN_SPACES_BUCKET_NAME=your-bucket-name
DIGITAL_OCEAN_SPACES_ENDPOINT=your-endpoint.digitaloceanspaces.com
DIGITAL_OCEAN_SPACES_KEY=your-access-key
DIGITAL_OCEAN_SPACES_SECRET=your-secret-key

# FastAPI Backend URL
FASTAPI_URL=http://localhost:8000
```

**How to get Digital Ocean Spaces credentials:**

1. Log into your Digital Ocean account
2. Go to **Spaces** in the sidebar
3. Create a new Space (or use existing)
4. Note down your **Bucket Name** and **Endpoint**
5. Go to **API** → **Spaces Keys**
6. Generate new **Access Key** and **Secret Key**

### Step 3: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🚀 How to Use

### 1. Start Your FastAPI Backend

Make sure your FastAPI server is running in the parent directory:

```bash
cd ../
python3 main.py
```

### 2. Upload a Video

1. Open `http://localhost:3000` in your browser
2. Click on the upload area or drag & drop a video/audio file
3. Supported formats: MP4, MOV, AVI, MP3, WAV, etc.
4. Click "Upload to Cloud" to store the file

### 3. Get Transcription & Analysis

1. Once uploaded, click "Start Transcription & AI Analysis"
2. Wait for processing (this may take a few minutes depending on video length)
3. View the comprehensive results including:
   - **AI Feedback Overview** - Quality score, sentiment, word count
   - **Content Analysis** - Clarity, engagement, information density
   - **Speaking Patterns** - Pace, filler words, technical terms
   - **Full Transcription** - Complete text with formatting
   - **Timestamped Segments** - Interactive timeline view

## 📁 Project Structure

```
video-transcription-app/
├── app/
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts          # Digital Ocean upload endpoint
│   │   └── transcribe/
│   │       └── route.ts          # FastAPI transcription proxy
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main application component
├── env.example                   # Environment variables template
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## 🔧 API Endpoints

### POST /api/upload

Uploads video/audio files to Digital Ocean Spaces.

**Request:**

- Content-Type: `multipart/form-data`
- Body: File data

**Response:**

```json
{
  "file": {
    "url": "https://your-bucket.endpoint.com/videos/filename.mp4"
  }
}
```

### POST /api/transcribe

Proxies transcription requests to your FastAPI backend.

**Request:**

```json
{
  "videoUrl": "https://your-bucket.endpoint.com/videos/filename.mp4"
}
```

**Response:** Full transcription data with AI feedback analysis

## 🎨 UI Components

The app uses a modern, clean design with:

- **Gradient backgrounds** for visual appeal
- **Card-based layouts** for organized content
- **Loading states** with spinners and progress indicators
- **Color-coded metrics** for easy understanding
- **Responsive grid layouts** for all screen sizes
- **Interactive elements** with hover effects

## 🔒 Security Notes

- Environment variables are server-side only (`.env.local`)
- File uploads are validated on the client side
- API routes include proper error handling
- Digital Ocean Spaces use public-read ACL for accessibility

## 🚨 Troubleshooting

### "Upload failed" error

- Check your Digital Ocean Spaces credentials
- Verify bucket name and endpoint URL
- Ensure your Spaces bucket allows public uploads

### "Transcription failed" error

- Make sure your FastAPI backend is running on `http://localhost:8000`
- Check that the video URL is publicly accessible
- Verify the FastAPI logs for specific error messages

### App won't start

- Run `npm install` to ensure all dependencies are installed
- Check that Node.js version is 18 or higher
- Verify your `.env.local` file exists and has correct variables

## 📈 Performance Tips

- **File Size**: Keep videos under 100MB for faster uploads
- **Video Length**: Shorter videos process faster
- **Network**: Stable internet connection improves upload speed
- **Browser**: Use modern browsers (Chrome, Firefox, Safari, Edge)

## 🌟 Production Deployment

For production deployment, consider:

1. **Vercel** (recommended for Next.js apps)
2. **Netlify** with serverless functions
3. **AWS Amplify** for full-stack deployment
4. **Docker** containerization

Remember to:

- Set environment variables in your hosting platform
- Update `FASTAPI_URL` to your production FastAPI endpoint
- Configure CORS in your FastAPI backend for production domains

## 🤝 Integration with FastAPI

This app is designed to work seamlessly with your FastAPI backend. It:

- Uploads files to cloud storage first (reduces FastAPI server load)
- Passes public URLs to FastAPI for processing
- Handles long-running transcription requests gracefully
- Displays all the rich feedback data from your AI models

The workflow is: **Upload → Store → Transcribe → Analyze → Display**

Enjoy building with your new video transcription platform! 🚀
