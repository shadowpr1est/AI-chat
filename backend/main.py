from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from assistant import get_assistant_response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db
from models import ChatSession, Message
from schemas import (
    ChatSessionSchema, MessageSchema, CreateMessageRequest,
    CreateChatRequest, UpdateChatRequest, ChatListResponse
)
from typing import List
from sqlalchemy import desc

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Можно заменить на ["http://localhost:5173"] для безопасности
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/chats", response_model=ChatListResponse)
def get_chats(db: Session = Depends(get_db)):
    """Получить список всех чатов"""
    chats = db.query(ChatSession).order_by(desc(ChatSession.updated_at)).all()
    return {"chats": chats}

@app.post("/chats", response_model=ChatSessionSchema)
def create_chat(data: CreateChatRequest, db: Session = Depends(get_db)):
    """Создать новый чат"""
    chat = ChatSession(
        title=data.title,
        assistant=data.assistant
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat

@app.get("/chats/{chat_id}", response_model=ChatSessionSchema)
def get_chat(chat_id: int, db: Session = Depends(get_db)):
    """Получить чат по ID"""
    chat = db.query(ChatSession).filter(ChatSession.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat

@app.put("/chats/{chat_id}", response_model=ChatSessionSchema)
def update_chat(chat_id: int, data: UpdateChatRequest, db: Session = Depends(get_db)):
    """Обновить заголовок чата"""
    chat = db.query(ChatSession).filter(ChatSession.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    chat.title = data.title
    db.commit()
    db.refresh(chat)
    return chat

@app.delete("/chats/{chat_id}")
def delete_chat(chat_id: int, db: Session = Depends(get_db)):
    """Удалить чат"""
    chat = db.query(ChatSession).filter(ChatSession.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    db.delete(chat)
    db.commit()
    return {"status": "success"}

@app.post("/chat", response_model=MessageSchema)
def chat(req: CreateMessageRequest, db: Session = Depends(get_db)):
    """Отправить сообщение в чат"""
    # Если chatId не указан, создаём новый чат
    if not req.chatId:
        chat = ChatSession(assistant=req.assistant)
        db.add(chat)
        db.commit()
        db.refresh(chat)
    else:
        chat = db.query(ChatSession).filter(ChatSession.id == req.chatId).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        if chat.assistant != req.assistant:
            raise HTTPException(status_code=400, detail="Assistant mismatch")

    # Сохраняем сообщение пользователя
    user_msg = Message(content=req.message, role="user", session_id=chat.id)
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # Получаем ответ ассистента
    response = get_assistant_response(req.message, req.assistant)
    assistant_msg = Message(content=response, role="assistant", session_id=chat.id)
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)
    return assistant_msg
