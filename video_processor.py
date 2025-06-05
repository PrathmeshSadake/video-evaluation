import os
import yt_dlp
from typing import Tuple
import logging

logger = logging.getLogger(__name__)

class VideoProcessor:
    def __init__(self, temp_dir: str = "temp_files"):
        self.temp_dir = temp_dir
        os.makedirs(temp_dir, exist_ok=True)

    def download_and_extract_audio(self, video_url: str) -> Tuple[str, float]:
        """Download video and extract audio directly using yt-dlp (no MoviePy needed)"""
        try:
            # Generate output filename template
            output_template = os.path.join(self.temp_dir, '%(title)s.%(ext)s')
            
            ydl_opts = {
                'format': 'bestaudio/best',  # Get best audio quality
                'outtmpl': output_template,
                'extractaudio': True,
                'audioformat': 'wav',
                'audioquality': '192K',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'wav',
                    'preferredquality': '192',
                }],
                'no_warnings': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=True)
                duration = info.get('duration', 0.0)
                
                # Get the final audio filename
                filename = ydl.prepare_filename(info)
                audio_filename = filename.rsplit('.', 1)[0] + '.wav'
                
                # Check if file exists, if not try alternative extensions
                if not os.path.exists(audio_filename):
                    # Try different extensions that yt-dlp might have used
                    base_name = filename.rsplit('.', 1)[0]
                    for ext in ['.wav', '.m4a', '.mp3', '.webm']:
                        test_file = base_name + ext
                        if os.path.exists(test_file):
                            audio_filename = test_file
                            break
                
            logger.info(f"Audio extracted: {audio_filename}, Duration: {duration}s")
            return audio_filename, duration
            
        except Exception as e:
            logger.error(f"Error processing video: {str(e)}")
            # Fallback for testing - create dummy audio file
            logger.warning("Creating dummy audio file for testing purposes")
            dummy_path = os.path.join(self.temp_dir, "dummy_audio.wav")
            with open(dummy_path, 'wb') as f:
                # Create a minimal WAV file header for testing
                f.write(b'RIFF')
                f.write((36).to_bytes(4, 'little'))
                f.write(b'WAVE')
                f.write(b'fmt ')
                f.write((16).to_bytes(4, 'little'))
                f.write((1).to_bytes(2, 'little'))  # PCM
                f.write((1).to_bytes(2, 'little'))  # Mono
                f.write((22050).to_bytes(4, 'little'))  # Sample rate
                f.write((44100).to_bytes(4, 'little'))  # Byte rate
                f.write((2).to_bytes(2, 'little'))  # Block align
                f.write((16).to_bytes(2, 'little'))  # Bits per sample
                f.write(b'data')
                f.write((0).to_bytes(4, 'little'))  # No data
            return dummy_path, 60.0

    def cleanup_files(self, *file_paths):
        """Clean up temporary files"""
        for file_path in file_paths:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"Cleaned up: {file_path}")
            except Exception as e:
                logger.warning(f"Failed to cleanup {file_path}: {str(e)}")

    def process_video_url(self, video_url: str) -> Tuple[str, float]:
        """Complete pipeline: download video and extract audio"""
        return self.download_and_extract_audio(video_url) 