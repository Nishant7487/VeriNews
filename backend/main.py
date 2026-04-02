from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
import logging
from . import models
from .database import engine, SessionLocal
from .predictor import FakeNewsPredictor
from .fact_checker import verify_with_google
from .scraper import fetch_article_from_url
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# 1. SABSE PEHLE APP BANAO
app = FastAPI(title="VeriNews API (Secured)")

# 2. PHIR US APP PAR LIMITER ATTACH KARO
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'ml_model', 'verinews_probability_model.pkl')
predictor = None

def get_predictor():
    global predictor
    if predictor is None:
        try:
            logging.info("Loading ML model...")
            predictor = FakeNewsPredictor(MODEL_PATH)
            logging.info("Model loaded successfully")
        except Exception as e:
            logging.error(f"Model loading failed: {e}")
            raise e
    return predictor

SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_for_local_dev_only_998877")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
class NewsRequest(BaseModel):
    text: str

class URLRequest(BaseModel):
    url: str

class UserCreate(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# 5. Authentication Helpers
def verify_password(plain_password: str, hashed_password: str):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# 6. API Routes
@app.get("/")
async def root():
    return {"status": "online", "model_loaded": predictor is not None, "security": "enabled"}

@app.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}

@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.username}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/predict")
@limiter.limit("10/minute")
async def predict_news(request: Request, payload: NewsRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if len(payload.text.split()) < 50:
        raise HTTPException(status_code=400, detail="Text is too short. Provide 50+ words.")
    
    try:
        model = get_predictor()
        result = model.predict(payload.text)
        
        fact_check_data = await verify_with_google(payload.text)
        
        db_record = models.PredictionHistory(
            news_text=payload.text,
            prediction_result=result["prediction"],
            confidence_score=result["confidence"],
            owner_id=current_user.id
        )
        db.add(db_record)
        db.commit()
        
        return {
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "top_words": result.get("top_words", []),
            "status": "success",
            "fact_check": fact_check_data  
        }
    except Exception as e:
        logging.error(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail="Model not available")

@app.get("/history")
async def get_history(limit: int = 10, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        records = db.query(models.PredictionHistory)\
                    .filter(models.PredictionHistory.owner_id == current_user.id)\
                    .order_by(models.PredictionHistory.timestamp.desc())\
                    .limit(limit)\
                    .all()
        return {"history": records}
    except Exception as e:
        logging.error(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch history")

@app.delete("/history")
async def clear_history(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        db.query(models.PredictionHistory).filter(models.PredictionHistory.owner_id == current_user.id).delete()
        db.commit()
        return {"message": "User history cleared successfully"}
    except Exception as e:
        db.rollback()
        logging.error(f"Delete Error: {e}")
        raise HTTPException(status_code=500, detail="Could not clear history")

@app.post("/scrape")
async def scrape_url(request: URLRequest, current_user: models.User = Depends(get_current_user)):
    extracted_text = await fetch_article_from_url(request.url)
    
    if not extracted_text or len(extracted_text.split()) < 50:
        raise HTTPException(status_code=400, detail="Could not extract enough text from this URL. The site might be blocking bots, or the article is too short.")
        
    return {"text": extracted_text}