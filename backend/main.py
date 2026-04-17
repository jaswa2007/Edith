from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, status, BackgroundTasks, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
import uvicorn
import os
from pathlib import Path
from sqlalchemy.orm import Session
from jose import JWTError, jwt
import logging
import time

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("backend.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

from database import engine, SessionLocal, get_db
import models
import auth
from pdf_service import extract_text_from_pdf
from ocr_service import extract_text_from_image
from video_service import extract_text_from_video
from ai_service import generate_quiz, generate_adaptive_notes, stream_adaptive_notes, answer_question
from ai_video_service import generate_video_lecture
from flashcard_service import generate_flashcards
from level_detector import detect_level

# Initialize database tables
models.Base.metadata.create_all(bind=engine)

# Ensure static directory exists
STATIC_DIR = Path(__file__).parent / "static"
STATIC_DIR.mkdir(exist_ok=True)
(STATIC_DIR / "videos").mkdir(exist_ok=True)

app = FastAPI(title="EDITH Adaptive AI Learning Assistant API")

# Serve generated video files
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"Path: {request.url.path} | Method: {request.method} | Status: {response.status_code} | Time: {process_time:.4f}s")
    return response

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic Schemas
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class VideoRequest(BaseModel):
    url: str

class WorkflowRequest(BaseModel):
    text: str

class NotesRequest(BaseModel):
    text: str
    level: str

class GenerateVideoRequest(BaseModel):
    text: str
    level: str

class VideoResponse(BaseModel):
    video_url: str

class ChatRequest(BaseModel):
    query: str
    text: str
    level: str

class HistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    action_type: str
    title: str
    content: str
    timestamp: str

# Helper to get current user
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# Auth Routes
@app.post("/auth/signup", response_model=Token)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(name=user.name, email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = auth.create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
async def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# History Routes
@app.get("/history")
async def get_history(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    history = db.query(models.History).filter(models.History.user_id == current_user.id).order_by(models.History.timestamp.desc()).all()
    return history

# Existing features with history recording
@app.post("/extract-pdf")
async def extract_pdf(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        contents = await file.read()
        text = extract_text_from_pdf(contents)
        
        # Record history
        new_history = models.History(
            action_type="pdf",
            title=file.filename,
            content=text[:500] + "...", # Store preview to avoid huge DB size for text
            user_id=current_user.id
        )
        db.add(new_history)
        db.commit()
        
        return {"text": text}
    except Exception as e:
        logger.error(f"Error extracting PDF: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/extract-image")
async def extract_image(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        contents = await file.read()
        text = extract_text_from_image(contents)
        
        # Record history
        new_history = models.History(
            action_type="image",
            title=file.filename,
            content=text[:500] + "...",
            user_id=current_user.id
        )
        db.add(new_history)
        db.commit()
        
        logger.info(f"Extracted {len(text)} characters from image {file.filename}")
        return {"text": text}
    except Exception as e:
        logger.error(f"Error extracting Image: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/extract-video")
async def extract_video(req: VideoRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        text = extract_text_from_video(req.url)
        
        # Record history
        new_history = models.History(
            action_type="video",
            title=req.url,
            content=text[:500] + "...",
            user_id=current_user.id
        )
        db.add(new_history)
        db.commit()
        
        return {"text": text}
    except Exception as e:
        logger.error(f"Error extracting Video: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/generate-quiz")
async def get_quiz(req: WorkflowRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        # Fetch or create student profile
        profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
        if not profile:
            profile = models.StudentProfile(user_id=current_user.id)
            db.add(profile)
            db.commit()
            db.refresh(profile)

        quiz = generate_quiz(req.text, weak_topics=profile.weak_topics)
        
        # Record history for generated quiz
        new_history = models.History(
            action_type="quiz",
            title="Generated Quiz",
            content=str(quiz), # Store the quiz structure
            user_id=current_user.id
        )
        db.add(new_history)
        db.commit()
        
        return {"quiz": quiz}
    except Exception as e:
        logger.error(f"Error generating quiz: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-notes")
async def get_notes(req: NotesRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        # Fetch or create student profile
        profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
        if not profile:
            profile = models.StudentProfile(user_id=current_user.id)
            db.add(profile)
            db.commit()
            db.refresh(profile)

        def save_history(content: str):
            # Because Session is bound to request, in background task we need a new session
            # Or just let it run. Better to use a fresh session for background tasks.
            db_bg = SessionLocal()
            try:
                new_history = models.History(
                    action_type="notes",
                    title=f"Adaptive Notes ({req.level})",
                    content=content,
                    user_id=current_user.id
                )
                db_bg.add(new_history)
                db_bg.commit()
            finally:
                db_bg.close()

        async def item_generator():
            full_content = ""
            for chunk in stream_adaptive_notes(req.text, req.level, weak_topics=profile.weak_topics):
                full_content += chunk
                yield chunk
            
            # Save history in the background once completed
            background_tasks.add_task(save_history, full_content)

        return StreamingResponse(item_generator(), media_type="text/plain")
        
    except Exception as e:
        logger.error(f"Error generating notes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-video", response_model=VideoResponse)
async def generate_video_endpoint(
    req: GenerateVideoRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Generate an AI video lecture from study material and level."""
    try:
        # Generate video (blocking, can take 15-40s)
        video_url = generate_video_lecture(req.text, req.level)

        # Record in history
        new_history = models.History(
            action_type="video_lecture",
            title=f"AI Video Lecture ({req.level})",
            content=f"Generated video lecture for level: {req.level}",
            user_id=current_user.id
        )
        db.add(new_history)
        db.commit()

        return {"video_url": video_url}
    except Exception as e:
        logger.error(f"Error generating video: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-flashcards")
async def get_flashcards(req: NotesRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        flashcards = generate_flashcards(req.text, req.level)
        
        new_history = models.History(
            action_type="flashcards",
            title=f"Flashcards ({req.level})",
            content=str(flashcards),
            user_id=current_user.id
        )
        db.add(new_history)
        db.commit()

        return {"flashcards": flashcards}
    except Exception as e:
        logger.error(f"Error generating flashcards: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_endpoint(req: ChatRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        # Use existing RAG flow to answer question
        answer = answer_question(req.query, req.text, req.level)
        
        # Record in history (optional, but good for tracking)
        new_history = models.History(
            action_type="chat",
            title=f"Chat: {req.query[:30]}...",
            content=answer,
            user_id=current_user.id
        )
        db.add(new_history)
        db.commit()

        return {"answer": answer}
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
