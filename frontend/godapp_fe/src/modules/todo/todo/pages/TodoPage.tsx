import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar } from 'lucide-react'
import { fetchTodos, type TodoColumn, type TodoItem } from '../api/todo.api'


function formatDateTime(value?: string | Date) {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value) : value
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${dd}.${mm}.${yyyy} ${hh}:${mi}`
}
function getItemDateColor(item: TodoItem): string {
  // If not is_completed and due_date is past, return 'text-destructive'
  // if not is_completed and due_date is within 30 minutes, return 'text-warning'
  // else return ''
  if (item.is_completed || !item.due_date) return ''
  const now = new Date()
  const dueDate = new Date(item.due_date)
  if (dueDate < now) {
    return '!text-destructive'
  }
  const diffMs = dueDate.getTime() - now.getTime()
  const diffMins = diffMs / (1000 * 60)
  console.log(diffMins)
  if (diffMins <= 30) {
    return '!text-yellow-600'
  }
  return ''

}
const columnConfig: Record<TodoColumn, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  'UNASSIGNED': { label: 'Unassigned', variant: 'outline' },
  'TO_DO': { label: 'To Do', variant: 'secondary' },
  'IN_PROGRESS': { label: 'In Progress', variant: 'default' },
  'DONE': { label: 'Done', variant: 'outline' },
  'ARCHIVED': { label: 'Archived', variant: 'secondary' },
}

function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodos().then((data) => {
      setTodos(data)
      setLoading(false)
    })
  }, [])

  const columns = useMemo(
    () => ({
      'UNASSIGNED': todos.filter((item) => item.column === 'UNASSIGNED'),
      'TO_DO': todos.filter((item) => item.column === 'TO_DO'),
      'IN_PROGRESS': todos.filter((item) => item.column === 'IN_PROGRESS'),
      'DONE': todos.filter((item) => item.column === 'DONE'),
      'ARCHIVED': todos.filter((item) => item.column === 'ARCHIVED'),
    }),
    [todos],
  )

  return (
    <div className="container mx-auto p-6 space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Module</p>
        <h1 className="text-4xl font-bold tracking-tight">Todos</h1>
        <p className="text-lg text-muted-foreground">Track tasks in list or Kanban view.</p>
      </header>

      {/* List View */}
      <section className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">View</div>
              <CardTitle>List</CardTitle>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add todo
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-4 pb-2 p-3 border-b text-sm font-medium text-muted-foreground">
                  <span>Title</span>
                  <span>Column</span>
                  <span>Due</span>
                </div>
                {todos.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-3 gap-4 p-3 border-b last:border-0 items-center hover:bg-muted/50 transition-colors rounded-md"
                  >
                    <div className="font-medium">{item.title}</div>
                    <Badge variant={columnConfig[item.column].variant}>
                      {columnConfig[item.column].label}
                    </Badge>
                    <div className={"text-sm text-muted-foreground flex items-center gap-1 " + (getItemDateColor(item))}>
                      {item.due_date && <Calendar className="h-3 w-3" />}
                      {formatDateTime(item.due_date)}
                    </div>
                  </div>
                ))}
                {todos.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No todos yet.</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

    </div>
  )
}

export default TodoPage