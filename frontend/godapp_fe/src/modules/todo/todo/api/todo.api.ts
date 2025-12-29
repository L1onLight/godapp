// modules/todo/todo/api/todo.api.ts
import { apiClient } from '@/services/api.client'

export type TodoColumn = 'UNASSIGNED' | 'TO_DO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED'

export interface TodoItem {
  id: number
  title: string
  description?: string
  column: TodoColumn
  column_order: number
  due_date?: string
  created_at: string
  is_completed: boolean
}

export type TodoCreateInput = {
  title: string
  description?: string
  column?: TodoColumn
  column_order?: number
  due_date?: string | null
  is_completed?: boolean
}

export type TodoUpdateInput = Partial<{
  title: string
  description: string
  column: TodoColumn
  column_order: number
  due_date: string | null
  is_completed: boolean
}>

export async function fetchTodos(): Promise<TodoItem[]> {
  return apiClient.get<TodoItem[]>('/todo/')
}

export async function fetchTodo(id: number): Promise<TodoItem> {
  return apiClient.get<TodoItem>(`/todo/${id}/`)
}

export async function createTodo(data: TodoCreateInput): Promise<TodoItem> {
  return apiClient.post<TodoItem>('/todo/', data)
}

export async function updateTodo(id: number, data: TodoUpdateInput): Promise<TodoItem> {
  // OpenAPI specifies PUT on /api/todo/{todo_id}/
  return apiClient.put<TodoItem>(`/todo/${id}/`, data)
}

export async function archiveTodo(id: number): Promise<void> {
  await apiClient.delete<void>(`/todo/${id}/`)
}

export async function deleteTodo(id: number): Promise<void> {
  await apiClient.delete<void>(`/todo/${id}/delete/`)
}