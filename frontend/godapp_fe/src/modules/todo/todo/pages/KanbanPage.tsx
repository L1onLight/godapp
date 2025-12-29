import { useEffect, useMemo, useState } from 'react'
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

const columnConfig: Record<TodoColumn, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    'UNASSIGNED': { label: 'Unassigned', variant: 'outline' },
    'TO_DO': { label: 'To Do', variant: 'secondary' },
    'IN_PROGRESS': { label: 'In Progress', variant: 'default' },
    'DONE': { label: 'Done', variant: 'outline' },
    'ARCHIVED': { label: 'Archived', variant: 'secondary' },
}

function KanbanPage() {
    const [todos, setTodos] = useState<TodoItem[]>([])
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

        })
    }, [])

    const columns = useMemo(
        () => ({
            'UNASSIGNED': todos.filter((item) => item.column === 'UNASSIGNED').sort((a, b) => a.column_order - b.column_order),
            'TO_DO': todos.filter((item) => item.column === 'TO_DO').sort((a, b) => a.column_order - b.column_order),
            'IN_PROGRESS': todos.filter((item) => item.column === 'IN_PROGRESS').sort((a, b) => a.column_order - b.column_order),
            'DONE': todos.filter((item) => item.column === 'DONE').sort((a, b) => a.column_order - b.column_order),
            'ARCHIVED': todos.filter((item) => item.column === 'ARCHIVED').sort((a, b) => a.column_order - b.column_order),
        }),
        [todos],
    )

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

    function findNeighbors(item: TodoItem) {
        const list = todos
            .filter((t) => t.column === item.column)
            .sort((a, b) => a.column_order - b.column_order)
        const idx = list.findIndex((t) => t.id === item.id)
        return { list, idx, prev: idx > 0 ? list[idx - 1] : null, next: idx < list.length - 1 ? list[idx + 1] : null }
    }

    async function moveUp(item: TodoItem) {
        const { prev } = findNeighbors(item)
        if (!prev) return
        const a = await updateTodo(item.id, { column_order: prev.column_order })
        const b = await updateTodo(prev.id, { column_order: item.column_order })
        setTodos((prevState) => prevState.map((t) => {
            if (t.id === a.id) return { ...t, column_order: a.column_order }
            if (t.id === b.id) return { ...t, column_order: b.column_order }
            return t
        }))
    }

    async function moveDown(item: TodoItem) {
        const { next } = findNeighbors(item)
        if (!next) return
        const a = await updateTodo(item.id, { column_order: next.column_order })
        const b = await updateTodo(next.id, { column_order: item.column_order })
        setTodos((prevState) => prevState.map((t) => {
            if (t.id === a.id) return { ...t, column_order: a.column_order }
            if (t.id === b.id) return { ...t, column_order: b.column_order }
            return t
        }))
    }

    async function moveToColumn(item: TodoItem, target: TodoColumn) {
        if (item.column === target) return
        const maxOrder = Math.max(
            0,
            ...todos.filter((t) => t.column === target).map((t) => t.column_order)
        )
        const updated = await updateTodo(item.id, { column: target, column_order: maxOrder + 1 })
        setTodos((prevState) => prevState.map((t) => t.id === item.id ? { ...t, column: updated.column, column_order: updated.column_order } : t))
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <header className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Module</p>
                <h1 className="text-4xl font-bold tracking-tight">Todos</h1>
                <p className="text-lg text-muted-foreground">Track tasks in list or Kanban view.</p>
            </header>



            {/* Kanban View */}
            <section className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">View</p>
                            <CardTitle>Kanban</CardTitle>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowAdd((s) => !s)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add todo
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {showAdd && (
                            <div className="mb-4 p-4 border rounded-md space-y-3">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {Object.entries(columns).map(([column, items]) => (
                                <div key={column} className="space-y-3">
                                    <div className="flex items-center justify-between pb-2 border-b">
                                        <span className="font-semibold text-sm">
                                            {columnConfig[column as TodoColumn].label}
                                        </span>
                                        <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                                            {items.length}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2 min-h-[100px]">
                                        {items.map((item) => (
                                            <Card key={item.id} className="hover:shadow-md transition-shadow">
                                                <CardContent className="p-4 space-y-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="font-medium text-sm leading-snug cursor-pointer" onClick={() => openEditor(item)}>{item.title}</p>
                                                        <div className="flex gap-1">
                                                            <Button variant="outline" size="sm" onClick={() => moveUp(item)}>Up</Button>
                                                            <Button variant="outline" size="sm" onClick={() => moveDown(item)}>Down</Button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            className="h-8 rounded-md border bg-transparent px-2 py-1 text-xs"
                                                            value={item.column}
                                                            onChange={(e) => moveToColumn(item, e.target.value as TodoColumn)}
                                                        >
                                                            <option value="UNASSIGNED">Unassigned</option>
                                                            <option value="TO_DO">To Do</option>
                                                            <option value="IN_PROGRESS">In Progress</option>
                                                            <option value="DONE">Done</option>
                                                            <option value="ARCHIVED">Archived</option>
                                                        </select>
                                                        {item.due_date && (
                                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                Due {formatDateTime(item.due_date)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        {items.length === 0 && (
                                            <div className="text-center py-8 text-sm text-muted-foreground">
                                                No items.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

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
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}

export default KanbanPage