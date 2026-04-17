"""
Notes Generator — wraps Gemini-powered adaptive notes generation.
Keeps ai_service.py backward-compatible while providing dedicated module.
"""
from ai_service import generate_adaptive_notes, generate_quiz
from level_detector import detect_level

def generate_notes_for_score(study_text: str, score: int) -> dict:
    """
    Given the study text and quiz score, detects level and generates notes.
    Returns { level, notes }
    """
    level = detect_level(score)
    notes = generate_adaptive_notes(study_text, level)
    return {"level": level, "notes": notes}


def generate_notes_for_level(study_text: str, level: str) -> str:
    """
    Generate adaptive notes for a pre-determined level string.
    """
    return generate_adaptive_notes(study_text, level)
