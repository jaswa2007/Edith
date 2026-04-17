import os
import google.generativeai as genai
import json
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


model = genai.GenerativeModel('gemini-2.0-flash')

from rag_pipeline import prepare_rag_context

def _parse_json(text: str):

    import re
    
    json_match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL)
    if json_match:
        text = json_match.group(1)
    else:
        
        generic_match = re.search(r'```\s*(.*?)\s*```', text, re.DOTALL)
        if generic_match:
            text = generic_match.group(1)
        else:

            array_match = re.search(r'\[.*\]', text, re.DOTALL)
            object_match = re.search(r'\{.*\}', text, re.DOTALL)
            if array_match:
                text = array_match.group(0)
            elif object_match:
                text = object_match.group(0)
    
    try:
        return json.loads(text.strip())
    except Exception as e:
        logger.error(f"JSON Parse Error: {e} | Text: {text[:200]}...")
        raise e

def generate_quiz(study_text: str, weak_topics: str = "") -> list:

    rag_context = prepare_rag_context(study_text, "Core concepts and testable facts for a knowledge quiz")
    
    memory_injection = f"The student is particularly weak in the following memory topics: {weak_topics}. Please ensure at least 2 questions test these concepts if they exist." if weak_topics else ""
    
    prompt = f"""
    You are an expert educator. Based on the following study material, generate exactly 5 conceptual quiz questions. 
    The questions should test understanding and core concepts, not just memory.
    {memory_injection}
    
    Output the result STRICTLY as a JSON array where each object has:
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "The EXACT correct option text from the options array"

    Study Material:
    {rag_context}
    """
    try:
        response = model.generate_content(prompt)
        return _parse_json(response.text)
    except Exception as e:
        logger.error(f"Error generating/parsing quiz: {e}")
        return []

def generate_adaptive_notes(study_text: str, level: str, weak_topics: str = "") -> str:
    instructions = ""
    if level == "Slow Learner":
        instructions = "Provide very simple explanations, only essential exam points, important definitions, and bullet points that help pass exams. Keep it brief and easy to digest."
    elif level == "Average Student":
        instructions = "Provide structured notes, clear explanations, key concepts, and short examples."
    elif level == "Topper" or level == "Advanced Student":
        instructions = "Provide detailed explanations, advanced concept understanding, concept relationships, and possible exam questions."
        
    rag_query = f"Generate comprehensive summary notes suitable for a {level} student based on the core topics."
    rag_context = prepare_rag_context(study_text, rag_query, top_k=8) # Fetch slightly more chunks for notes
        
    memory_injection = f"\nThe student is particularly weak in: {weak_topics}. Please explain these topics thoroughly if they appear in the material." if weak_topics else ""

    prompt = f"""
    You are an AI teaching assistant creating personalized study notes based on a student's learning level.
    The student's level is: {level}.
    
    Instructions tailored for this level:
    {instructions}
    {memory_injection}
    
    Based on the following retrieved relevant study material context, generate the personalized notes. Format the notes in clear, beautiful Markdown with engaging structure.
    
    Study Material Context:
    {rag_context}
    """
    
    response = model.generate_content(prompt)
    return response.text

def stream_adaptive_notes(study_text: str, level: str, weak_topics: str = ""):
    instructions = ""
    if level == "Slow Learner":
        instructions = "Provide very simple explanations, only essential exam points, important definitions, and bullet points that help pass exams. Keep it brief and easy to digest."
    elif level == "Average Student":
        instructions = "Provide structured notes, clear explanations, key concepts, and short examples."
    elif level == "Topper" or level == "Advanced Student":
        instructions = "Provide detailed explanations, advanced concept understanding, concept relationships, and possible exam questions."
        
    rag_query = f"Generate comprehensive summary notes suitable for a {level} student based on the core topics."
    rag_context = prepare_rag_context(study_text, rag_query, top_k=8)
        
    memory_injection = f"\nThe student is particularly weak in: {weak_topics}. Please explain these topics thoroughly if they appear in the material." if weak_topics else ""

    prompt = f"""
    You are an AI teaching assistant creating personalized study notes based on a student's learning level.
    The student's level is: {level}.
    
    Instructions tailored for this level:
    {instructions}
    {memory_injection}
    
    Based on the following retrieved relevant study material context, generate the personalized notes. Format the notes in clear, beautiful Markdown with engaging structure. Do not use very short fragments.
    
    Study Material Context:
    {rag_context}
    """
    
    response = model.generate_content(prompt, stream=True)
    for chunk in response:
        if chunk.text:
            yield chunk.text

def answer_question(query: str, study_text: str, level: str) -> str:
    """Answers a specific student question based on the study material using RAG."""
    rag_context = prepare_rag_context(study_text, query, top_k=5)
    
    prompt = f"""
    You are EDITH, an AI teaching assistant. A student (Level: {level}) has asked a question about their study material.
    
    Instructions:
    1. Answer the question accurately using the provided context.
    2. Keep the tone encouraging and helpful.
    3. Tailor the complexity of your language to the student's level ({level}).
    4. If the answer is not in the context, use your general knowledge but mention it might not be in the specific material.
    
    Context:
    {rag_context}
    
    Question: {query}
    """
    
    response = model.generate_content(prompt)
    return response.text
