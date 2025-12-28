import { useEffect, useMemo, useState } from 'react'
import { fetchTodos, type TodoItem, type TodoStatus } from '../api/todo.api'

const statusLabels: Record<TodoStatus, string> = {
  'todo': 'Backlog',
  'in-progress': 'In progress',
  'done': 'Done',
}

function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>([])

  useEffect(() => {
    fetchTodos().then(setTodos)
  }, [])

  const columns = useMemo(
    () => ({
      'todo': todos.filter((item) => item.status === 'todo'),
      'in-progress': todos.filter((item) => item.status === 'in-progress'),
      'done': todos.filter((item) => item.status === 'done'),
    }),
    [todos],
  )

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
                <span>Status</span>
                <span>Assignee</span>
                <span>Due</span>
              </div>
              {todos.map((item) => (
                <div key={item.id} className="table-row">
                  <span>{item.title}</span>
                  <span className="pill" data-status={item.status}>{statusLabels[item.status]}</span>
                  <span>{item.assignee ?? '—'}</span>
                  <span>{item.dueDate ?? '—'}</span>
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
            {Object.entries(columns).map(([status, items]) => (
              <div key={status} className="kanban-column">
                <div className="kanban-column-header">
                  <span>{statusLabels[status as TodoStatus]}</span>
                  <span className="count">{items.length}</span>
                </div>
                <div className="kanban-column-body">
                  {items.map((item) => (
                    <article key={item.id} className="kanban-card">
                      <p className="kanban-title">{item.title}</p>
                      <p className="kanban-meta">
                        {item.assignee ? `Owner: ${item.assignee}` : 'Unassigned'}
                      </p>
                      {item.dueDate && <p className="kanban-meta">Due {item.dueDate}</p>}
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
