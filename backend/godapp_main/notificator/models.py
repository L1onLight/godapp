from django.db import models
from polymorphic.models import PolymorphicModel
from base_utils.fields import FernetEncryptedCharField

class NotificationTemplate(models.Model):
    name = models.CharField(max_length=100)
    body = models.TextField() # tags to replace: {username}, ...?


class NotificationChannel(PolymorphicModel):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
class TelegramChannel(NotificationChannel):
    chat_id = models.CharField(max_length=100)
    bot_token = FernetEncryptedCharField(max_length=200)

    message_thread_id = models.CharField(max_length=100, null=True, blank=True)
    parse_mode = models.CharField(max_length=20, default="HTML")

    # Optional telegram settings
    protect_content = models.BooleanField(default=False)
    disable_notification = models.BooleanField(default=False)
