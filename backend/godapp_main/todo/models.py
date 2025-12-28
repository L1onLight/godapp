from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone
from loguru import logger as base_logger

logger = base_logger.bind(module="todo.models")


class TodoItem(models.Model):
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name="todo_items",
    )
    title = models.CharField(max_length=200)
    is_completed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    notification_sent = models.BooleanField(default=False)
    notification_queued = models.BooleanField(default=False)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        if self.due_date:
            self._schedule_notification()

    def _schedule_notification(self):
        """Schedule notification for this todo item."""
        from todo.tasks import schedule_todo_notification

        if not self.due_date or self.is_completed:
            logger.debug(
                f"Skipping notification for TodoItem ID: {self.id} (no due_date or completed)"
            )
            return

        now = timezone.now()
        if self.due_date <= now:
            logger.warning(
                f"TodoItem ID: {self.id} due_date is in the past, skipping notification"
            )
            return

        time_until_due = (self.due_date - now).total_seconds()

        # Only schedule directly if due within 60 minutes
        # Otherwise, schedule_upcoming_window will catch it
        if time_until_due <= 3600:  # 60 minutes
            schedule_todo_notification.apply_async(
                args=[self.id, self.due_date.isoformat()], countdown=time_until_due
            )
            self.notification_queued = True
            # Use update to avoid recursion
            TodoItem.objects.filter(pk=self.pk).update(notification_queued=True)
            logger.info(
                f"Scheduled notification for TodoItem ID: {self.id} in {time_until_due:.0f} seconds"
            )
        else:
            logger.info(
                f"TodoItem ID: {self.id} due in {time_until_due / 60:.0f} minutes, "
                "will be scheduled by upcoming window task"
            )
