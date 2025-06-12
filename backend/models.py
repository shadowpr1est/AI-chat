# Пример модели для SQLAlchemy
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class ChatSession(Base):
    __tablename__ = 'chat_sessions'
    id = Column(Integer, primary_key=True, index=True)
    assistant = Column(String, index=True)
    messages = relationship('Message', back_populates='session')

class Message(Base):
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    role = Column(String)
    session_id = Column(Integer, ForeignKey('chat_sessions.id'))
    session = relationship('ChatSession', back_populates='messages')
