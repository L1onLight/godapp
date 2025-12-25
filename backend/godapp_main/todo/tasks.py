from datetime import timedelta

from celery import shared_task
from django.utils import timezone
from loguru import logger as base_logger
from notificator.channels import NotificatorService
from notificator.models import NotificatorSettings

from todo.repository import TodoItemRepository

logger = base_logger.bind(module="todo.tasks")


@shared_task
def send_todo_notification(todo_id: int):
    # Placeholder function to simulate sending a notification
    todo = TodoItemRepository.get_by_id(todo_id)
    if todo.is_completed or todo.due_date is None:
        return

    if todo.notification_sent and not todo.notification_queued:
        return

    todo.notification_queued = False
    todo.notification_sent = True
    todo.save(update_fields=["notification_queued", "notification_sent"])

    user_notificators = NotificatorSettings.get_notificators(user_id=todo.user.id)
    logger.info(f"Notification sent for TodoItem ID: {todo_id}")
    now = timezone.now()
    for notificator in user_notificators:
        print(f"Notificator type: {type(notificator)}")
        # Calculate mins and seconds and append msg like this: Due in X mins Y secs
        msg = f"Reminder: Your todo '{todo.title}' is due soon!\nDue in {(todo.due_date - now).seconds // 60} mins {(todo.due_date - now).seconds % 60} secs."

        NotificatorService.notify(notificator, msg)


@shared_task
def schedule_upcoming_window():
    window_start = timezone.now() + timedelta(minutes=60)
    window_end = timezone.now() + timedelta(minutes=120)
    logger.info(
        f"Scheduling notifications for todos due between {window_start} and {window_end}"
    )

    todos = TodoItemRepository.filter_by_due_date_range(
        start_date=window_start, end_date=window_end
    ).filter(
        is_completed=False,
        notification_sent=False,
    )
    logger.info(f"Found {todos.count()} todos to schedule notifications for.")

    for todo in todos:
        send_todo_notification.apply_async(args=[todo.id], eta=todo.due_date)
        todo.notification_queued = True
        todo.save(update_fields=["notification_queued"])
