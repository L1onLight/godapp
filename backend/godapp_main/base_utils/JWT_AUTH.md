# JWT Authentication

This module provides JWT-based authentication for the godapp API using PyJWT and Django Ninja.

## Features

- **Login endpoint**: Authenticate users with username/password and receive JWT tokens
- **Refresh endpoint**: Exchange refresh tokens for new access tokens
- **JWTAuth class**: HttpBearer authentication for protecting endpoints

## Configuration

JWT settings can be configured in your Django settings:

```python
# Optional: Custom JWT secret (defaults to SECRET_KEY)
JWT_SECRET = "your-secret-key"
```

Token expiration defaults:
- Access tokens: 30 minutes
- Refresh tokens: 7 days

## API Endpoints

### POST /api/auth/login/

Authenticate a user and receive access and refresh tokens.

**Request:**
```json
{
  "username": "user",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

**Response (401):**
```json
{
  "detail": "Invalid credentials"
}
```

### POST /api/auth/refresh/

Refresh an access token using a valid refresh token.

**Request:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

**Response (401):**
```json
{
  "detail": "Invalid refresh token"
}
```

or

```json
{
  "detail": "Refresh token has expired"
}
```

## Usage

### Protecting Endpoints

To protect an endpoint with JWT authentication:

```python
from base_utils.api import JWTAuth
from ninja import Router

router = Router()
auth = JWTAuth()

@router.get("/protected/", auth=auth)
def protected_endpoint(request):
    user = request.auth  # The authenticated User object
    return {"message": f"Hello {user.username}!"}
```

### Example: Protected Todo Endpoint

```python
from base_utils.api import JWTAuth
from ninja import Router

todo_router = Router()
auth = JWTAuth()

@todo_router.get("/", auth=auth)
async def list_todos(request):
    user = request.auth
    todos = await TodoItemRepository.aget_by_user(user.id)
    return [TodoSchema.from_orm(todo) for todo in todos]
```

## Client Usage

### Login Flow

1. **Login to get tokens:**
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "password123"}'
```

2. **Use access token for authenticated requests:**
```bash
curl -X GET http://localhost:8000/api/todo/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

3. **Refresh token when access token expires:**
```bash
curl -X POST http://localhost:8000/api/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."}'
```

## Token Structure

### Access Token Payload
```json
{
  "user_id": 1,
  "exp": 1703088000,
  "iat": 1703086200,
  "type": "access"
}
```

### Refresh Token Payload
```json
{
  "user_id": 1,
  "exp": 1703691000,
  "iat": 1703086200,
  "type": "refresh"
}
```

## Security Notes

- Tokens are signed using HS256 algorithm
- Access tokens expire after 30 minutes
- Refresh tokens expire after 7 days
- Always use HTTPS in production
- Store tokens securely on the client side (e.g., httpOnly cookies or secure storage)
- Never expose JWT_SECRET in version control

## Testing

Run the authentication tests:

```bash
python manage.py test base_utils.tests
```

## Frontend Integration Example

```javascript
// Login
const loginResponse = await fetch('http://localhost:8000/api/auth/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'user', password: 'password123' })
});

const { access_token, refresh_token } = await loginResponse.json();

// Store tokens (example using localStorage - consider more secure options for production)
localStorage.setItem('access_token', access_token);
localStorage.setItem('refresh_token', refresh_token);

// Make authenticated request
const todosResponse = await fetch('http://localhost:8000/api/todo/', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
});

// Refresh token when needed
const refreshResponse = await fetch('http://localhost:8000/api/auth/refresh/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refresh_token: localStorage.getItem('refresh_token') })
});

const newTokens = await refreshResponse.json();
localStorage.setItem('access_token', newTokens.access_token);
localStorage.setItem('refresh_token', newTokens.refresh_token);
```
