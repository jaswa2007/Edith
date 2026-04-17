import os
import google.generativeai as genai
import json
import logging
import re
from rag_pipeline import prepare_rag_context

# Load API Key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_flashcards(study_text: str, level: str) -> list[dict]:
    # Use RAG to fetch the most essential pieces of information
    rag_query = f"Key definitions, facts, and formulas for a {level} student flashcard deck."
    rag_context = prepare_rag_context(study_text, rag_query, top_k=6)
    
    prompt = f"""
    You are an AI generating a spaced-repetition flashcard deck for a {level} student.
    Based on the following study material context, create exactly 8 flashcards.
    Each flashcard should test a single key concept.
    
    Output strictly as a JSON array where each object has:
    - "front": "A short, direct question or concept to define",
    - "back": "The concise answer or definition",
    - "difficulty": "easy" or "medium" or "hard" (guess initial difficulty based on {level})
    
    Study Material Context:
    {rag_context}
    """
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Robust JSON extraction
        json_match = re.search(r'\[.*\]', text, re.DOTALL)
        if json_match:
            text = json_match.group(0)
        elif "```json" in text:
            text = text.split("```json")[1].split("```")[0]
            
        flashcards = json.loads(text.strip())
        return flashcards
    except Exception as e:
        logging.error(f"Error parsing Gemini flashcards response: {e}")
        return []

