import logging
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
import re

logger = logging.getLogger(__name__)

def extract_video_id(url: str) -> str:
    # Handle various youtube url formats
    pattern = r'(?:v=|\/)([0-9A-Za-z_-]{11}).*'
    match = re.search(pattern, url)
    if match:
        return match.group(1)
    return None

def extract_text_from_video(url: str) -> str:
    video_id = extract_video_id(url)
    if not video_id:
        raise ValueError("Invalid YouTube URL. Please provide a standard YouTube video link.")
        
    try:
        ytt_api = YouTubeTranscriptApi()
        transcript = ytt_api.fetch(video_id).to_raw_data()
        
        text_chunks = []
        for t in transcript:
            # Format: 'Text [Timestamp: 0:45]'
            start_sec = int(t['start'])
            mins, secs = divmod(start_sec, 60)
            timestamp_str = f"{mins}:{secs:02d}"
            text_chunks.append(f"{t['text']} [Source: Video Timestamp {timestamp_str}]")
            
        text = " ".join(text_chunks)
        
        if not text.strip():
            raise ValueError("The video has a transcript, but it appears to be empty.")
            
        return text

    except TranscriptsDisabled:
        logger.error(f"Transcripts disabled for video {video_id}")
        raise ValueError("Transcripts are disabled for this YouTube video. Please try a different video.")
    except NoTranscriptFound:
        logger.error(f"No transcript found for video {video_id}")
        raise ValueError("No transcript was found for this video. It might be in an unsupported language.")
    except Exception as e:
        logger.error(f"Failed to extract video transcript: {e}")
        raise ValueError("Failed to extract video transcript. Make sure the video is public and has captions.")
