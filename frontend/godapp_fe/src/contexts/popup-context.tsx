import { createContext, useContext, useCallback, useState, type ReactNode } from 'react'

export interface PopupConfig {
    id: string
    title?: string
    description?: string
    durationMs: number
    onTimeout?: () => void
    actions?: ReactNode
    children?: ReactNode
    className?: string
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

interface PopupContextType {
    popups: PopupConfig[]
    addPopup: (config: Omit<PopupConfig, 'id'>) => string
    removePopup: (id: string) => void
}

const PopupContext = createContext<PopupContextType | undefined>(undefined)

export function PopupProvider({ children }: { children: ReactNode }) {
    const [popups, setPopups] = useState<PopupConfig[]>([])

    const addPopup = useCallback((config: Omit<PopupConfig, 'id'>) => {
        const id = `popup-${Date.now()}-${Math.random()}`
        setPopups((prev) => [...prev, { ...config, id }])
        return id
    }, [])

    const removePopup = useCallback((id: string) => {
        setPopups((prev) => prev.filter((p) => p.id !== id))
    }, [])

    return (
        <PopupContext.Provider value={{ popups, addPopup, removePopup }}>
            {children}
        </PopupContext.Provider>
    )
}

export function usePopupManager() {
    const context = useContext(PopupContext)
    if (!context) {
        throw new Error('usePopupManager must be used within PopupProvider')
    }
    return context
}
