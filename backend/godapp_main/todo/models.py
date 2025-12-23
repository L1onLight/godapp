from django.contrib.auth import get_user_model
from django.db import models


class TodoItem(models.Model):
    user = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name="todo_items",
    )
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    until = models.DateTimeField(null=True, blank=True)
    notification_sent = models.BooleanField(default=False)

    def __str__(self):
        return self.title
