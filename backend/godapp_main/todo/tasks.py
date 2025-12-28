from datetime import timedelta

from celery import shared_task
from django.core.cache import cache
from django.utils import timezone
from loguru import logger as base_logger
from notificator.channels import NotificatorService
from notificator.models import NotificatorSettings

from todo.repository import TodoItemRepository

logger = base_logger.bind(module="todo.tasks")


@shared_task
def schedule_todo_notification(todo_id: int, due_date_iso: str):
    """
    Send notification for a todo item when its due date arrives.

    Args:
        todo_id: TodoItem ID
        due_date_iso: ISO format string of the due_date this task was scheduled for
    """
    try:
        todo = TodoItemRepository.get_by_id(todo_id)
    except TodoItemRepository.DoesNotExist:
        logger.warning(f"TodoItem ID {todo_id} not found, skipping notification")
        return

    now = timezone.now()

    # Parse the due_date that this task was scheduled for
    from datetime import datetime

    scheduled_due_date = datetime.fromisoformat(due_date_iso)
    if scheduled_due_date.tzinfo is None:
        scheduled_due_date = timezone.make_aware(scheduled_due_date)

    # Validation checks
    if todo.is_completed:
        logger.debug(f"TodoItem ID {todo_id} is completed, skipping notification")
        return

    if todo.due_date is None:
        logger.debug(f"TodoItem ID {todo_id} has no due_date, skipping notification")
        return

    # Check if due_date changed since scheduling (allow 10 second tolerance)
    time_diff = abs((todo.due_date - scheduled_due_date).total_seconds())
    if time_diff > 10:
        logger.debug(
            f"TodoItem ID {todo_id} due_date changed significantly from {scheduled_due_date} "
            f"to {todo.due_date}, skipping notification"
        )
        return

    # CRITICAL FIX: Allow notification even if slightly past due_date
    # This accounts for Celery execution delays
    time_since_due = (now - todo.due_date).total_seconds()
    if time_since_due > 300:  # More than 5 minutes late
        logger.debug(
            f"TodoItem ID {todo_id} due_date was {time_since_due:.0f}s ago, too late for notification"
        )
        return

    # Check if notification already sent recently (deduplication)
    cache_key = f"todo_notification_sent_{todo_id}"
    if cache.get(cache_key):
        logger.debug(f"Notification for TodoItem ID {todo_id} already sent recently")
        return

    # Get user's notification channels
    user_notificators = NotificatorSettings.get_notificators(user_id=todo.user.id)
    if not user_notificators.exists():
        logger.warning(f"No notificators configured for user {todo.user.id}")
        return

    # Calculate time remaining (might be negative if already past due)
    time_remaining = (todo.due_date - now).total_seconds()

    if time_remaining > 0:
        mins = int(time_remaining // 60)
        secs = int(time_remaining % 60)
        msg = f"Reminder: Your todo '{todo.title}' is due soon!\nDue in {mins} mins {secs} secs."
    else:
        # Already past due
        mins = int(abs(time_remaining) // 60)
        secs = int(abs(time_remaining) % 60)
        msg = f"Reminder: Your todo '{todo.title}' was due {mins} mins {secs} secs ago!"

    # Send notifications
    for notificator in user_notificators:
        try:
            NotificatorService.notify(notificator, msg)
            logger.info(
                f"Notification sent for TodoItem ID {todo_id} via {notificator.name}"
            )
        except Exception as e:
            logger.error(f"Failed to send notification via {notificator.name}: {e}")

    # Mark as sent and set cache to prevent duplicates
    cache.set(cache_key, True, timeout=300)  # 5 minutes cache
    TodoItemRepository.filter(id=todo_id).update(notification_sent=True)


@shared_task
def schedule_upcoming_window():
    """
    Periodic task (runs hourly) to schedule notifications for todos
    that will be due in the next 60-120 minutes window.
    """
    now = timezone.now()

    # Window should be 60-120 minutes ahead
    window_start = now + timedelta(minutes=60)
    window_end = now + timedelta(minutes=120)

    logger.info(
        f"Scheduling notifications for todos due between "
        f"{window_start.strftime('%Y-%m-%d %H:%M:%S')} and "
        f"{window_end.strftime('%Y-%m-%d %H:%M:%S')}"
    )

    # Find todos in the window that haven't been queued yet
    todos = TodoItemRepository.filter_by_due_date_range(
        start_date=window_start, end_date=window_end
    ).filter(
        is_completed=False,
        notification_sent=False,
        notification_queued=False,
    )

    scheduled_count = 0
    for todo in todos:
        try:
            # Calculate exact time until due_date
            time_until_due = (todo.due_date - now).total_seconds()

            if time_until_due <= 0:
                logger.warning(
                    f"TodoItem ID {todo.id} due_date is in the past, skipping"
                )
                continue

            # Schedule with countdown (seconds from now)
            schedule_todo_notification.apply_async(
                args=[todo.id, todo.due_date.isoformat()], countdown=time_until_due
            )

            # Mark as queued
            todo.notification_queued = True
            todo.save(update_fields=["notification_queued"])

            scheduled_count += 1
            logger.info(
                f"Scheduled notification for TodoItem ID {todo.id} "
                f"in {time_until_due / 60:.1f} minutes"
            )

        except Exception as e:
            logger.error(
                f"Failed to schedule notification for TodoItem ID {todo.id}: {e}"
            )

    logger.info(
        f"Scheduled {scheduled_count} notifications. "
        f"Found {todos.count()} todos in upcoming window."
    )
