"""
AI Video Service — generates educational video lectures from study material.

Pipeline:
1. Gemini API generates a structured teaching script (JSON with slides)
2. PIL renders each slide as a 1280x720 image (futuristic dark theme)
3. gTTS generates narration audio for each slide
4. moviepy stitches images + audio into a final .mp4 lecture

Output: saved to backend/static/videos/<uuid>.mp4
"""

import os
import json
import uuid
import textwrap
import tempfile
from pathlib import Path

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.0-flash')

# Output directory
VIDEOS_DIR = Path(__file__).parent / "static" / "videos"
VIDEOS_DIR.mkdir(parents=True, exist_ok=True)

# ── Colour palette (RGB tuples) ──────────────────────────────────────────────
BG_COLOR       = (10, 10, 15)       # deep black
ACCENT_BLUE    = (0, 229, 255)      # neon blue  #00E5FF
ACCENT_PURPLE  = (123, 97, 255)     # purple glow #7B61FF
TEXT_WHITE     = (240, 240, 255)
TEXT_DIM       = (140, 140, 170)
SLIDE_W, SLIDE_H = 1280, 720


from rag_pipeline import prepare_rag_context

def _generate_script(study_text: str, level: str) -> list[dict]:
    """Ask Gemini to produce a JSON teaching script (list of slides)."""
    rag_query = f"Generate key theoretical concepts for a video presentation summary targeted at a {level} student."
    rag_context = prepare_rag_context(study_text, rag_query, top_k=6)
    
    prompt = f"""
    You are an expert teacher creating a short educational video lecture.
    Student level: {level}.
    
    CRITICAL INSTRUCTION: Your slides MUST contain actual technical facts, key definitions, and specific data points from the provided material.
    Avoid generic filler text like "Welcome to the lesson" or "Let's learn". Instead, start immediately with content.
    
    Based on the retrieved context chunks below, create a video script with exactly 5-6 slides.
    
    Return ONLY a valid JSON array where each object has:
    - "title": short slide title (max 8 words)
    - "bullets": list of 3-4 key points (each max 15 words)
    - "narration": what the teacher says aloud for this slide (3-5 sentences). It MUST be factual and mention specific details from the context.
    
    Slides should follow this educational structure:
    1. Foundational Overview (Introduce the primary topic with a core definition)
    2. Mechanism/Process (How it works - be detailed)
    3. Technical Nuances/Critical Steps (Specific deep-dive)
    4. Practical Application or Impact
    5. Comprehensive Summary of testable points
    
    Context Material:
    {rag_context}
    """
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Robust JSON extraction
        import re
        json_match = re.search(r'\[\s*\{.*\}\s*\]', text, re.DOTALL)
        if json_match:
            text = json_match.group(0)
        elif "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
            
        return json.loads(text.strip())
    except Exception as e:
        print(f"[ai_video_service] Script generation error: {e}")
        # Fallback minimal script
        return [
            {"title": "Introduction", "bullets": ["Welcome to this lesson", "We will cover key concepts"], "narration": "Welcome to this educational lecture. Let's explore the key concepts together."},
            {"title": "Core Concepts", "bullets": ["Important idea 1", "Important idea 2", "Important idea 3"], "narration": "Here are the core concepts you need to understand from this material."},
            {"title": "Key Takeaways", "bullets": ["Remember point 1", "Remember point 2", "Practice regularly"], "narration": "These are the most important takeaways from today's lecture."},
            {"title": "Summary", "bullets": ["We covered main topics", "Apply what you learned"], "narration": "Great work! You have completed this adaptive lecture. Keep studying and practicing."},
        ]


