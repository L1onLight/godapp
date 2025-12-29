import jwt
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import HttpResponse
from ninja import Router, Schema

from base_utils.security import JWT_ALGORITHM, JWT_SECRET, JWTAuth

base_router = Router()


class LoginSchema(Schema):
    username: str
    password: str


class TokenSchema(Schema):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshSchema(Schema):
    refresh_token: str


class ErrorSchema(Schema):
    detail: str


@base_router.post(
    "/login/", response={200: TokenSchema, 401: ErrorSchema}, tags=["Auth"]
)
def login(request, response: HttpResponse, payload: LoginSchema):
    """
    User login endpoint. Returns access and refresh tokens.
    """
    user = authenticate(username=payload.username, password=payload.password)

    if user is None:
        return 401, {"detail": "Invalid credentials"}

    access_token = JWTAuth.create_access_token(user.id)
    refresh_token = JWTAuth.create_refresh_token(user.id)
    print(request.COOKIES)
    response.set_cookie(
        "access_token",
        access_token,
        httponly=True,
        expires=30 * 60,
    )
    response.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        expires=7 * 24 * 60 * 60,
    )
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@base_router.post(
    "/refresh/", response={200: TokenSchema, 401: ErrorSchema}, tags=["Auth"]
)
def refresh(request, response: HttpResponse, payload: RefreshSchema):
    """
    Refresh access token using a valid refresh token.
    """
    try:
        decoded = jwt.decode(
            payload.refresh_token, JWT_SECRET, algorithms=[JWT_ALGORITHM]
        )
        user_id: int = decoded.get("user_id")
        token_type: str = decoded.get("type")

        if user_id is None or token_type != "refresh":
            return 401, {"detail": "Invalid refresh token"}

        # Verify user still exists
        try:
            User.objects.get(id=user_id)
        except User.DoesNotExist:
            return 401, {"detail": "User not found"}

        # Create new tokens
        access_token = JWTAuth.create_access_token(user_id)
        refresh_token = JWTAuth.create_refresh_token(user_id)
        response.set_cookie(
            "access_token",
            access_token,
            httponly=True,
            secure=True,
            samesite="Lax",
        )
        response.set_cookie(
            "refresh_token", refresh_token, httponly=True, secure=True, samesite="Lax"
        )
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }
    except jwt.ExpiredSignatureError:
        return 401, {"detail": "Refresh token has expired"}
    except jwt.InvalidTokenError:
        return 401, {"detail": "Invalid refresh token"}
