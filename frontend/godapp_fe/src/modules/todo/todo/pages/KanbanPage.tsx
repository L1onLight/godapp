// src/modules/todo/todo/pages/KanbanPage.tsx
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// Removed unused Input/Label imports after refactor
import { Plus, Calendar, Archive, GripVertical } from 'lucide-react'
import { fetchTodos, updateTodo, reorderTodos, type TodoColumn, type TodoItem } from '../api/todo.api'
import { TaskWindow } from './TaskWindow'
import { CreateTaskWindow } from '../components/CreateTaskWindow'
import { useTimedPopup } from '@/components/ui/timed-popup'

// DND Kit Imports
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    pointerWithin,
    useDroppable,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

/**
 * Sortable Item Component
 */
function SortableTodoCard({ item, onClick, onColumnChange }: {
    item: TodoItem;
    onClick: () => void;
    onColumnChange: (id: number, col: TodoColumn) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className="hover:shadow-md transition-shadow group relative"
        >
            <CardContent className="p-4 space-y-3">
                <Archive className="h-5 w-5 absolute top-2 right-2 text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => onColumnChange(item.id, 'ARCHIVED')} />

                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                            <GripVertical className="h-4 w-4" />
                        </div>
                        <p className="font-medium text-sm leading-snug cursor-pointer flex-1" onClick={onClick}>
                            {item.title}
                        </p>
                    </div>
                </div>


                <div className="flex items-center justify-between gap-2">

                    <select
                        className="h-7 rounded-md border bg-transparent px-1 py-0 text-[10px] hidden"
                        value={item.column}
                        onChange={(e) => onColumnChange(item.id, e.target.value as TodoColumn)}
                    >

                        {['UNASSIGNED', 'TO_DO', 'IN_PROGRESS', 'DONE', 'ARCHIVED'].map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    {item.due_date && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.due_date).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

const columnConfig: Record<Exclude<TodoColumn, 'ARCHIVED'>, { label: string }> = {
    'UNASSIGNED': { label: 'Unassigned' },
    'TO_DO': { label: 'To Do' },
    'IN_PROGRESS': { label: 'In Progress' },
    'DONE': { label: 'Done' },
}

function ColumnDroppable({ columnId, children }: { columnId: TodoColumn; children: ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id: columnId })

    return (
        <div
            ref={setNodeRef}
            className={`bg-muted/30 p-2 rounded-lg min-h-[500px] border border-dashed transition ring-primary/40 ${isOver ? 'ring-2 border-primary/50' : 'ring-0'}`}
        >
            {children}
        </div>
    )
}

function KanbanPage() {
    const [todos, setTodos] = useState<TodoItem[]>([])
    const [showAdd, setShowAdd] = useState(false)
    const [selected, setSelected] = useState<TodoItem | null>(null)
    const [activeId, setActiveId] = useState<number | null>(null)
    const { showPopup, removePopup } = useTimedPopup()

    // Creation modal state handled via CreateTaskWindow

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    useEffect(() => {
        fetchTodos().then(setTodos)
    }, [])

    const boardColumns = ['UNASSIGNED', 'TO_DO', 'IN_PROGRESS', 'DONE'] as const;

    const isBoardColumn = (id: string): id is (typeof boardColumns)[number] =>
        boardColumns.includes(id as (typeof boardColumns)[number])

    const categorized = useMemo(() => ({
        board: boardColumns.reduce((acc, col) => {
            acc[col] = todos.filter(t => t.column === col).sort((a, b) => a.column_order - b.column_order)
            return acc
        }, {} as Record<string, TodoItem[]>),
        archived: todos.filter(t => t.column === 'ARCHIVED').sort((a, b) => b.id - a.id)
    }), [todos])

    function handleDragStart(event: DragStartEvent) {
        const { active } = event
        setActiveId(typeof active.id === 'number' ? active.id : null)
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        setActiveId(null)
        if (!over) return

        const activeItem = todos.find(t => t.id === active.id)
        if (!activeItem) return

        const overItem = todos.find(t => t.id === over.id)
        const overColumn = (typeof over.id === 'string' && isBoardColumn(over.id))
            ? over.id
            : overItem?.column

        if (!overColumn || !isBoardColumn(overColumn)) return

        const columns = boardColumns.reduce((acc, col) => {
            acc[col] = todos.filter(t => t.column === col && t.id !== activeItem.id)
            return acc
        }, {} as Record<(typeof boardColumns)[number], TodoItem[]>)

        const targetList = columns[overColumn]
        const insertIndex = overItem
            ? Math.max(targetList.findIndex(t => t.id === overItem.id), 0)
            : targetList.length

        targetList.splice(insertIndex, 0, { ...activeItem, column: overColumn })

        const updatedBoard = boardColumns.flatMap(col =>
            columns[col].map((item, idx) => ({ ...item, column_order: idx }))
        )

        setTodos([
            ...updatedBoard,
            ...todos.filter(t => t.column === 'ARCHIVED')
        ])

        await reorderTodos(updatedBoard.map(item => ({
            id: item.id,
            column: item.column,
            column_order: item.column_order
        })))
    }

    function handleDragCancel() {
        setActiveId(null)
    }

    async function moveToColumn(id: number, target: TodoColumn) {
        const updated = await updateTodo(id, { column: target })
        setTodos(prev => prev.map(t => t.id === id ? updated : t))
    }

    async function handleArchive(item: TodoItem) {
        const undoData = { item, column: item.column, order: item.column_order }

        await updateTodo(item.id, { column: 'ARCHIVED' })
        setTodos(prev => prev.map(t => t.id === item.id ? { ...t, column: 'ARCHIVED' } : t))

        showUndoPopup(undoData)
    }

    type UndoData = { item: TodoItem; column: TodoColumn; order: number }

    async function restoreFromPopup(undoData: UndoData, popupId: string) {
        await updateTodo(undoData.item.id, {
            column: undoData.column,
            column_order: undoData.order
        })
        setTodos(prev => prev.map(t =>
            t.id === undoData.item.id ? { ...t, column: undoData.column, column_order: undoData.order } : t
        ))
        removePopup(popupId)
    }

    function showUndoPopup(undoData: UndoData) {
        let popupId = ''
        popupId = showPopup({
            position: 'top-right',
            durationMs: 6000,
            title: undoData.item.title,
            description: `Archived · ${columnConfig[undoData.column as Exclude<TodoColumn, 'ARCHIVED'>]?.label || undoData.column}`,
            actions: (
                <>
                    <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                            void restoreFromPopup(undoData, popupId)
                        }}
                        className="flex-1"
                    >
                        Undo
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removePopup(popupId)}
                        className="px-2"
                    >
                        Dismiss
                    </Button>
                </>
            )
        })
    }

    // Creation handled by CreateTaskWindow

    return (
        <div className="container mx-auto p-6 space-y-10">
            <header className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Kanban Board</h1>
                    <p className="text-muted-foreground">Drag and drop tasks to manage your workflow.</p>
                </div>
                <Button onClick={() => setShowAdd(!showAdd)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
            </header>

            {showAdd && (
                <CreateTaskWindow
                    initialColumn={'UNASSIGNED'}
                    onClose={() => setShowAdd(false)}
                    onCreate={(created) => {
                        setTodos(prev => [created, ...prev])
                    }}
                />
            )}

            <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {boardColumns.map(colId => (
                        <div key={colId} className="flex flex-col gap-4">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                                    {columnConfig[colId].label}
                                </h2>
                                <Badge variant="secondary">{categorized.board[colId].length}</Badge>
                            </div>

                            <ColumnDroppable columnId={colId}>
                                <SortableContext items={categorized.board[colId].map(t => t.id)} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-3">
                                        {categorized.board[colId].map(item => (
                                            <SortableTodoCard
                                                key={item.id}
                                                item={item}
                                                onClick={() => setSelected(item)}
                                                onColumnChange={(id, col) => {
                                                    if (col === 'ARCHIVED') {
                                                        const archiveItem = todos.find(t => t.id === id)
                                                        if (archiveItem) handleArchive(archiveItem)
                                                    } else {
                                                        moveToColumn(id, col)
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </ColumnDroppable>
                        </div>
                    ))}
                </div>

                <DragOverlay dropAnimation={null}>
                    {activeId ? (
                        (() => {
                            const item = todos.find(t => t.id === activeId)
                            if (!item) return null
                            return (
                                <Card className="w-[260px] shadow-lg">
                                    <CardContent className="p-4 space-y-2">
                                        <p className="font-medium text-sm leading-snug">{item.title}</p>
                                        {item.due_date && (
                                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(item.due_date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })()
                    ) : null}
                </DragOverlay>
            </DndContext>
            {/* Task Detail Modal */}
            {selected && (
                <TaskWindow
                    task={selected}
                    onClose={() => setSelected(null)}
                    onUpdate={(updated) => {
                        setTodos(prev => prev.map(t => t.id === updated.id ? updated : t))
                        setSelected(updated)
                    }}
                    onArchive={(item) => {
                        handleArchive(item)
                        setSelected(null)
                    }}
                />
            )}

            {/* Separated Archive Section */}
            <section className="pt-10 border-t">
                <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                    <Archive className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">Archived Tasks</h2>
                    <Badge variant="outline">{categorized.archived.length}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-75 grayscale hover:grayscale-0 transition-all">
                    {categorized.archived.map(item => (
                        <Card key={item.id} className="bg-muted/20">
                            <CardContent className="p-4 flex flex-col gap-2">
                                <span className="text-sm font-medium line-through decoration-muted-foreground">{item.title}</span>
                                <Button variant="link" size="sm" className="h-auto p-0 w-fit text-xs" onClick={() => moveToColumn(item.id, 'UNASSIGNED')}>
                                    Restore to board
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                    {categorized.archived.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No archived items.</p>
                    )}
                </div>
            </section>
        </div>
    )
}

export default KanbanPage