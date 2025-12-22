# encrypt django management command
from django.core.management.base import BaseCommand, CommandError

from base_utils.security import CipherManager


class Command(BaseCommand):
    help = "Encrypt a given string using Fernet encryption."

    def add_arguments(self, parser):
        parser.add_argument("value", help="The string value to encrypt.")

    def handle(self, *args, **options):
        value = options["value"]

        try:
            result = CipherManager.encrypt(value)
            self.stdout.write(self.style.SUCCESS(f"Encrypted value: '{result}'"))
        except Exception as e:
            raise CommandError(f"Error during encryption: {str(e)}")
