import base64
import binascii

from core.settings.config import config
from cryptography.fernet import Fernet, InvalidToken


class CipherManager:
    __cipher = Fernet(config.ENCRYPTION_KEY.get_secret_value())

    @classmethod
    def encrypt(cls, value):
        _value = value if isinstance(value, bytes) else value.encode()
        return cls.__cipher.encrypt(_value).decode()

    @classmethod
    def decrypt(cls, value, base64_encoded: bool = False):
        if base64_encoded:
            value = base64.b64decode(value)

        _value = value if isinstance(value, bytes) else value.encode()
        return cls.__cipher.decrypt(_value).decode()

    @classmethod
    def is_encrypted(cls, value):
        try:
            cls.__cipher.decrypt(value.encode())
            return True
        except binascii.Error:
            return False
        except InvalidToken:
            return False
