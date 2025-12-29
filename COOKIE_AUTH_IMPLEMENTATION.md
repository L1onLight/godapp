# Cookie-Based Authentication Implementation

## Summary
Updated the application to use **httpOnly cookies** for JWT token storage and transmission instead of localStorage, providing better security for authentication.

## Backend Changes

### [base_utils/api.py](base_utils/api.py)
- **Token Creation**: Functions `create_access_token()` and `create_refresh_token()` now at module level (not inside class)
- **Cookie Helper**: New `set_auth_cookies()` function to set httpOnly, secure cookies
- **Login Endpoint**: 
  - Returns HttpResponse with httpOnly cookies instead of JSON tokens
  - Tokens stored server-side in cookies, never exposed in response body
  - Response: `{"message": "Login successful"}`
- **Refresh Endpoint**:
  - Accepts refresh token from cookies (`request.COOKIES.get("refresh_token")`)
  - No JSON body payload needed
  - Returns HttpResponse with refreshed httpOnly cookies
  - Response: `{"message": "Token refreshed"}`
- **Configuration**:
  - `SECURE_COOKIES`: Controls if cookies use `secure` flag (default: False for dev, True for production)
  - `SAMESITE_MODE`: Sets SameSite policy (default: "Lax")

### [base_utils/tests.py](base_utils/tests.py)
- Updated tests to verify cookies are set in responses
- Tests check `response.cookies["access_token"]["httponly"]` is True
- Refresh token test extracts cookie value and sets it on new client

## Frontend Changes

### [src/services/api.client.ts](src/services/api.client.ts)
- **Credentials**: Added `credentials: 'include'` to all fetch requests
  - Automatically sends/receives cookies with every request
  - Browser handles cookie persistence transparently
- **Token Refresh**: Simplified queue logic - no longer manages token values
  - Queue stores resolve/reject callbacks instead of tokens
  - Cookies automatically included by browser on retry
- **Error Handling**: Maintains 401 retry and logout flow

### [src/services/auth.service.ts](src/services/auth.service.ts)
- Removed localStorage token management for access/refresh tokens
- Kept minimal `isAuthenticated` flag in localStorage for UI state
- **Methods Removed**:
  - `getAccessToken()`: Browser sends cookies automatically
  - `setTokens()`: Cookies set server-side
- **Methods Updated**:
  - `refreshAccessToken()`: No longer returns token, sends `credentials: 'include'`
  - `clearTokens()`: Only clears authentication state flag

## Security Benefits

1. **httpOnly Flag**: Cookies cannot be accessed via JavaScript (prevents XSS token theft)
2. **Automatic Handling**: Browser sends cookies automatically with each request
3. **Reduced XSS Surface**: Tokens never exposed in response bodies or accessible to JavaScript
4. **Secure Transmission**: Optional `secure` flag ensures HTTPS-only transmission in production
5. **SameSite Protection**: Prevents CSRF attacks with SameSite cookie policy

## API Endpoints

### POST /api/auth/login/
**Request:**
```json
{
  "username": "user",
  "password": "password"
}
```

**Response** (200):
```json
{
  "message": "Login successful"
}
```
**Cookies Set:**
- `access_token`: httpOnly, expires in 30 minutes
- `refresh_token`: httpOnly, expires in 7 days

### POST /api/auth/refresh/
**Request:** (No body needed, cookies sent automatically)
```json
{}
```

**Response** (200):
```json
{
  "message": "Token refreshed"
}
```
**Cookies Set:**
- New `access_token`: httpOnly, expires in 30 minutes
- New `refresh_token`: httpOnly, expires in 7 days

## Configuration

Add to your Django settings for production:
```python
SECURE_COOKIES = True  # Enable secure flag
SAMESITE_MODE = "Strict"  # or "Lax" or "None"
```

## Frontend Usage Example

```typescript
// Login - tokens automatically stored in httpOnly cookies
const loginResponse = await apiClient.post('/auth/login/', {
  username: 'user',
  password: 'password'
})

// Subsequent requests automatically include cookies
const todosResponse = await apiClient.get('/todo/')
// Cookie is automatically sent by browser

// Logout
authService.logout()
// Clears authentication state and redirects
```

## Testing

Run authentication tests:
```bash
python manage.py test base_utils.tests
```

All tests verify:
- Cookies are properly set with httpOnly flag
- Tokens are created with correct structure
- Refresh flow works with cookies
- Invalid credentials are rejected
