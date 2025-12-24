import asyncio

from loguru import logger as base_logger
from telegram import Bot

from notificator.models import TelegramChannel

logger = base_logger.bind(module="telegram_bot")


class TelegramNotificator:
    """Connector to send notifications via Telegram bot."""

    def __init__(self, channel: "TelegramChannel"):
        """
        Initialize Telegram bot connector.

        Args:
            token: Telegram bot token from BotFather
        """
        token = channel.get_token()
        self.bot = Bot(token=token)
        self.channel = channel

    def send_notification(self, message: str):
        """
        Send notification message to a Telegram chat.

        Args:
            chat_id: Target chat ID
            text: Message text
            message_thread_id: Optional message thread ID for forums
            parse_mode: Optional parse mode (e.g., "HTML", "Markdown")
            protect_content: Whether to protect content from forwarding/saving
            disable_notification: Whether to disable notification sound
        """
        try:
            cor = self.bot.send_message(
                chat_id=self.channel.chat_id,
                text=message,
                message_thread_id=self.channel.message_thread_id,
                parse_mode=self.channel.parse_mode,
                protect_content=self.channel.protect_content,
                disable_notification=self.channel.disable_notification,
            )
            asyncio.run(cor)

            logger.info(f"Notification sent to chat_id {self.channel.chat_id}")
        except Exception as e:
            logger.error(
                f"Failed to send notification to chat_id {self.channel.chat_id}: {e}"
            )
            raise
