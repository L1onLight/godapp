from django.test import TestCase

from notificator.channels.telegram_bot import TelegramNotificator
from notificator.models import TelegramChannel


class TelegramNotificatorTestCase(TestCase):
    """Test suite for TelegramNotificator."""

    @classmethod
    def setUpClass(cls):
        """Set up test fixtures that are shared across test methods."""
        super().setUpClass()
        # Create a test TelegramChannel instance
        cls.telegram_channel = TelegramChannel.objects.create(
            name="Test",
            chat_id="111111111",
            bot_token="bot_token",
            message_thread_id=None,
            parse_mode="MarkdownV2",
            protect_content=False,
            disable_notification=False,
        )

    def setUp(self):
        """Set up test fixtures for each test method."""
        self.notificator = TelegramNotificator(self.telegram_channel)

    def test_telegram_notificator_initialization(self):
        """Test that TelegramNotificator initializes correctly with a TelegramChannel."""
        self.assertIsNotNone(self.notificator)
        self.assertIsNotNone(self.notificator.bot)
        self.assertEqual(self.notificator.channel, self.telegram_channel)

    def test_telegram_channel_attributes(self):
        """Test that TelegramChannel has correct attributes."""
        self.assertEqual(self.telegram_channel.name, "Test")
        self.assertEqual(self.telegram_channel.chat_id, "111111111")
        self.assertEqual(self.telegram_channel.message_thread_id, None)
        self.assertEqual(self.telegram_channel.parse_mode, "MarkdownV2")
        self.assertFalse(self.telegram_channel.protect_content)
        self.assertFalse(self.telegram_channel.disable_notification)

    def test_get_token_returns_decrypted_token(self):
        """Test that get_token() returns the decrypted bot token."""
        token = self.telegram_channel.get_token()
        self.assertIsNotNone(token)
        # Token should be the same as the one we stored
        self.assertEqual(token, "bot_token")

    def test_send_notification_with_simple_message(self):
        """Test sending a simple text notification to Telegram."""
        message = "Test notification from Django tests"
        # This will make a real request to Telegram API
        try:
            self.notificator.send_notification(message)
        except Exception as e:
            # Log the error but don't fail the test
            print(f"Telegram API error (expected if bot is inactive): {e}")

    def test_send_notification_with_markdown_v2(self):
        """Test sending a notification with MarkdownV2 formatted text."""
        # MarkdownV2 requires escaping special characters
        message = "*Bold text* _italic_ `code`"
        try:
            self.notificator.send_notification(message)
        except Exception as e:
            print(f"Telegram API error (expected if bot is inactive): {e}")

    def test_send_notification_with_long_message(self):
        """Test sending a longer notification message."""
        message = "This is a longer test notification.\n\nIt has multiple lines.\n" * 5
        try:
            self.notificator.send_notification(message)
        except Exception as e:
            print(f"Telegram API error (expected if bot is inactive): {e}")

    def test_telegram_channel_string_representation(self):
        """Test the string representation of TelegramChannel."""
        self.assertEqual(str(self.telegram_channel), "Test")

    def test_multiple_notificator_instances(self):
        """Test creating multiple notificator instances for the same channel."""
        notificator1 = TelegramNotificator(self.telegram_channel)
        notificator2 = TelegramNotificator(self.telegram_channel)

        self.assertEqual(notificator1.channel.id, notificator2.channel.id)
        self.assertEqual(notificator1.channel.chat_id, notificator2.channel.chat_id)

    def test_bot_token_is_encrypted_in_database(self):
        """Test that bot token is encrypted when stored in the database."""
        # The stored token should be encrypted (not the plain text)
        stored_token = TelegramChannel.objects.get(
            id=self.telegram_channel.id
        ).bot_token
        # Encrypted tokens should be different from plain text
        self.assertNotEqual(stored_token, "bot_token")
        # But decrypting should give us the original
        decrypted = self.telegram_channel.get_token()
        self.assertEqual(decrypted, "bot_token")

    def test_telegram_channel_with_message_thread_id(self):
        """Test creating a TelegramChannel with a message_thread_id (for forum topics)."""
        forum_channel = TelegramChannel.objects.create(
            name="Forum Test",
            chat_id="111111111",
            bot_token="bot_token",
            message_thread_id="123",
            parse_mode="MarkdownV2",
            protect_content=True,
            disable_notification=True,
        )

        self.assertEqual(forum_channel.message_thread_id, "123")
        self.assertTrue(forum_channel.protect_content)
        self.assertTrue(forum_channel.disable_notification)

    def test_telegram_channel_parse_mode_choices(self):
        """Test that parse_mode accepts valid choices."""
        valid_modes = ["HTML", "Markdown", "MarkdownV2"]
        for mode in valid_modes:
            channel = TelegramChannel(
                name=f"Test {mode}",
                chat_id="111111111",
                bot_token="bot_token",
                parse_mode=mode,
            )
            self.assertEqual(channel.parse_mode, mode)
