import fitz
from PIL import Image
import google.generativeai as genai
import os
from dotenv import load_dotenv
import traceback

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel('gemini-2.5-flash')
doc = fitz.open()

images = []
for _ in range(5):
    page = doc.new_page()
    page.insert_text((50, 50), "Hello World", fontsize=50)
    pix = page.get_pixmap(dpi=150)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    images.append(img)

images.append("Extract text from all pages.")

try:
    response = model.generate_content(images)
    print("SUCCESS", response.text[:100])
except Exception as e:
    print("FAILED", e)
