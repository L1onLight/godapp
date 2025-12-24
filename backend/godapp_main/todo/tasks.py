from datetime import timedelta

from celery import shared_task
from django.utils import timezone

from todo.repository import TodoItemRepository
from todo.services import send_todo_notification


@shared_task
def check_task_for_overdue(todo_id):
    try:
        todo = TodoItemRepository.get_by_id(todo_id)
    except TodoItemRepository.DoesNotExist:
        return
    if todo.is_completed or todo.due_date is None:
        return

    if not todo.is_completed and todo.due_date <= timezone.now():
        send_todo_notification(todo)


@shared_task
def schedule_upcoming_window():
    window_start = timezone.now() + timedelta(minutes=60)
    window_end = timezone.now() + timedelta(minutes=120)

    todos = TodoItemRepository.filter_by_due_date_range(
        start_date=window_start, end_date=window_end
    ).filter(
        is_completed=False,
        notification_sent=False,
    )

    for todo in todos:
        send_todo_notification.apply_async(
            args=[todo.id, todo.due_date], eta=todo.due_date
        )
