import { NavLink, Outlet } from 'react-router-dom'
import { useGameStore } from '../state/gameStore'

const navItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Finance', path: '/finance' },
  { label: 'Squad', path: '/squad' },
  { label: 'Transfers', path: '/transfers' },
  { label: 'Manager', path: '/manager' },
  { label: 'League', path: '/league' },
  { label: 'News', path: '/news' },
  { label: 'AGM', path: '/agm' },
  { label: 'Settings', path: '/settings' },
]

export default function Layout() {
  const pendingEvent = useGameStore((s) => s.pendingEvent)
  const resolveEvent = useGameStore((s) => s.resolveEvent)

  return (
    <div className="flex h-screen bg-bg-base text-text-primary">
      <nav className="w-48 shrink-0 bg-bg-surface border-r border-border p-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `px-3 py-2 rounded text-sm transition-colors ${
                isActive
                  ? 'bg-bg-surface-raised text-accent font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-raised'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="flex-1 p-6 overflow-y-auto relative">
        <Outlet />

        {pendingEvent && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-bg-surface-raised border border-border rounded-lg p-6 max-w-lg w-full mx-4 shadow-2xl">
              <h2 className="text-xl font-bold text-text-primary mb-2">{pendingEvent.title}</h2>
              <p className="text-text-secondary mb-6">{pendingEvent.description}</p>
              <div className="space-y-3">
                {pendingEvent.choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => resolveEvent(i)}
                    className="w-full text-left px-4 py-3 bg-bg-surface border border-border rounded hover:bg-border transition-colors cursor-pointer"
                  >
                    <span className="text-accent font-medium">{choice.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
