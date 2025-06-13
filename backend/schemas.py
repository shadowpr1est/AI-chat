from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MessageSchema(BaseModel):
    id: int
    content: str
    role: str
    created_at: datetime
    class Config:
        orm_mode = True

class ChatSessionSchema(BaseModel):
    id: int
    title: str
    assistant: str
    created_at: datetime
    updated_at: Optional[datetime]
    messages: List[MessageSchema] = []
    class Config:
        orm_mode = True

class CreateChatRequest(BaseModel):
    assistant: str
    title: Optional[str] = 'Новый чат'

class UpdateChatRequest(BaseModel):
    title: str

class CreateMessageRequest(BaseModel):
    message: str
    assistant: str
    chatId: Optional[int] = None

class ChatListResponse(BaseModel):
    chats: List[ChatSessionSchema]
