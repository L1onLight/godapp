from datetime import timedelta

from celery.schedules import crontab


class TaskTimer:
    EACH_5_SECONDS = timedelta(seconds=5)
    EACH_10_SECONDS = timedelta(seconds=10)
    EACH_30_SECONDS = timedelta(seconds=30)
    EACH_MINUTE = crontab(minute="*")
    EACH_5_MINUTES = crontab(minute="*/5")
    EACH_60_MINUTES = crontab(minute="0", hour="*")

    # Specific
    TODO_CHECK = EACH_60_MINUTES


SCHEDULE = {
    "todo.tasks.schedule_upcoming_window": {
        "task": "todo.tasks.schedule_upcoming_window",
        "schedule": TaskTimer.TODO_CHECK,
    },
}
