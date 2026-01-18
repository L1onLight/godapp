import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Calendar, Archive } from 'lucide-react'
import { updateTodo, type TodoItem } from '../api/todo.api'

interface TaskWindowProps {
    task: TodoItem
    onClose: () => void
    onUpdate: (updated: TodoItem) => void
    onArchive: (item: TodoItem) => void
}

export function TaskWindow({ task, onClose, onUpdate, onArchive }: TaskWindowProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [title, setTitle] = useState(task.title)
    const [description, setDescription] = useState(task.description || '')
    const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.split('T')[0] : '')
    const [isCompleted, setIsCompleted] = useState(task.is_completed)
    const [isSaving, setIsSaving] = useState(false)

    async function handleSave() {
        setIsSaving(true)
        try {
            const updated = await updateTodo(task.id, {
                title: title.trim(),
                description: description.trim() || undefined,
                due_date: dueDate ? new Date(dueDate).toISOString() : null,
                is_completed: isCompleted,
            })
            onUpdate(updated)
            setIsEditing(false)
        } finally {
            setIsSaving(false)
        }
    }

    function handleCancel() {
        setTitle(task.title)
        setDescription(task.description || '')
        setDueDate(task.due_date ? task.due_date.split('T')[0] : '')
        setIsCompleted(task.is_completed)
        setIsEditing(false)
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <CardHeader className="border-b flex flex-row items-start justify-between space-y-0">
                    <div className="flex-1 pr-4">
                        {isEditing ? (
                            <Input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="text-xl font-bold mb-2"
                                placeholder="Task title"
                            />
                        ) : (
                            <CardTitle className="text-2xl">{task.title}</CardTitle>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                            Created {new Date(task.created_at).toLocaleDateString()}
                        </p>
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
                    {/* Status Section */}
                    <div className="space-y-2">
                        <Label className="text-base font-semibold">Status</Label>
                        {isEditing ? (
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={isCompleted}
                                    onChange={e => setIsCompleted(e.target.checked)}
                                    className="w-4 h-4 rounded"
                                />
                                <span className="text-sm">Mark as completed</span>
                            </div>
                        ) : (
                            <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary/10">
                                {isCompleted ? '✓ Completed' : 'In Progress'}
                            </div>
                        )}
                    </div>

                    {/* Description Section */}
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-base font-semibold">Description</Label>
                        {isEditing ? (
                            <textarea
                                id="description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Add a description..."
                                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {description || 'No description'}
                            </p>
                        )}
                    </div>

                    {/* Due Date Section */}
                    <div className="space-y-2">
                        <Label htmlFor="dueDate" className="text-base font-semibold flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Due Date
                        </Label>
                        {isEditing ? (
                            <Input
                                id="dueDate"
                                type="date"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date'}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                        {isEditing ? (
                            <>
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving || !title.trim()}
                                    className="flex-1"
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button
                                    onClick={handleCancel}
                                    variant="ghost"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    variant="default"
                                    className="flex-1"
                                >
                                    Edit
                                </Button>
                                <Button
                                    onClick={() => {
                                        onArchive(task)
                                        onClose()
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Archive className="h-4 w-4" />
                                    Archive
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
