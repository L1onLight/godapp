import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { PopupProvider } from '@/contexts/popup-context'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PopupProvider>
      <RouterProvider router={router} />
    </PopupProvider>
  </StrictMode>,
)
