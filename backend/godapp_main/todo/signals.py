from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from loguru import logger as base_logger

from todo.tasks import send_todo_notification

from .models import TodoItem

logger = base_logger.bind(module="todo.signals")


@receiver(post_save, sender=TodoItem)
def check_due_to_date(sender, instance: TodoItem, created, **kwargs):
    now = timezone.now()
    time_window = now + timezone.timedelta(minutes=60)
    due_to_in_seconds = (
        (instance.due_date - now).total_seconds() if instance.due_date else None
    )
    instance.refresh_from_db()
    logger.info(f"Due to in seconds: {due_to_in_seconds}")
    if (
        not instance.due_date
        or instance.is_completed
        or instance.due_date >= time_window
        or instance.notification_queued
        or instance.notification_sent
    ):
        logger.debug(
            "Due date is either not set, todo is completed, or due date is within the next hour. Skipping scheduling."
        )
        return

    if due_to_in_seconds is not None:
        logger.info(f"Scheduling notification for TodoItem ID: {instance.id}")
        send_todo_notification.apply_async(
            args=[instance.id, instance.due_date], eta=instance.due_date
        )
        instance.notification_queued = True
        instance.save(update_fields=["notification_queued"])
