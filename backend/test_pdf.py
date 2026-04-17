import fitz
import os
from pdf_service import extract_text_from_pdf

doc = fitz.open()
page = doc.new_page()
page.insert_text((50, 50), "Test PDF for OCR", fontsize=50)
pdf_bytes = doc.write()

print("Testing extract_text_from_pdf:")
try:
    text = extract_text_from_pdf(pdf_bytes)
    print("SUCCESS EXTRACTING TEXT")
    print(text[:100])
except Exception as e:
    import traceback
    traceback.print_exc()
