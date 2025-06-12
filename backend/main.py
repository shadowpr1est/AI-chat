from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from assistant import get_assistant_response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal
from models import ChatSession, Message
from schemas import ChatSessionSchema, MessageSchema, CreateMessageRequest
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/sessions", response_model=List[ChatSessionSchema])
def get_sessions(db: Session = Depends(get_db)):
    return db.query(ChatSession).all()

@app.post("/sessions", response_model=ChatSessionSchema)
def create_session(data: BaseModel, db: Session = Depends(get_db)):
    assistant = data.assistant
    session = ChatSession(assistant=assistant)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@app.get("/history/{assistant}", response_model=List[MessageSchema])
def get_history(assistant: str, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter_by(assistant=assistant).first()
    if not session:
        return []
    return session.messages

@app.post("/chat", response_model=MessageSchema)
def chat(req: CreateMessageRequest, db: Session = Depends(get_db)):
    # Получаем или создаём сессию для ассистента
    session = db.query(ChatSession).filter_by(assistant=req.assistant).first()
    if not session:
        session = ChatSession(assistant=req.assistant)
        db.add(session)
        db.commit()
        db.refresh(session)
    # Сохраняем сообщение пользователя
    user_msg = Message(content=req.message, role="user", session_id=session.id)
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)
    # Получаем ответ ассистента
    response = get_assistant_response(req.message, req.assistant)
    assistant_msg = Message(content=response, role="assistant", session_id=session.id)
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)
    return assistant_msg
