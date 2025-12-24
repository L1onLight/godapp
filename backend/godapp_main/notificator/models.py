from abc import abstractmethod

from base_utils.fields import FernetEncryptedCharField
from base_utils.security import CipherManager
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import QuerySet
from polymorphic.models import PolymorphicModel


class NotificationTemplate(models.Model):
    name = models.CharField(max_length=100)
    body = models.TextField()  # tags to replace: {username}, ...?


class NotificationChannel(PolymorphicModel):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    @abstractmethod
    def notify(self, message: str):
        pass


class TelegramChannel(NotificationChannel):
    class ParseModes(models.TextChoices):
        HTML = "HTML", "HTML"
        MARKDOWN = "Markdown", "Markdown"
        MARKDOWN_V2 = "MarkdownV2", "MarkdownV2"

    chat_id = models.CharField(max_length=100)
    bot_token = FernetEncryptedCharField(max_length=255)

    message_thread_id = models.CharField(max_length=100, null=True, blank=True)
    parse_mode = models.CharField(
        max_length=20, default=ParseModes.HTML, choices=ParseModes.choices
    )

    # Optional telegram settings
    protect_content = models.BooleanField(default=False)
    disable_notification = models.BooleanField(default=False)

    def get_token(self):
        return CipherManager.decrypt(self.bot_token)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if not CipherManager.is_encrypted(self.bot_token):
            self.bot_token = CipherManager.encrypt(self.bot_token)


class NotificatorSettings(models.Model):
    user = models.OneToOneField(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name="notificator_settings",
    )
    todo_notificators = models.ManyToManyField(
        NotificationChannel,
        blank=True,
        related_name="notificator_settings",
    )

    @classmethod
    def get_notificators(cls, user_id) -> QuerySet["NotificationChannel"]:
        try:
            settings = cls.objects.get(user__id=user_id)
            return settings.todo_notificators.all()

        except cls.DoesNotExist:
            return cls.objects.none()
