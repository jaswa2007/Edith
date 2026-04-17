from PIL import Image
import io
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key="AIzaSyAc628Pkb2Hrzjse6iS9ZShSb8dFp9T1-M")

def extract_text_from_image(image_bytes: bytes) -> str:
    try:
        model = genai.GenerativeModel('gemini-3-flash-preview')
        img = Image.open(io.BytesIO(image_bytes))
        
        prompt = """
        You are an expert OCR assistant specialized in deciphering cursive and handwritten technical notes.
        Please extract all visible text from this image as accurately as possible. 
        Maintain the original logical structure (headers, bullet points, numbered lists).
        If technical abbreviations like 'R&D', 'TT', or 'API' appear, ensure they are transcribed correctly.
        Output ONLY the raw transcribed text.
        """
        
        response = model.generate_content([img, prompt])
        
        text = response.text.strip()
        if len(text) < 10:
            raise ValueError("The parsed text from the image is empty or too unreadable.")
            
        return f"{text}\n[Source: Image Extraction]"
    except ValueError as ve:
        raise ve
    except Exception as e:
        raise ValueError(f"Failed to process image using AI: {e}")
