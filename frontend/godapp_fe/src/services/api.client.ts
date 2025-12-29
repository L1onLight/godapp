// services/api.client.ts
import { authService } from './auth.service'

class ApiClient {
    private baseURL: string
    private isRefreshing = false
    private failedQueue: Array<{
        resolve: () => void
        reject: (error: Error) => void
    }> = []

    constructor(baseURL: string) {
        this.baseURL = baseURL
    }

    private async processQueue(error: Error | null) {
        this.failedQueue.forEach(promise => {
            if (error) {
                promise.reject(error)
            } else {
                promise.resolve()
            }
        })
        this.failedQueue = []
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const config: RequestInit = {
            credentials: 'include', // Send cookies with every request
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Request-Headers': 'true',
                'Access-Control-Request-Method': 'PUT',
                ...options.headers,
            },
        }

        let response = await fetch(`${this.baseURL}${endpoint}`, config)

        // Handle token refresh on 401
        if (response.status === 401) {
            if (this.isRefreshing) {
                // Wait for token refresh
                return new Promise((resolve, reject) => {
                    this.failedQueue.push({ resolve, reject })
                }).then(() => {
                    // Retry request with refreshed cookies
                    return fetch(`${this.baseURL}${endpoint}`, config).then(r => r.json())
                })
            }

            this.isRefreshing = true

            try {
                await authService.refreshAccessToken()
                this.processQueue(null)

                // Retry request with new cookies
                response = await fetch(`${this.baseURL}${endpoint}`, config)
            } catch (error) {
                this.processQueue(error as Error)
                authService.logout()
                throw error
            } finally {
                this.isRefreshing = false
            }
        }

        if (!response.ok) {
            // Handle 401 Unauthorized
            if (response.status === 401) {
                authService.logout()
                return Promise.reject(new Error('Unauthorized - please login again'))
            }

            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || `HTTP ${response.status}`)
        }

        return response.json()
    }

    get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' })
    }

    post<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        })
    }

    patch<T>(endpoint: string, data: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        })
    }

    put<T>(endpoint: string, data: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' })
    }
}

export const apiClient = new ApiClient(
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
)