import { ReactNode } from 'react'

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
    <div className="layout">
      <header className="layout-header">
        <div className="brand bg-white">Godapp</div>
        <nav className="layout-nav" aria-label="Modules">
          {modules.map((module) => (
            <a
              key={module.href}
              href={module.href}
              className={module.active ? 'active' : undefined}
            >
              {module.label}
            </a>
          ))}
        </nav>
        <button className="icon-button" type="button" aria-label="Settings">
          <GearIcon />
        </button>
      </header>

      <div className="layout-body">
        <aside className="layout-sidebar" aria-label="Module sections">
          {sidebar.map((section) => (
            <div key={section.title} className="sidebar-section">
              <p className="sidebar-title">{section.title}</p>
              <div className="sidebar-links">
                {section.items.map((item) => (
                  <a key={item.href} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <main className="layout-content">{children}</main>
      </div>
    </div>
  )
}

export default MainLayout
