import { RootRoute, Route, Router } from '@tanstack/react-router'
import App from './App'
import AuthPage from './pages/AuthPage'
import TodoPage from './modules/todo/todo/pages/TodoPage'
import MainLayout from './layouts/MainLayout'

class TodoUrls {
    static todoList = '/todo'
    static todoKanban = '/todo/kanban'
}

// Root route
const rootRoute = new RootRoute({
    component: () => <App />,
})

// Auth route
const authRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: AuthPage,
})

// Todo routes
const todoRoute = new Route({
    getParentRoute: () => rootRoute,
    path: TodoUrls.todoList,
    component: () => {
        const modules = [{ label: 'Todos', href: TodoUrls.todoList, active: true }]
        const sidebar = [
            {
                title: 'Todos',
                items: [
                    { label: 'List of todos', href: TodoUrls.todoList },
                    { label: 'Kanban', href: TodoUrls.todoKanban },
                ],
            },
        ]
        return (
            <MainLayout modules={modules} sidebar={sidebar}>
                <TodoPage />
            </MainLayout>
        )
    },
})

const todoKanbanRoute = new Route({
    getParentRoute: () => rootRoute,
    path: TodoUrls.todoKanban,
    component: () => {
        const modules = [{ label: 'Todos', href: TodoUrls.todoKanban, active: true }]
        const sidebar = [
            {
                title: 'Todos',
                items: [
                    { label: 'List of todos', href: TodoUrls.todoList },
                    { label: 'Kanban', href: TodoUrls.todoKanban },
                ],
            },
        ]
        return (
            <MainLayout modules={modules} sidebar={sidebar}>
                <div className="p-6">
                    <h1 className="text-2xl font-bold">Kanban View</h1>
                    <p className="text-gray-600 mt-2">Kanban board coming soon...</p>
                </div>
            </MainLayout>
        )
    },
})

// Index route (home)
const indexRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => {
        const modules = [{ label: 'Todos', href: TodoUrls.todoList, active: true }]
        const sidebar = [
            {
                title: 'Todos',
                items: [
                    { label: 'List of todos', href: TodoUrls.todoList },
                    { label: 'Kanban', href: TodoUrls.todoKanban },
                ],
            },
        ]
        return (
            <MainLayout modules={modules} sidebar={sidebar}>
                <TodoPage />
            </MainLayout>
        )
    },
})

// Create the route tree
const routeTree = rootRoute.addChildren([authRoute, todoRoute, todoKanbanRoute, indexRoute])

// Create the router instance
export const router = new Router({ routeTree })

// Register router for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}
