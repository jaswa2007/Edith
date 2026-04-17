import fitz
import google.generativeai as genai
import traceback

genai.configure(api_key="AIzaSyAc628Pkb2Hrzjse6iS9ZShSb8dFp9T1-M")

model = genai.GenerativeModel('gemini-1.5-flash')
doc = fitz.open()
page = doc.new_page()
page.insert_text((50, 50), "Hello World", fontsize=50)
jpeg_bytes = page.get_pixmap(dpi=150).tobytes("jpeg")
part = {"mime_type": "image/jpeg", "data": jpeg_bytes}

try:
    response = model.generate_content([part, "Extract text"])
    print("SUCCESS 1.5 FLASH:", response.text.replace('\n', ' ')[:100])
except Exception as e:
    traceback.print_exc()
