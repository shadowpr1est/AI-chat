# Backend AI-chatbot

## Запуск через Docker Compose

1. Скопируйте .env.example в .env и заполните ключи:
   ```bash
   cp .env.example .env
   ```
   Пример DATABASE_URL для PostgreSQL:
   ```
   DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres
   ```
2. Соберите и запустите сервисы:
   ```bash
   docker-compose up --build
   ```
3. FastAPI будет доступен на http://localhost:8000

4. После первого запуска создайте таблицы в БД:
   ```bash
   docker-compose exec backend python -c "from database import Base, engine; Base.metadata.create_all(bind=engine)"
   ```

## Структура
- `main.py` — FastAPI API
- `assistant/` — ассистенты (OpenAI, Gemini, Claude)
- `tasks.py` — Celery задачи (ежедневный парсинг)
- `beat_schedule.py` — расписание задач
- `database.py` — подключение к БД
- `models.py` — ORM модели
- `schemas.py` — Pydantic схемы

## Пример запроса к API
```bash
curl -X POST http://localhost:8000/chat \
  -H 'Content-Type: application/json' \
  -d '{"message": "Привет!", "assistant": "openai"}'
``` 