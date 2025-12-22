from base_utils.fields import FernetEncryptedCharField
from django.db import models
from polymorphic.models import PolymorphicModel


class NotificationTemplate(models.Model):
    name = models.CharField(max_length=100)
    body = models.TextField()  # tags to replace: {username}, ...?


class NotificationChannel(PolymorphicModel):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class TelegramChannel(NotificationChannel):
    class ParseModes(models.TextChoices):
        HTML = "HTML", "HTML"
        MARKDOWN = "Markdown", "Markdown"
        MARKDOWN_V2 = "MarkdownV2", "MarkdownV2"

    chat_id = models.CharField(max_length=100)
    bot_token = FernetEncryptedCharField(max_length=200)

    message_thread_id = models.CharField(max_length=100, null=True, blank=True)
    parse_mode = models.CharField(
        max_length=20, default=ParseModes.HTML, choices=ParseModes.choices
    )

    # Optional telegram settings
    protect_content = models.BooleanField(default=False)
    disable_notification = models.BooleanField(default=False)

    def communicate(self, message: str):
        from todo.services.telegram_bot import TelegramBotConnector

        bot = TelegramBotConnector(token=self.bot_token)
        bot.send_notification(
            chat_id=self.chat_id,
            text=message,
            message_thread_id=self.message_thread_id,
            parse_mode=self.parse_mode,
            protect_content=self.protect_content,
            disable_notification=self.disable_notification,
        )
