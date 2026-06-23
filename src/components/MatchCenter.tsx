import { useState, useEffect } from 'react'
import type { Fixture, Club } from '../engine/types'

interface MatchCenterProps {
  fixture: Fixture
  homeClub: Club
  awayClub: Club
  onDismiss: () => void
  managerPhilosophy?: string
}

export default function MatchCenter({ fixture, homeClub, awayClub, onDismiss, managerPhilosophy }: MatchCenterProps) {
  const events = fixture.result?.events ?? []
  const [visibleIndex, setVisibleIndex] = useState(-1)

  useEffect(() => {
    if (events.length === 0) {
      setVisibleIndex(0)
      return
    }
    const timer = setTimeout(() => {
      setVisibleIndex((i) => Math.min(i + 1, events.length))
    }, 600)
    return () => clearTimeout(timer)
  }, [visibleIndex, events.length])

  const isHome = (clubId: string) => clubId === homeClub.id
  const scoreAt = (idx: number) => {
    let h = 0, a = 0
    for (let i = 0; i <= idx; i++) {
      const e = events[i]
      if (!e || e.type !== 'goal') continue
      if (e.clubId === homeClub.id) h++
      else a++
    }
    return { h, a }
  }

  const finalScore = scoreAt(events.length - 1)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-surface-raised border border-border rounded-lg w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-bg-surface p-4 border-b border-border">
          <div className="flex justify-between items-center text-center">
            <div className="flex-1">
              <p className="text-sm text-text-secondary">{homeClub.shortName}</p>
              <p className="text-xs text-text-secondary">(H)</p>
            </div>
            <div className="px-4">
              <span className="text-2xl font-bold text-text-primary">{finalScore.h}</span>
              <span className="text-text-secondary mx-2">-</span>
              <span className="text-2xl font-bold text-text-primary">{finalScore.a}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-text-secondary">{awayClub.shortName}</p>
              <p className="text-xs text-text-secondary">(A)</p>
            </div>
          </div>
          {managerPhilosophy && (
            <p className="text-center text-xs text-text-secondary mt-1">
              Manager philosophy: {managerPhilosophy}
            </p>
          )}
        </div>

        {/* Live feed */}
        <div className="p-4 max-h-80 overflow-y-auto space-y-2">
          {events.length === 0 && (
            <p className="text-text-secondary text-sm text-center py-4">0-0 — a quiet match</p>
          )}
          {events.slice(0, visibleIndex + 1).map((evt, i) => {
            const score = scoreAt(i)
            const isPlayerSide = isHome(evt.clubId)
            return (
              <div
                key={i}
                className={`flex items-start gap-2 text-sm p-2 rounded ${
                  evt.type === 'goal'
                    ? isPlayerSide
                      ? 'bg-positive/10 border-l-2 border-positive'
                      : 'bg-negative/10 border-l-2 border-negative'
                    : 'bg-bg-surface border-l-2 border-border'
                }`}
              >
                <span className="text-text-secondary font-mono w-8 shrink-0">
                  {evt.minute}&apos;
                </span>
                <span className={`flex-1 ${evt.type === 'goal' ? 'font-semibold' : ''}`}>
                  {evt.description}
                </span>
                <span className="text-xs text-text-secondary shrink-0">
                  {score.h}-{score.a}
                </span>
              </div>
            )
          })}
        </div>

        {/* Dismiss */}
        {visibleIndex >= events.length && (
          <div className="p-4 border-t border-border">
            <button
              onClick={onDismiss}
              className="w-full py-2 bg-accent text-black font-semibold rounded hover:opacity-90 cursor-pointer"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
