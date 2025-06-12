from celery.schedules import crontab

beat_schedule = {
    'fetch-everyday': {
        'task': 'tasks.fetch_and_save',
        'schedule': crontab(hour=0, minute=0),
    },
} 