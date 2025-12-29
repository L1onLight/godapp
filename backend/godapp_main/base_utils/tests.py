import jwt
from django.contrib.auth.models import User
from django.test import TestCase
from ninja.testing import TestClient

from base_utils.api import base_router, create_access_token, create_refresh_token


class JWTAuthTestCase(TestCase):
    def setUp(self):
        self.client = TestClient(base_router)
        self.user = User.objects.create_user(
            username="testuser", password="testpassword123", email="test@example.com"
        )

    def test_login_success(self):
        """Test successful login"""
        response = self.client.post(
            "/login/", json={"username": "testuser", "password": "testpassword123"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access_token", response.json())
        self.assertIn("refresh_token", response.json())
        self.assertEqual(response.json()["token_type"], "bearer")

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = self.client.post(
            "/login/", json={"username": "testuser", "password": "wrongpassword"}
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Invalid credentials")

    def test_refresh_token_success(self):
        """Test successful token refresh"""
        refresh_token = create_refresh_token(self.user.id)
        response = self.client.post("/refresh/", json={"refresh_token": refresh_token})
        self.assertEqual(response.status_code, 200)
        self.assertIn("access_token", response.json())
        self.assertIn("refresh_token", response.json())

    def test_refresh_token_invalid(self):
        """Test refresh with invalid token"""
        response = self.client.post(
            "/refresh/", json={"refresh_token": "invalid_token"}
        )
        self.assertEqual(response.status_code, 401)
        self.assertIn("Invalid refresh token", response.json()["detail"])

    def test_access_token_structure(self):
        """Test access token has correct structure"""
        from base_utils.api import JWT_ALGORITHM, JWT_SECRET

        token = create_access_token(self.user.id)
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        self.assertEqual(decoded["user_id"], self.user.id)
        self.assertEqual(decoded["type"], "access")
        self.assertIn("exp", decoded)
        self.assertIn("iat", decoded)

    def test_refresh_token_structure(self):
        """Test refresh token has correct structure"""
        from base_utils.api import JWT_ALGORITHM, JWT_SECRET

        token = create_refresh_token(self.user.id)
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        self.assertEqual(decoded["user_id"], self.user.id)
        self.assertEqual(decoded["type"], "refresh")
        self.assertIn("exp", decoded)
        self.assertIn("iat", decoded)
