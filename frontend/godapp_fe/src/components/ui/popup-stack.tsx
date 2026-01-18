import { useEffect, useState } from 'react'
import { usePopupManager, type PopupConfig } from '@/contexts/popup-context'
import { cn } from '@/lib/utils'

function getStackClasses(position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left') {
    switch (position) {
        case 'bottom-right':
            return 'fixed bottom-6 right-6 flex flex-col items-end gap-3 pointer-events-none'
        case 'bottom-left':
            return 'fixed bottom-6 left-6 flex flex-col items-start gap-3 pointer-events-none'
        case 'top-right':
            return 'fixed top-6 right-6 flex flex-col items-end gap-3 pointer-events-none'
        case 'top-left':
            return 'fixed top-6 left-6 flex flex-col items-start gap-3 pointer-events-none'
    }
}

function PopupItem({ popup }: { popup: PopupConfig }) {
    const { removePopup } = usePopupManager()
    const [remainingMs, setRemainingMs] = useState(popup.durationMs)

    useEffect(() => {
        const start = Date.now()
        setRemainingMs(popup.durationMs)
        const id = setInterval(() => {
            const now = Date.now()
            const elapsed = now - start
            const remain = Math.max(popup.durationMs - elapsed, 0)
            setRemainingMs(remain)
            if (remain <= 0) {
                clearInterval(id)
                popup.onTimeout?.()
                removePopup(popup.id)
            }
        }, 100)
        return () => clearInterval(id)
    }, [popup.id, popup.durationMs, popup.onTimeout, removePopup])

    const ratio = Math.max(0, Math.min(1, remainingMs / popup.durationMs))
    const hue = Math.round(120 * ratio)
    const fillStyle = {
        width: `${Math.round(ratio * 100)}%`,
        backgroundColor: `hsl(${hue} 80% 45%)`,
        transition: 'width 100ms linear',
    } as const

    return (
        <div
            className={cn(
                'z-9999 bg-background border border-muted-foreground/20 rounded-lg shadow-lg p-4 max-w-sm pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-300',
                popup.className,
            )}
        >
            <div className="space-y-3">
                {(popup.title || popup.description) && (
                    <div>
                        {popup.title && <p className="font-medium text-sm">{popup.title}</p>}
                        {popup.description && (
                            <p className="text-xs text-muted-foreground mt-1">{popup.description}</p>
                        )}
                    </div>
                )}

                {popup.children}

                {popup.actions && (
                    <div className="flex gap-2">
                        {popup.actions}
                    </div>
                )}
            </div>

            <div className="mt-3">
                <div className="relative h-1.5 rounded overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-40" />
                    <div className="absolute inset-y-0 left-0" style={fillStyle} />
                </div>
            </div>
        </div>
    )
}

const positions = ['bottom-right', 'bottom-left', 'top-right', 'top-left'] as const

export function PopupStack() {
    const { popups } = usePopupManager()

    return (
        <>
            {positions.map((position) => (
                <div key={position} className={getStackClasses(position)}>
                    {popups
                        .filter((p) => (p.position || 'bottom-right') === position)
                        .map((popup) => (
                            <PopupItem key={popup.id} popup={popup} />
                        ))}
                </div>
            ))}
        </>
    )
}
