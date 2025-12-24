from typing import TYPE_CHECKING

from loguru import logger as base_logger
from notificator.models import NotificatorSettings

if TYPE_CHECKING:
    from todo.models import TodoItem

logger = base_logger.bind(service="todo_services")


def send_todo_notification(todo: "TodoItem"):
    # Placeholder function to simulate sending a notification
    user_notificators = NotificatorSettings
    logger.info(f"Notification sent for TodoItem ID: {todo.id}")
