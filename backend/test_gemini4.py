import fitz
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel('gemini-2.5-flash')
doc = fitz.open()

page = doc.new_page()
page.insert_text((50, 50), "Hello World", fontsize=50)
pix = page.get_pixmap(dpi=150)

jpeg_bytes = pix.tobytes("jpeg")
part = {
    "mime_type": "image/jpeg",
    "data": jpeg_bytes
}

try:
    response = model.generate_content([part, "Extract text"])
    print("SUCCESS 1 IMG:", response.text.replace('\n', ' ')[:100])
except Exception as e:
    print("FAILED 1 IMG:", type(e).__name__, e)
