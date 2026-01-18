import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// Removed unused Input/Label imports after refactor
import { Plus, Calendar } from 'lucide-react'
import { fetchTodos, updateTodo, type TodoColumn, type TodoItem } from '../api/todo.api'
import { TaskWindow } from './TaskWindow'
import { CreateTaskWindow } from '../components/CreateTaskWindow'


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
  if (dueDate < now && item.column !== "ARCHIVED") {
    return '!text-destructive'
  }
  const diffMs = dueDate.getTime() - now.getTime()
  const diffMins = diffMs / (1000 * 60)
  if (diffMins <= 30 && item.column !== "ARCHIVED") {
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
  const [showAdd, setShowAdd] = useState(false)
  // Creation handled via CreateTaskWindow

  const [selected, setSelected] = useState<TodoItem | null>(null)

  useEffect(() => {
    fetchTodos().then((data) => {
      setTodos(data)
      setLoading(false)
    })
  }, [])



  // Creation handled via CreateTaskWindow

  function openEditor(item: TodoItem) {
    setSelected(item)
  }

  // Edit form states removed; editing handled inside TaskWindow

  // Removed unused handleSaveEdit after refactor; edits handled in TaskWindow

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
            <Button variant="outline" size="sm" onClick={() => setShowAdd((s) => !s)}>
              <Plus className="mr-2 h-4 w-4" />
              Add todo
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-2">
                {showAdd && (
                  <CreateTaskWindow
                    initialColumn={'UNASSIGNED'}
                    onClose={() => setShowAdd(false)}
                    onCreate={(created) => {
                      setTodos(prev => [created, ...prev])
                    }}
                  />
                )}
                <div className="grid grid-cols-3 gap-4 pb-2 p-3 border-b text-sm font-medium text-muted-foreground">
                  <span>Title</span>
                  <span>Column</span>
                  <span>Due</span>
                </div>
                {todos.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-3 gap-4 p-3 border-b last:border-0 items-center hover:bg-muted/50 transition-colors rounded-md cursor-pointer"
                    onClick={() => openEditor(item)}
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

      {/* Task Detail Modal */}
      {selected && (
        <TaskWindow
          task={selected}
          onClose={() => setSelected(null)}
          onUpdate={(updated) => {
            setTodos(prev => prev.map(t => t.id === updated.id ? updated : t))
            setSelected(updated)
          }}
          onArchive={async (item) => {
            await updateTodo(item.id, { column: 'ARCHIVED' })
            setTodos(prev => prev.map(t => t.id === item.id ? { ...t, column: 'ARCHIVED' } : t))
            setSelected(null)
          }}
        />
      )}

    </div>
  )
}

export default TodoPage