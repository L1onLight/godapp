import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThemeSelector } from '@/components/ThemeSelector'

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

function GearIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3.25" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.6 15a1.65 1.65 0 0 0-1.51-1H2a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 3.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  )
}

function MainLayout({ modules, sidebar, children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Card className="rounded-none border-b">
        <CardContent className="flex items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="text-xl font-semibold">Godapp</div>
            <nav className="flex items-center gap-3" aria-label="Modules">
              {modules.map((module) => (
                <a
                  key={module.href}
                  href={module.href}
                  className={module.active ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}
                >
                  {module.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSelector />
            <Button type="button" size="icon" variant="outline" aria-label="Settings">
              <GearIcon />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-1">
        <aside className="w-64 border-r p-4 space-y-6" aria-label="Module sections">
          {sidebar.map((section) => (
            <div key={section.title} className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{section.title}</p>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <a key={item.href} href={item.href} className="text-sm hover:text-primary">
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

export default MainLayout
