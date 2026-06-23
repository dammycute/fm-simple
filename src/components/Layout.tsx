import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useGameStore } from '../state/gameStore'
import { LayoutDashboard, Wallet, Users, ArrowLeftRight, UserCircle, Trophy, Newspaper, Building2, Settings, ChevronUp } from 'lucide-react'
import MatchCenter from './MatchCenter'

const navItems = [
  { label: 'Home', path: '/', icon: LayoutDashboard },
  { label: 'Finance', path: '/finance', icon: Wallet },
  { label: 'Squad', path: '/squad', icon: Users },
  { label: 'Transfers', path: '/transfers', icon: ArrowLeftRight },
  { label: 'Manager', path: '/manager', icon: UserCircle },
  { label: 'League', path: '/league', icon: Trophy },
  { label: 'News', path: '/news', icon: Newspaper },
  { label: 'Club', path: '/agm', icon: Building2 },
  { label: 'Settings', path: '/settings', icon: Settings },
]

const primaryTabs = navItems.slice(0, 5)
const secondaryTabs = navItems.slice(5)

export default function Layout() {
  const pendingEvent = useGameStore((s) => s.pendingEvent)
  const resolveEvent = useGameStore((s) => s.resolveEvent)
  const currentMatch = useGameStore((s) => s.currentMatch)
  const dismissMatch = useGameStore((s) => s.dismissMatch)
  const leagues = useGameStore((s) => s.leagues)
  const playerClubId = useGameStore((s) => s.playerClubId)
  const [showMore, setShowMore] = useState(false)

  // Resolve match clubs
  let matchHome: any, matchAway: any, matchManagerPhi: string | undefined
  if (currentMatch && playerClubId) {
    for (const l of leagues) {
      matchHome = l.clubs.find((c: any) => c.id === currentMatch.homeId)
      matchAway = l.clubs.find((c: any) => c.id === currentMatch.awayId)
      if (matchHome && matchAway) break
    }
    const playerSide = currentMatch.homeId === playerClubId ? matchHome : matchAway
    matchManagerPhi = playerSide?.manager?.philosophy
  }

  return (
    <div className="flex h-screen bg-bg-base text-text-primary">
      {/* Desktop sidebar */}
      <nav className="hidden md:flex w-48 shrink-0 bg-bg-surface border-r border-border p-4 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                isActive
                  ? 'bg-bg-surface-raised text-accent font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-raised'
              }`
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Main content area */}
      <main className="flex-1 pb-16 md:pb-0 overflow-y-auto relative">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>

        {/* Mobile bottom tab bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-surface border-t border-border z-40 safe-area-bottom">
          <div className="flex">
            {primaryTabs.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 py-1.5 text-[10px] transition-colors ${
                    isActive ? 'text-accent' : 'text-text-secondary'
                  }`
                }
              >
                <item.icon size={20} />
                <span className="mt-0.5">{item.label}</span>
              </NavLink>
            ))}
            <button
              onClick={() => setShowMore(true)}
              className="flex flex-col items-center justify-center flex-1 py-1.5 text-[10px] text-text-secondary cursor-pointer"
            >
              <ChevronUp size={20} />
              <span className="mt-0.5">More</span>
            </button>
          </div>
        </nav>

        {/* Mobile More Sheet */}
        {showMore && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setShowMore(false)}>
            <div className="bg-black/40 flex-1" />
            <div className="bg-bg-surface border-t border-border rounded-t-xl p-4 safe-area-bottom" onClick={(e) => e.stopPropagation()}>
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
              <div className="grid grid-cols-4 gap-3">
                {secondaryTabs.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMore(false)}
                    className={({ isActive }) =>
                      `flex flex-col items-center gap-1 py-2 rounded text-xs transition-colors ${
                        isActive ? 'text-accent' : 'text-text-secondary'
                      }`
                    }
                  >
                    <item.icon size={22} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Match Center Modal */}
        {currentMatch && matchHome && matchAway && (
          <MatchCenter
            fixture={currentMatch}
            homeClub={matchHome}
            awayClub={matchAway}
            onDismiss={dismissMatch}
            managerPhilosophy={matchManagerPhi}
          />
        )}

        {/* Event Modal */}
        {pendingEvent && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-bg-surface-raised border border-border rounded-lg p-4 md:p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg md:text-xl font-bold text-text-primary mb-2">{pendingEvent.title}</h2>
              <p className="text-text-secondary text-sm md:text-base mb-4">{pendingEvent.description}</p>
              <div className="space-y-3">
                {pendingEvent.choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => resolveEvent(i)}
                    className="w-full text-left px-4 py-3 md:py-3.5 bg-bg-surface border border-border rounded hover:bg-border transition-colors cursor-pointer text-sm md:text-base min-h-[44px]"
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
