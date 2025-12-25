from celery import shared_task
from django.utils import timezone
from loguru import logger as base_logger
from notificator.channels import NotificatorService
from notificator.models import NotificatorSettings

from todo.repository import TodoItemRepository

logger = base_logger.bind(service="todo_services")


@shared_task
def send_todo_notification(todo_id: int):
    # Placeholder function to simulate sending a notification
    todo = TodoItemRepository.get_by_id(todo_id)
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
