// modules/todo/todo/api/todo.api.ts
import { apiClient } from '@/services/api.client'

export type TodoStatus = 'todo' | 'in-progress' | 'done'

export interface AuthSchema {
    username: string
    password: string
}

export interface LoginResponse {
    accessToken: string
    refreshToken?: string
    // Add other fields from backend response if needed, e.g. user
}

export async function authorize(data: AuthSchema): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login/', data)
}

