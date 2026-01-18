class AuthService {
    private readonly IS_AUTHENTICATED_KEY = 'isAuthenticated'

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

    getCurrentPath(): string {
        return `${window.location.pathname}${window.location.search}`
    }

    logout(backTo?: string | null): void {
        this.clearTokens()
        const target = backTo && backTo.startsWith('/') ? backTo : undefined
        const qs = target ? `?back=${encodeURIComponent(target)}` : ''
        window.location.href = `/login${qs}`
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
        return
    }
}

export const authService = new AuthService()