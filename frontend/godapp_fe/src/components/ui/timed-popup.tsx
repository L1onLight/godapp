import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { usePopupManager } from '@/contexts/popup-context'

export interface TimedPopupProps {
    title?: string
    description?: string
    durationMs: number
    onTimeout?: () => void
    onDismiss?: () => void
    actions?: ReactNode
    children?: ReactNode
    className?: string
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

/**
 * Hook to easily add a timed popup to the stack from anywhere
 */
export function useTimedPopup() {
    const { addPopup, removePopup } = usePopupManager()

    const showPopup = (config: TimedPopupProps) => {
        return addPopup({
            title: config.title,
            description: config.description,
            durationMs: config.durationMs,
            actions: config.actions,
            children: config.children,
            className: config.className,
            position: config.position || 'bottom-right',
            onTimeout: config.onTimeout,
        })
    }

    return { showPopup, removePopup }
}

/**
 * Component for backward compatibility - automatically adds popup on mount
 */
export function TimedPopup(props: TimedPopupProps) {
    const { addPopup, removePopup } = usePopupManager()
    const idRef = useRef<string | null>(null)

    useEffect(() => {
        idRef.current = addPopup({
            title: props.title,
            description: props.description,
            durationMs: props.durationMs,
            actions: props.actions,
            children: props.children,
            className: props.className,
            position: props.position || 'bottom-right',
            onTimeout: props.onTimeout,
        })

        return () => {
            if (idRef.current) {
                removePopup(idRef.current)
                idRef.current = null
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return null
}
