// modules/todo/todo/api/todo.api.ts
import { apiClient } from '@/services/api.client'

export type TodoColumn = 'UNASSIGNED' | 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED'

export interface TodoItem {
  id: number
  title: string
  column: TodoColumn
  column_order: number
  due_date?: string
  created_at: string
  is_completed: boolean

}

export async function fetchTodos(): Promise<TodoItem[]> {
  return apiClient.get<TodoItem[]>('/todo/')
}

export async function createTodo(data: Omit<TodoItem, 'id'>): Promise<TodoItem> {
  return apiClient.post<TodoItem>('/todo/', data)
}

export async function updateTodo(id: string, data: Partial<TodoItem>): Promise<TodoItem> {
  return apiClient.patch<TodoItem>(`/todo/${id}`, data)
}

export async function deleteTodo(id: string): Promise<void> {
  return apiClient.delete<void>(`/todo/${id}`)
}