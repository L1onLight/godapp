import './App.css'
import MainLayout from './layouts/MainLayout'
import TodoPage from './modules/todo/todo/pages/TodoPage'

function App() {
  const modules = [{ label: 'Todos', href: '#todos', active: true }]
  const sidebar = [
    {
      title: 'Todos',
      items: [
        { label: 'List of todos', href: '#todo-list' },
        { label: 'Kanban', href: '#todo-kanban' },
      ],
    },
  ]

  return (
    <MainLayout modules={modules} sidebar={sidebar}>
      <TodoPage />
    </MainLayout>
  )
}

export default App
