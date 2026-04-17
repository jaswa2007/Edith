from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    histories = relationship("History", back_populates="owner")
    profile = relationship("StudentProfile", back_populates="user", uselist=False)

class History(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    action_type = Column(String) # 'pdf', 'video', 'image', 'text', 'quiz', 'notes'
    title = Column(String)
    content = Column(Text) # JSON string or raw text
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="histories")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    detected_level = Column(String, default="Average Student")
    weak_topics = Column(String, default="")
    historical_quiz_performance = Column(String, default="{}") # JSON string representation

    user = relationship("User", back_populates="profile")
