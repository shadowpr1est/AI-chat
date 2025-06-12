from pydantic import BaseModel
from typing import List, Optional

class MessageSchema(BaseModel):
    id: int
    content: str
    role: str
    class Config:
        orm_mode = True

class ChatSessionSchema(BaseModel):
    id: int
    assistant: str
    messages: List[MessageSchema] = []
    class Config:
        orm_mode = True

class CreateMessageRequest(BaseModel):
    message: str
    assistant: str

class CreateSessionRequest(BaseModel):
    assistant: str

class GetHistoryResponse(BaseModel):
    messages: List[MessageSchema]
