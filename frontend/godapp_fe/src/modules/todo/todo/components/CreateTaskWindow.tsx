import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Calendar, Plus } from 'lucide-react'
import { createTodo, type TodoItem, type TodoColumn } from '../api/todo.api'

interface CreateTaskWindowProps {
    onClose: () => void
    onCreate: (created: TodoItem) => void
    initialColumn?: TodoColumn
}

export function CreateTaskWindow({ onClose, onCreate, initialColumn = 'UNASSIGNED' }: CreateTaskWindowProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [column, setColumn] = useState<TodoColumn>(initialColumn)
    const [isSaving, setIsSaving] = useState(false)

    async function handleCreate() {
        if (!title.trim()) return
        setIsSaving(true)
        try {
            const created = await createTodo({
                title: title.trim(),
                description: description.trim() || undefined,
                column,
                due_date: dueDate ? new Date(dueDate).toISOString() : null,
            })
            onCreate(created)
            onClose()
        } finally {
            setIsSaving(false)
        }
    }

    function handleCancel() {
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <CardHeader className="border-b flex flex-row items-start justify-between space-y-0">
                    <div className="flex-1 pr-4">
                        <Input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="text-xl font-bold mb-2"
                            placeholder="New task title"
                        />
                        <p className="text-sm text-muted-foreground mt-1">Create a new task</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 p-0 flex-shrink-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                    {/* Column */}
                    <div className="space-y-2">
                        <Label htmlFor="column" className="text-base font-semibold">Column</Label>
                        <select
                            id="column"
                            className="h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
                            value={column}
                            onChange={e => setColumn(e.target.value as TodoColumn)}
                        >
                            <option value="UNASSIGNED">Unassigned</option>
                            <option value="TO_DO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-base font-semibold">Description</Label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Add a description..."
                            className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>

                    {/* Due Date */}
                    <div className="space-y-2">
                        <Label htmlFor="dueDate" className="text-base font-semibold flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Due Date
                        </Label>
                        <Input
                            id="dueDate"
                            type="datetime-local"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                        <Button
                            onClick={handleCreate}
                            disabled={isSaving || !title.trim()}
                            className="flex-1"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            {isSaving ? 'Creating...' : 'Create Task'}
                        </Button>
                        <Button
                            onClick={handleCancel}
                            variant="ghost"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
