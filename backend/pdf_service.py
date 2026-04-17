import os
from io import BytesIO
from pypdf import PdfReader
import fitz  # PyMuPDF
from PIL import Image
import google.generativeai as genai
import logging
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY", "AIzaSyAc628Pkb2Hrzjse6iS9ZShSb8dFp9T1-M"))

logging.basicConfig(level=logging.INFO)

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    text = ""
    try:
        reader = PdfReader(BytesIO(pdf_bytes))
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text += f"{page_text}\n[Source: PDF Page {i+1}]\n"
    except Exception as e:
        logging.error(f"PyPDF extraction failed: {e}")
        
    # If text is too short or empty, consider it a scanned PDF and fallback to OCR via Gemini
    if len(text.strip()) < 50:
        logging.info("Text too short, attempting AI OCR on PDF pages...")
        try:
            model = genai.GenerativeModel('gemini-3-flash-preview')
            ocr_text = ""
            pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
            max_pages = min(len(pdf_document), 5) # Cap at 5 pages for MVP speed
            
            prompt_contents = []
            for page_num in range(max_pages):
                page = pdf_document.load_page(page_num)
                pix = page.get_pixmap(dpi=150)
                # Compress into JPEG explicitly to avoid 20MB payload limit crash!
                jpeg_bytes = pix.tobytes("jpeg")
                if jpeg_bytes:
                    prompt_contents.append({
                        "mime_type": "image/jpeg",
                        "data": jpeg_bytes
                    })
                
            prompt_contents.append("Extract all the text seen in these sequential document pages. Output only the raw text exactly as written, with no formatting or markdown. If there is no text, output nothing.")
            
            # Make a SINGLE API call to respect Rate Limits
            response = model.generate_content(prompt_contents)
            if response.text:
                ocr_text = response.text
                text = ocr_text
        except Exception as e:
            logging.error(f"PDF AI OCR extraction failed: {e}")
            raise ValueError("Failed to process PDF text using AI OCR. Error: " + str(e))
            
    if len(text.strip()) < 50:
        raise ValueError("The provided PDF appears to be completely empty or unreadable.")
        
    return text.strip()
