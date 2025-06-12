from celery import Celery
import requests
import redis
import os
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Message

celery_app = Celery('tasks', broker='redis://redis:6379/0')

REDIS_HOST = os.getenv('REDIS_HOST', 'redis')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0)

@celery_app.task
def fetch_and_save():
    data = requests.get("https://example.com").text
    redis_client.set('last_fetched_data', data)
    print("Fetched and saved data to Redis")
    # Сохраняем в PostgreSQL
    db: Session = SessionLocal()
    try:
        msg = Message(content=data[:255], role="fetch")
        db.add(msg)
        db.commit()
        print("Saved data to PostgreSQL")
    finally:
        db.close()
