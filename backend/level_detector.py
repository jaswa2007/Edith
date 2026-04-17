"""
Level Detector — classifies student performance based on quiz score.
"""

def detect_level(score: int) -> str:
    """
    Returns the student level label based on quiz score (out of 5).
    0-2: Slow Learner
    3-4: Average Student
    5: Topper
    """
    if score <= 2:
        return "Slow Learner"
    elif score <= 4:
        return "Average Student"
    else:
        return "Topper"


def get_level_emoji(level: str) -> str:
    return {
        "Slow Learner": "🌱",
        "Average Student": "📚",
        "Topper": "🏆",
    }.get(level, "🎓")


def get_level_color(level: str) -> str:
    return {
        "Slow Learner": "#ff6b6b",
        "Average Student": "#ffd93d",
        "Topper": "#00e5ff",
    }.get(level, "#ffffff")
