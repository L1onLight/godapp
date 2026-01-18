// modules/todo/todo/api/todo.api.ts
import { apiClient } from '@/services/api.client'

export interface AuthSchema {
    username: string
    password: string
}

export interface LoginResponse {
    access_token: string
    refresh_token?: string
    // Add other fields from backend response if needed, e.g. user
}

export async function authorize(data: AuthSchema): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login/', data)
}

