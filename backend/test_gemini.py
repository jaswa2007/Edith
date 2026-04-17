import fitz
from PIL import Image
import google.generativeai as genai
import os
from dotenv import load_dotenv
import traceback

load_dotenv()
genai.configure(api_key=os.getenv("AIzaSyAc628Pkb2Hrzjse6iS9ZShSb8dFp9T1-M"))

model = genai.GenerativeModel('gemini-1.5-pro')
doc = fitz.open()
page = doc.new_page()
page.insert_text((50, 50), "Hello World", fontsize=50)
pix = page.get_pixmap(dpi=150)
img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

try:
    response = model.generate_content([img, "Extract text"])
    print("SUCCESS", response.text)
except Exception as e:
    print("FAILED")
    traceback.print_exc()
