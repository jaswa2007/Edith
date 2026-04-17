# EDITH - Adaptive AI Learning Assistant

EDITH is a comprehensive, full-stack educational platform designed to transform static study materials into dynamic, personalized learning experiences.

##  Project Overview
EDITH allows users to upload educational content in various formats (PDFs, Images, or Video Links). Using advanced AI text extraction and Generative AI, it processes the raw data and generates highly personalized, interactive study modules. The platform caters to different learning speeds and levels by intelligently tracking student profiles and weak topics.

##  Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, React Router DOM, Axios
- **Backend**: FastAPI, SQLAlchemy (SQLite), JWT Authentication
- **AI Integration**: Custom services for document parsing (PDF/Image) and Generative AI processing (Quizzes, Notes, Flashcards)

---

##  What is Working (Current Status)

The core foundation and heavily integrated AI modules of the platform are operational:

1. **User Authentication & State Management**:
   - Secure Login/Signup with robust JWT bearer token handling.
   - Frontend AuthContext retains state properly using `localStorage`.
   - Single Page App (SPA) navigations perfectly persist via `react-router-dom` (and resolved Netlify 404 reload issues via `_redirects`).

2. **File Processing & Text Extraction**:
   - Uploading and parsing **PDFs**.
   - OCR-based processing for **Images** to extract study text.

3. **Core AI Generation Tools**:
   - **Smart Quizzes**: Dynamic generation and grading based on the student's study text.
   - **Flashcards**: Quick-review cards created contextually from the material.
   - **Adaptive Notes (Streaming)**: Notes stream nicely to the frontend natively catering to the student's specified difficulty level (e.g., *Slow Learner*, *Expert*).
   
4. **EDITH Chat (RAG Assistant)**:
   - Capable of answering specific context-aware queries based on the uploaded document's exact text using Retrieval-Augmented parameters.

5. **History Tracking**:
   - The user's past actions (uploaded files, generated quizzes, flashcards, chats) correctly save to the SQLite database and retrieve successfully into the History Dashboard.

---

##  What is Not Working / Needs Improvement

While the core pipeline is solid, some advanced experimental features are either mock-stage, brittle, or require further stabilization:

1. **Video URL Text Extraction**:
   - The `extract_video` pipeline often encounters stability issues if it attempts to pull transcripts from dynamic pages (like heavily-guarded YouTube videos) without strict API configurations.

2. **AI Video Lecture Generation (`generate_video_lecture`)**:
   - Generating a full AI Video Lecture from text is a highly complex blocking operation (15-40s). It may timeout on slower networks or serverless platforms (like Railway) if not properly pushed to a Background Worker (like Celery/Redis). Currently runs synchronously.

3. **Student Profile Evolution ("Weak Topics")**:
   - While `weak_topics` is instantiated in the `StudentProfile` model upon Quiz interaction, the algorithm to continuously "update and fetch" these topics intelligently across multiple sessions needs further tuning to be genuinely adaptive.

4. **Production Database Constraints**:
   - The project uses standard SQLAlchemy `Base.metadata.create_all(bind=engine)` targeting SQLite. While perfectly fine for development, it does not support graceful schema migrations (Alembic) if the data models change, resulting in possible data wipes.
