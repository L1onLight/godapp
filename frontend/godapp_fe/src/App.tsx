import './App.css'
import { Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'

function initTheme() {
  const saved = (localStorage.getItem('theme-mode') as 'light' | 'dark' | 'system' | null) ?? 'system'
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = saved === 'dark' || (saved === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', isDark)
}

function App() {
  useEffect(() => {
    initTheme()
  }, [])
  return <Outlet />
}

export default App
