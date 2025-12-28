export type TodoStatus = 'todo' | 'in-progress' | 'done'

export interface TodoItem {
  id: string
  title: string
  status: TodoStatus
  assignee?: string
  dueDate?: string
}

// Placeholder API that will be replaced by a real HTTP call
export async function fetchTodos(): Promise<TodoItem[]> {
  return [
    { id: '1', title: 'Draft notification templates', status: 'todo', dueDate: '2025-01-10' },
    { id: '2', title: 'Wire Kanban UX', status: 'in-progress', assignee: 'Alex' },
    { id: '3', title: 'Hook up Telegram bot', status: 'done', assignee: 'Dana' },
    { id: '4', title: 'Set up Celery schedules', status: 'todo' },
  ]
}
