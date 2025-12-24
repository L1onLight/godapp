from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from .models import TodoItem


@receiver(post_save, sender=TodoItem)
def check_due_to_date(sender, instance: TodoItem, created, **kwargs):
    now = timezone.now()
    time_window = now + timezone.timedelta(minutes=60)
    due_to_in_seconds = (
        (instance.due_date - now).total_seconds() if instance.due_date else None
    )
    if (
        not instance.due_date
        or instance.is_completed
        or instance.due_date <= time_window
    ):
        return

    if due_to_in_seconds is not None:
        instance.schedule_notification(due_to_in_seconds)
        instance.notification_queued = True
        instance.save(update_fields=["notification_queued"])
