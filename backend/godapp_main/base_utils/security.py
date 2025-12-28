import base64
import binascii

from core.settings.config import config
from cryptography.fernet import Fernet, InvalidToken
from django.contrib.auth import authenticate
from ninja.security import HttpBasicAuth


class CipherManager:
    __cipher = Fernet(config.ENCRYPTION_KEY.get_secret_value())

    @classmethod
    def encrypt(cls, value):
        _value = value if isinstance(value, bytes) else value.encode()
        _enc_val = cls.__cipher.encrypt(_value).decode()
        return _enc_val

    @classmethod
    def decrypt(cls, value, base64_encoded: bool = False):
        try:
            if base64_encoded:
                value = base64.b64decode(value)

            _value = value if isinstance(value, bytes) else value.encode()
            return cls.__cipher.decrypt(_value).decode()
        except Exception:
            return None

    @classmethod
    def is_encrypted(cls, value):
        try:
            cls.__cipher.decrypt(value.encode())
            return True
        except (binascii.Error, InvalidToken):
            return False


class NinjaBasicAuth(HttpBasicAuth):
    def authenticate(self, request, username, password):
        try:
            user = authenticate(request, username=username, password=password)
            request.user = user
            return bool(user)
        except Exception:
            return None