def _render_slide_image(slide: dict, slide_num: int, total: int) -> str:
    """Render a single slide to a PNG file, return its path."""
    from PIL import Image, ImageDraw, ImageFont
    import math

    img = Image.new("RGB", (SLIDE_W, SLIDE_H), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # ── Grid lines (subtle) ───────────────────────────────────────────────────
    for x in range(0, SLIDE_W, 80):
        draw.line([(x, 0), (x, SLIDE_H)], fill=(30, 30, 50), width=1)
    for y in range(0, SLIDE_H, 80):
        draw.line([(0, y), (SLIDE_W, y)], fill=(30, 30, 50), width=1)

    # ── Gradient accent bar (top) ─────────────────────────────────────────────
    for i in range(6):
        alpha = int(255 * (1 - i / 6))
        c = tuple(int(ACCENT_BLUE[j] * alpha // 255 + BG_COLOR[j] * (255 - alpha) // 255) for j in range(3))
        draw.rectangle([(0, i), (SLIDE_W, i + 1)], fill=c)

    # ── Corner decoration ─────────────────────────────────────────────────────
    draw.ellipse([(SLIDE_W - 200, -100), (SLIDE_W + 100, 200)],
                 fill=(ACCENT_PURPLE[0], ACCENT_PURPLE[1], ACCENT_PURPLE[2], 30))

    # ── Fonts (use default if custom not available) ───────────────────────────
    try:
        font_title   = ImageFont.truetype("arial.ttf", 52)
        font_bullet  = ImageFont.truetype("arial.ttf", 30)
        font_counter = ImageFont.truetype("arial.ttf", 22)
        font_brand   = ImageFont.truetype("arialbd.ttf", 28)
    except Exception:
        font_title   = ImageFont.load_default()
        font_bullet  = ImageFont.load_default()
        font_counter = ImageFont.load_default()
        font_brand   = ImageFont.load_default()

    # ── Brand watermark ───────────────────────────────────────────────────────
    draw.text((50, 30), "EDITH • AI Learning", font=font_brand, fill=ACCENT_BLUE)

    # ── Slide counter ─────────────────────────────────────────────────────────
    counter = f"{slide_num}/{total}"
    draw.text((SLIDE_W - 100, 35), counter, font=font_counter, fill=TEXT_DIM)

    # ── Neon accent line under brand ─────────────────────────────────────────
    draw.line([(50, 72), (350, 72)], fill=ACCENT_BLUE, width=2)

    # ── Title ─────────────────────────────────────────────────────────────────
    title = slide.get("title", "Slide")
    wrapped = textwrap.fill(title, width=40)
    draw.text((80, 120), wrapped, font=font_title, fill=ACCENT_BLUE)

    # ── Bullet divider line ───────────────────────────────────────────────────
    draw.line([(80, 220), (SLIDE_W - 80, 220)], fill=ACCENT_PURPLE, width=1)

    # ── Bullets ───────────────────────────────────────────────────────────────
    bullets = slide.get("bullets", [])
    y_pos = 255
    for bullet in bullets:
        wrapped_bullet = textwrap.fill(f"▸  {bullet}", width=65)
        draw.text((100, y_pos), wrapped_bullet, font=font_bullet, fill=TEXT_WHITE)
        y_pos += 55 * (wrapped_bullet.count("\n") + 1) + 10

    # ── Bottom bar ────────────────────────────────────────────────────────────
    draw.rectangle([(0, SLIDE_H - 50), (SLIDE_W, SLIDE_H)], fill=(15, 15, 25))
    draw.line([(0, SLIDE_H - 50), (SLIDE_W, SLIDE_H - 50)], fill=ACCENT_PURPLE, width=1)
    draw.text((50, SLIDE_H - 38), "Adaptive AI Learning System | EDITH",
              font=font_counter, fill=TEXT_DIM)

    # ── Progress bar ─────────────────────────────────────────────────────────
    bar_w = int((SLIDE_W - 100) * slide_num / total)
    draw.rectangle([(50, SLIDE_H - 10), (50 + bar_w, SLIDE_H - 4)], fill=ACCENT_BLUE)

    # Save
    tmp = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
    img.save(tmp.name, "PNG")
    return tmp.name


def _generate_audio(narration: str) -> str:
    """Generate a TTS audio file (MP3) for the given narration text."""
    from gtts import gTTS
    tts = gTTS(text=narration, lang="en", slow=False)
    tmp = tempfile.NamedTemporaryFile(suffix=".mp3", delete=False)
    tts.save(tmp.name)
    return tmp.name


def generate_video_lecture(study_text: str, level: str) -> str:
    """
    Main entry point.
    Returns the relative URL path to the generated video file.
    e.g.  /static/videos/<uuid>.mp4
    """
    from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips

    print(f"[ai_video_service] Generating script for level={level} …")
    slides = _generate_script(study_text, level)
    total = len(slides)

    clips = []
    tmp_images = []
    tmp_audios = []

    for i, slide in enumerate(slides, start=1):
        print(f"[ai_video_service]   Rendering slide {i}/{total}: {slide.get('title','')}")
        img_path = _render_slide_image(slide, i, total)
        aud_path = _generate_audio(slide.get("narration", ""))
        tmp_images.append(img_path)
        tmp_audios.append(aud_path)

        audio_clip = AudioFileClip(aud_path)
        duration   = audio_clip.duration + 0.5  # small buffer
        img_clip   = ImageClip(img_path).set_duration(duration).set_audio(audio_clip)
        clips.append(img_clip)

    print("[ai_video_service] Stitching video …")
    final = concatenate_videoclips(clips, method="compose")

    output_filename = f"{uuid.uuid4().hex}.mp4"
    output_path = VIDEOS_DIR / output_filename
    final.write_videofile(str(output_path), fps=24, codec="libx264",
                          audio_codec="aac", logger=None)

    # Cleanup temp files
    for p in tmp_images + tmp_audios:
        try:
            os.unlink(p)
        except Exception:
            pass

    return f"/static/videos/{output_filename}"
