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

const columnConfig: Record<TodoColumn, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    'UNASSIGNED': { label: 'Unassigned', variant: 'outline' },
    'TO_DO': { label: 'To Do', variant: 'secondary' },
    'IN_PROGRESS': { label: 'In Progress', variant: 'default' },
    'DONE': { label: 'Done', variant: 'outline' },
    'ARCHIVED': { label: 'Archived', variant: 'secondary' },
}

function KanbanPage() {
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



            {/* Kanban View */}
            <section className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">View</p>
                            <CardTitle>Kanban</CardTitle>
                        </div>
                        <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add todo
                        </Button>
                    </CardHeader>
                    <CardContent>
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
                                            <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
                                                <CardContent className="p-4 space-y-2">
                                                    <p className="font-medium text-sm leading-snug">{item.title}</p>
                                                    {item.due_date && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            Due {formatDateTime(item.due_date)}
                                                        </p>
                                                    )}
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
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}

export default KanbanPage