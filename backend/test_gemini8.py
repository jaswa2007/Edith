import fitz
import google.generativeai as genai
import traceback

genai.configure(api_key="AIzaSyAc628Pkb2Hrzjse6iS9ZShSb8dFp9T1-M")

model = genai.GenerativeModel('gemini-2.5-flash-lite')
doc = fitz.open()

images = []
for _ in range(5):
    page = doc.new_page()
    page.insert_text((50, 50), "Hello World", fontsize=50)
    jpeg_bytes = page.get_pixmap(dpi=150).tobytes("jpeg")
    images.append({"mime_type": "image/jpeg", "data": jpeg_bytes})

try:
    response = model.generate_content([*images, "Extract text"])
    print("SUCCESS 2.5 FLASH LITE:", response.text.replace('\n', ' ')[:100])
except Exception as e:
    traceback.print_exc()
