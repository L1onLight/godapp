import { useEffect, useMemo, useState } from 'react'
import { fetchTodos, type TodoItem, type TodoColumn } from '../api/todo.api'

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

const columnLabels: Record<TodoColumn, string> = {
  'UNASSIGNED': 'Unassigned',
  'TO_DO': 'To Do',
  'IN_PROGRESS': 'In progress',
  'DONE': 'Done',
  'ARCHIVED': 'Archived',
}

function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>([])

  useEffect(() => {
    fetchTodos().then(setTodos)
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
  useEffect(() => {
    console.log(todos)
  }, [todos])

  return (
    <div className="todo-page">
      <section id="todos" className="page-section">
        <header className="section-header">
          <div>
            <p className="eyebrow">Module</p>
            <h1>Todos</h1>
            <p className="lede">Track tasks in list or Kanban view.</p>
          </div>
        </header>

        <section id="todo-list" className="page-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">View</p>
              <h2>List</h2>
            </div>
            <button className="ghost-button" type="button">Add todo</button>
          </div>
          <div className="card">
            <div className="table">
              <div className="table-head">
                <span>Title</span>
                <span>Column</span>
                <span>Due</span>
              </div>
              {todos.map((item) => (
                <div key={item.id} className="table-row">
                  <span>{item.title}</span>
                  <span className="pill" data-column={item.column}>{columnLabels[item.column]}</span>
                  <span>{item.due_date ? formatDateTime(item.due_date) : '—'}</span>
                </div>
              ))}
              {todos.length === 0 && (
                <div className="table-empty">No todos yet.</div>
              )}
            </div>
          </div>
        </section>

        <section id="todo-kanban" className="page-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">View</p>
              <h2>Kanban</h2>
            </div>
            <button className="ghost-button" type="button">Add column</button>
          </div>
          <div className="kanban">
            {Object.entries(columns).map(([column, items]) => (
              <div key={column} className="kanban-column">
                <div className="kanban-column-header">
                  <span>{columnLabels[column as TodoColumn]}</span>
                  <span className="count">{items.length}</span>
                </div>
                <div className="kanban-column-body">
                  {items.map((item) => (
                    <article key={item.id} className="kanban-card">
                      <p className="kanban-title">{item.title}</p>
                      {item.due_date && (
                        <p className="kanban-meta">Due {formatDateTime(item.due_date)}</p>
                      )}
                    </article>
                  ))}
                  {items.length === 0 && (
                    <div className="kanban-empty">No items.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  )
}

export default TodoPage
