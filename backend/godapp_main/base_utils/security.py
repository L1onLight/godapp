import base64
import binascii
from datetime import datetime, timedelta
from typing import Optional

import jwt
from core.settings.config import config
from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from ninja.security import APIKeyCookie, HttpBasicAuth

# JWT Configuration
JWT_SECRET = getattr(settings, "JWT_SECRET", settings.SECRET_KEY)
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7


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
        print(f"Cookies: {request.COOKIES}")
        try:
            user = authenticate(request, username=username, password=password)
            request.user = user
            return bool(user)
        except Exception:
            return None


class JWTAuth(APIKeyCookie):
    param_name = "access_token"

    def authenticate(self, request, token: str) -> Optional[User]:
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id: int = payload.get("user_id")
            token_type: str = payload.get("type")

            if user_id is None or token_type != "access":
                return None

            # Check if token is expired
            exp = payload.get("exp")
            if exp and datetime.utcnow().timestamp() > exp:
                return None

            user = User.objects.get(id=user_id)
            request.user = user
            return user
        except (jwt.InvalidTokenError, User.DoesNotExist):
            return None

    def create_access_token(user_id: int) -> str:
        """Create JWT access token"""
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "user_id": user_id,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access",
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    def create_refresh_token(user_id: int) -> str:
        """Create JWT refresh token"""
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        payload = {
            "user_id": user_id,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh",
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
