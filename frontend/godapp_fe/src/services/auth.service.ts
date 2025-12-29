// services/auth.service.ts
interface AuthTokens {
    accessToken: string
    refreshToken?: string
}

class AuthService {
    private readonly IS_AUTHENTICATED_KEY = 'isAuthenticated'

    async initializeCsrf(): Promise<void> {
        try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/csrf/`, {
                method: 'GET',
                credentials: 'include',
            })
        } catch (error) {
            console.error('Failed to initialize CSRF token:', error)
        }
    }

    isAuthenticated(): boolean {
        return localStorage.getItem(this.IS_AUTHENTICATED_KEY) === 'true'
    }

    setAuthenticated(isAuthenticated: boolean): void {
        if (isAuthenticated) {
            localStorage.setItem(this.IS_AUTHENTICATED_KEY, 'true')
        } else {
            localStorage.removeItem(this.IS_AUTHENTICATED_KEY)
        }
    }

    clearTokens(): void {
        this.setAuthenticated(false)
    }

    logout(): void {
        this.clearTokens()
        window.location.href = '/login'
    }

    async refreshAccessToken(): Promise<void> {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Send cookies (refresh token)
            body: JSON.stringify({}),
        })

        if (!response.ok) {
            this.clearTokens()
            throw new Error('Token refresh failed')
        }

        // Cookies are automatically handled by the browser with credentials: 'include'
        return
    }
}

export const authService = new AuthService()