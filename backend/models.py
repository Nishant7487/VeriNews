from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from .database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, index=True, primary_key=True)
    news_text = Column(String, nullable=False)
    prediction_result = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
