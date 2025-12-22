# decrypt django management command
from django.core.management.base import BaseCommand, CommandError

from base_utils.security import CipherManager


class Command(BaseCommand):
    help = "Decrypt a given string using Fernet encryption."

    def add_arguments(self, parser):
        parser.add_argument("value", help="The string value to decrypt.")

    def handle(self, *args, **options):
        value = options["value"]

        try:
            result = CipherManager.decrypt(value)
            self.stdout.write(self.style.SUCCESS(f"Decrypted value: '{result}'"))
        except Exception as e:
            raise CommandError(f"Error during decryption: {str(e)}")
