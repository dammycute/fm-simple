import { useGameStore } from '../state/gameStore'

export default function NewsPage() {
  const events = useGameStore((s) => s.events)
  const eventLog = useGameStore((s) => s.eventLog)

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-4">News & Events</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-bg-surface border border-border rounded p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-3">Event Log</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {eventLog.length === 0 && (
              <p className="text-text-secondary text-sm">No events yet.</p>
            )}
            {[...eventLog].reverse().map((msg, i) => (
              <div key={i} className="text-sm text-text-primary border-b border-border/50 pb-2">
                {msg}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-bg-surface border border-border rounded p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-3">Decision History</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.length === 0 && (
              <p className="text-text-secondary text-sm">No decision events yet.</p>
            )}
            {[...events].reverse().map((evt, i) => (
              <div key={i} className="text-sm border-b border-border/50 pb-2">
                <p className="text-accent font-medium">{(evt as any).title ?? evt.type}</p>
                <p className="text-text-secondary">Week {evt.week} · {evt.type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
