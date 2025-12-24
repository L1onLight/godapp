from notificator.models import NotificationChannel, TelegramChannel

from .telegram_bot import TelegramNotificator


class NotificatorService:
    @classmethod
    def get_channel_notificator(
        cls, channel: NotificationChannel
    ) -> "NotificatorService":
        if isinstance(channel, TelegramChannel):
            return TelegramNotificator(channel)
        raise ValueError("Unsupported notification channel type")

    @classmethod
    def notify(cls, channel: NotificationChannel, message: str):
        channel: TelegramNotificator = cls.get_channel_notificator(channel)
        channel.send_notification(message)
