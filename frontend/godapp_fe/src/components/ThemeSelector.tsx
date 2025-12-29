import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export type ThemeMode = "light" | "dark" | "system"

function applyTheme(mode: ThemeMode) {
    const root = document.documentElement
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    const isDark = mode === "dark" || (mode === "system" && prefersDark)
    root.classList.toggle("dark", isDark)
}

export function ThemeSelector() {
    const [mode, setMode] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem("theme-mode") as ThemeMode | null
        return saved ?? "system"
    })

    useEffect(() => {
        applyTheme(mode)
        localStorage.setItem("theme-mode", mode)
    }, [mode])

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Theme</span>
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    size="sm"
                    variant={mode === "light" ? "default" : "outline"}
                    aria-pressed={mode === "light"}
                    onClick={() => setMode("light")}
                >
                    Light
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={mode === "dark" ? "default" : "outline"}
                    aria-pressed={mode === "dark"}
                    onClick={() => setMode("dark")}
                >
                    Dark
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={mode === "system" ? "default" : "outline"}
                    aria-pressed={mode === "system"}
                    onClick={() => setMode("system")}
                >
                    System
                </Button>
            </div>
        </div>
    )
}

export default ThemeSelector
