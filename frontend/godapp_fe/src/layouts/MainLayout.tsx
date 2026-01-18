// src/layouts/MainLayout.tsx
import { type ReactNode, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThemeSelector } from '@/components/ThemeSelector'
import { ChevronLeft, ChevronRight, LayoutDashboard, ListTodo, Settings, LogOut } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { PopupStack } from '@/components/ui/popup-stack'
interface ModuleLink {
  label: string
  href: string
  active?: boolean
}

interface SidebarSection {
  title: string
  items: { label: string; href: string }[]
}

interface MainLayoutProps {
  modules: ModuleLink[]
  sidebar: SidebarSection[]
  children: ReactNode
}


function MainLayout({ modules, sidebar, children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const raw = localStorage.getItem('sidebar-collapsed')
    return raw ? JSON.parse(raw) : false
  })

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed))
  }, [collapsed])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Header */}
      <Card className="rounded-none border-b shadow-none z-10">
        <CardContent className="h-14 flex items-center gap-4 justify-between py-0">
          <div className="flex items-center gap-8">
            <div className="text-xl font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded">G</div>
            <nav className="hidden md:flex items-center gap-6" aria-label="Modules">
              {modules.map((module) => (
                <a
                  key={module.href}
                  href={module.href}
                  className={`text-sm transition-colors ${module.active ? 'text-foreground font-semibold underline underline-offset-4' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {module.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSelector />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => authService.logout(authService.getCurrentPath())}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-1 overflow-hidden">
        {/* Persistent Sidebar */}
        <aside
          className={`transition-all duration-300 border-r bg-muted/10 flex flex-col ${collapsed ? 'w-16' : 'w-64'}`}
          aria-label="Sidebar"
        >
          <div className="p-3 border-b flex justify-end">
            <Button variant="ghost" size="icon-sm" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-6">
            {sidebar.map((section) => (
              <div key={section.title} className="space-y-2">
                {!collapsed && (
                  <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    {section.title}
                  </p>
                )}
                <div className="flex flex-col gap-1">
                  {section.items.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      title={item.label}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {item.label.includes('Kanban') ? <LayoutDashboard size={18} /> : <ListTodo size={18} />}
                      {!collapsed && <span>{item.label}</span>}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t">
            <Button variant="ghost" className={`w-full justify-start ${collapsed ? 'px-2' : ''}`}>
              <Settings size={18} />
              {!collapsed && <span className="ml-3">Settings</span>}
            </Button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <PopupStack />
    </div>
  )
}

export default MainLayout