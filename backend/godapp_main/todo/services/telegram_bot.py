import asyncio
import logging

from telegram import Bot

logger = logging.getLogger(__name__)


class TelegramBotConnector:
    """Connector to send notifications via Telegram bot."""

    def __init__(self, token: str):
        """
        Initialize Telegram bot connector.

        Args:
            token: Telegram bot token from BotFather
        """
        self.bot = Bot(token=token)

    def send_notification(
        self,
        chat_id: str,
        text: str,
        message_thread_id: str | None = None,
        parse_mode: str | None = None,
        protect_content: bool = False,
        disable_notification: bool = False,
    ):
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
                chat_id=chat_id,
                text=text,
                message_thread_id=message_thread_id,
                parse_mode=parse_mode,
                protect_content=protect_content,
                disable_notification=disable_notification,
            )
            asyncio.run(cor)

            logger.info(f"Notification sent to chat_id {chat_id}")
        except Exception as e:
            logger.error(f"Failed to send notification to chat_id {chat_id}: {e}")
            raise
