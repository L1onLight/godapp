import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Calendar } from 'lucide-react'
import { fetchTodos, createTodo, updateTodo, type TodoColumn, type TodoItem } from '../api/todo.api'


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
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newColumn, setNewColumn] = useState<TodoColumn>('UNASSIGNED')
  const [newDueDate, setNewDueDate] = useState<string>('')

  const [selected, setSelected] = useState<TodoItem | null>(null)
  const [editTitle, setEditTitle] = useState<string>('')
  const [editDescription, setEditDescription] = useState<string>('')
  const [editColumn, setEditColumn] = useState<TodoColumn>('UNASSIGNED')
  const [editDueDate, setEditDueDate] = useState<string>('')

  useEffect(() => {
    fetchTodos().then((data) => {
      setTodos(data)
      setLoading(false)
    })
  }, [])



  function resetAddForm() {
    setNewTitle('')
    setNewDescription('')
    setNewColumn('UNASSIGNED')
    setNewDueDate('')
  }

  async function handleAddTodo() {
    if (!newTitle.trim()) return
    const payload = {
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      column: newColumn,
      due_date: newDueDate ? new Date(newDueDate).toISOString() : null,
    }
    const created = await createTodo(payload)
    setTodos((prev) => [created, ...prev])
    resetAddForm()
    setShowAdd(false)
  }

  function openEditor(item: TodoItem) {
    setSelected(item)
    setEditTitle(item.title)
    setEditDescription(item.description || '')
    setEditColumn(item.column)
    setEditDueDate(item.due_date ? toLocalInputDate(item.due_date) : '')
  }

  function toLocalInputDate(value: string) {
    // Convert ISO string to yyyy-MM-ddTHH:mm for input[type="datetime-local"]
    const d = new Date(value)
    const pad = (n: number) => String(n).padStart(2, '0')
    const yyyy = d.getFullYear()
    const mm = pad(d.getMonth() + 1)
    const dd = pad(d.getDate())
    const hh = pad(d.getHours())
    const mi = pad(d.getMinutes())
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
  }

  async function handleSaveEdit() {
    if (!selected) return
    const payload = {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      column: editColumn,
      due_date: editDueDate ? new Date(editDueDate).toISOString() : null,
    }
    const updated = await updateTodo(selected.id, payload)
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)))
    setSelected(null)
  }

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
                  <div className="p-4 border rounded-md space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="new-title">Title</Label>
                        <Input id="new-title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="new-column">Column</Label>
                        <select
                          id="new-column"
                          className="h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                          value={newColumn}
                          onChange={(e) => setNewColumn(e.target.value as TodoColumn)}
                        >
                          <option value="UNASSIGNED">Unassigned</option>
                          <option value="TO_DO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label htmlFor="new-description">Description</Label>
                        <textarea
                          id="new-description"
                          className="h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label htmlFor="new-due">Due date</Label>
                        <input
                          id="new-due"
                          type="datetime-local"
                          className="h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                          value={newDueDate}
                          onChange={(e) => setNewDueDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => { resetAddForm(); setShowAdd(false) }}>Cancel</Button>
                      <Button onClick={handleAddTodo}>Create</Button>
                    </div>
                  </div>
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

                {selected && (
                  <div className="mt-4 p-4 border rounded-md space-y-3">
                    <div className="text-sm font-medium text-muted-foreground">Edit Todo</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="edit-title">Title</Label>
                        <Input id="edit-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="edit-column">Column</Label>
                        <select
                          id="edit-column"
                          className="h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                          value={editColumn}
                          onChange={(e) => setEditColumn(e.target.value as TodoColumn)}
                        >
                          <option value="UNASSIGNED">Unassigned</option>
                          <option value="TO_DO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <textarea
                          id="edit-description"
                          className="h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label htmlFor="edit-due">Due date</Label>
                        <input
                          id="edit-due"
                          type="datetime-local"
                          className="h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                      <Button onClick={handleSaveEdit}>Save</Button>
                    </div>
                  </div>
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