import { useState } from 'react'
import { useGameStore, getPlayerClub } from '../state/gameStore'

export default function ManagerOffice() {
  const playerClubId = useGameStore((s) => s.playerClubId)
  const leagues = useGameStore((s) => s.leagues)
  const sackManager = useGameStore((s) => s.sackManager)
  const hireManager = useGameStore((s) => s.hireManager)
  const managerCandidates = useGameStore((s) => s.managerCandidates)

  const [showConfirmSack, setShowConfirmSack] = useState(false)

  if (!playerClubId) return <h1 className="text-2xl font-bold text-text-primary">No game in progress</h1>

  const club = getPlayerClub({ leagues, playerClubId } as any)

  if (!club) return <p className="text-negative">Club not found</p>

  const manager = club.manager

  const handleSack = () => {
    sackManager()
    setShowConfirmSack(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-4">Manager Office</h1>

      {manager ? (
        <div className="bg-bg-surface border border-border rounded p-3 md:p-4 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-3">Current Manager</h2>
          <div className="flex flex-col md:flex-row md:justify-between gap-1">
            <div>
              <p className="text-xl font-bold text-text-primary">{manager.name}</p>
              <p className="text-text-secondary text-sm">Philosophy: {manager.philosophy}</p>
            </div>
            <div className="md:text-right">
              <p className="text-text-secondary text-sm">Wage: ${manager.wageDemand.toLocaleString()}/w</p>
              <p className="text-text-secondary text-sm">Contract: {manager.contractYears} years</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-4">
            <div>
              <p className="text-text-secondary text-sm">Tactical</p>
              <div className="w-full bg-border rounded h-2 mt-1">
                <div className="bg-accent h-2 rounded" style={{ width: `${manager.tacticalSkill}%` }} />
              </div>
              <p className="text-xs text-text-secondary mt-1">{manager.tacticalSkill}/100</p>
            </div>
            <div>
              <p className="text-text-secondary text-sm">Transfer</p>
              <div className="w-full bg-border rounded h-2 mt-1">
                <div className="bg-accent h-2 rounded" style={{ width: `${manager.transferSkill}%` }} />
              </div>
              <p className="text-xs text-text-secondary mt-1">{manager.transferSkill}/100</p>
            </div>
            <div>
              <p className="text-text-secondary text-sm">Man Management</p>
              <div className="w-full bg-border rounded h-2 mt-1">
                <div className="bg-accent h-2 rounded" style={{ width: `${manager.manManagement}%` }} />
              </div>
              <p className="text-xs text-text-secondary mt-1">{manager.manManagement}/100</p>
            </div>
          </div>

          {!showConfirmSack ? (
            <button
              onClick={() => setShowConfirmSack(true)}
              className="mt-4 px-4 py-2 bg-negative text-white text-sm rounded hover:opacity-90 cursor-pointer"
            >
              Sack Manager
            </button>
          ) : (
            <div className="mt-4 flex flex-col md:flex-row gap-2 md:gap-3 md:items-center">
              <p className="text-sm text-warning">
                Compensation: ${(manager.wageDemand * manager.contractYears * 52).toLocaleString()}
              </p>
              <div className="flex gap-2">
                <button onClick={handleSack} className="px-4 py-2 bg-negative text-white text-sm rounded cursor-pointer">
                  Confirm Sack
                </button>
                <button onClick={() => setShowConfirmSack(false)} className="px-4 py-2 bg-bg-surface-raised text-text-primary text-sm border border-border rounded cursor-pointer">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-bg-surface border border-border rounded p-4 mb-6">
          <p className="text-warning">No manager hired. You need a manager to run the team.</p>
        </div>
      )}

      {managerCandidates.length > 0 && (
        <div className="bg-bg-surface border border-border rounded p-3 md:p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-3">Candidate Managers</h2>
          <div className="space-y-3">
            {managerCandidates.map((m) => (
              <div key={m.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-border rounded p-3">
                <div>
                  <p className="font-medium text-text-primary">{m.name}</p>
                  <p className="text-xs text-text-secondary">
                    Tactical: {m.tacticalSkill} | Transfer: {m.transferSkill} | Man Mgmt: {m.manManagement}
                    &nbsp;| Wage: ${m.wageDemand.toLocaleString()}/w
                  </p>
                </div>
                <button
                  onClick={() => hireManager(m.id)}
                  className="px-3 py-1.5 bg-accent text-black text-sm font-semibold rounded cursor-pointer"
                >
                  Hire
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!manager && managerCandidates.length === 0 && (
        <div className="bg-bg-surface border border-border rounded p-4">
          <p className="text-text-secondary">No manager candidates available.</p>
          <button
            onClick={() => sackManager()}
            className="mt-2 px-4 py-2 bg-accent text-black text-sm font-semibold rounded cursor-pointer"
          >
            Find New Candidates
          </button>
        </div>
      )}
    </div>
  )
}
