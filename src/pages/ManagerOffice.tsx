import { useState } from 'react'
import { useGameStore, getPlayerClub } from '../state/gameStore'

function ambitionLabel(v: number): string {
  if (v >= 80) return 'Very ambitious — wants trophies'
  if (v >= 60) return 'Ambitious — wants promotion'
  if (v >= 40) return 'Content with stability'
  return 'Happy to survive'
}

function patienceLabel(v: number): string {
  if (v >= 80) return 'Very patient — will weather bad runs'
  if (v >= 60) return 'Patient — gives time'
  if (v >= 40) return 'Moderate patience'
  return 'Short fuse — poor results risk resignation'
}

function philosophyDetail(p: string): string {
  switch (p) {
    case 'attacking': return 'Prefers attacking football — scores more, concedes more'
    case 'defensive': return 'Prefers defensive setup — tight at the back, lower scoring'
    default: return 'Balanced approach — adapts to the situation'
  }
}

export default function ManagerOffice() {
  const playerClubId = useGameStore((s) => s.playerClubId)
  const leagues = useGameStore((s) => s.leagues)
  const sackManager = useGameStore((s) => s.sackManager)
  const hireManager = useGameStore((s) => s.hireManager)
  const managerCandidates = useGameStore((s) => s.managerCandidates)
  const setTransferBudget = useGameStore((s) => s.setTransferBudget)

  const [showConfirmSack, setShowConfirmSack] = useState(false)
  const [budgetInput, setBudgetInput] = useState(0)

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

      {/* Club History */}
      <div className="bg-bg-surface border border-border rounded p-3 md:p-4 mb-6">
        <h2 className="text-lg font-semibold text-text-primary mb-2">Your Tenure</h2>
        <p className="text-sm text-text-secondary">
          Seasons managed: <span className="text-text-primary font-medium">{club.history.seasonsManaged}</span>
          {' · '}Best finish: <span className="text-text-primary font-medium">{club.history.bestFinish === 999 ? 'N/A' : `${club.history.bestFinish}${getOrdinalSuffix(club.history.bestFinish)}`}</span>
          {' · '}Best tier: <span className="text-text-primary font-medium">Tier {club.history.bestTier}</span>
        </p>
        <p className="text-sm text-text-secondary">
          Promotions: <span className="text-positive">{club.history.promotions}</span>
          {' · '}Relegations: <span className="text-negative">{club.history.relegations}</span>
          {club.history.trophies.length > 0 && ` · Trophies: ${club.history.trophies.join(', ')}`}
        </p>
      </div>

      {manager ? (
        <div className="bg-bg-surface border border-border rounded p-3 md:p-4 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-3">Current Manager</h2>
          <div className="flex flex-col md:flex-row md:justify-between gap-1">
            <div>
              <p className="text-xl font-bold text-text-primary">{manager.name}</p>
              <p className="text-text-secondary text-sm">Philosophy: {manager.philosophy}</p>
              <p className="text-text-secondary text-xs">{philosophyDetail(manager.philosophy)}</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-border">
            <div>
              <p className="text-text-secondary text-sm">Ambition: {manager.ambition}/100</p>
              <p className="text-xs text-text-primary">{ambitionLabel(manager.ambition)}</p>
            </div>
            <div>
              <p className="text-text-secondary text-sm">Patience: {manager.patience}/100</p>
              <p className="text-xs text-text-primary">{patienceLabel(manager.patience)}</p>
            </div>
          </div>

          {/* Budget Allocation */}
          <div className="mt-4 pt-3 border-t border-border">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Transfer Budget</h3>
            <p className="text-xs text-text-secondary mb-2">
              Current: ${club.finance.transferBudget.toLocaleString()} allocated · ${club.finance.remainingTransferBudget.toLocaleString()} remaining
            </p>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={budgetInput || club.finance.transferBudget}
                onChange={(e) => setBudgetInput(Number(e.target.value))}
                className="w-28 bg-bg-base border border-border rounded px-2 py-1 text-sm text-text-primary"
                placeholder="Budget"
              />
              <button
                onClick={() => { setTransferBudget(budgetInput); setBudgetInput(0) }}
                className="px-3 py-1 bg-accent text-black text-sm font-semibold rounded cursor-pointer"
              >
                Set Budget
              </button>
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
        <div className="bg-bg-surface border border-border rounded p-3 md:p-4 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-3">Candidate Managers</h2>
          <div className="space-y-3">
            {managerCandidates.map((m) => (
              <div key={m.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-border rounded p-3">
                <div>
                  <p className="font-medium text-text-primary">{m.name}</p>
                  <p className="text-xs text-text-secondary">
                    Tactical: {m.tacticalSkill} | Transfer: {m.transferSkill} | Man Mgmt: {m.manManagement}
                    &nbsp;| Philosophy: {m.philosophy} | Ambition: {m.ambition} | Patience: {m.patience}
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

      {/* Rivals */}
      {club.rivals.length > 0 && (
        <div className="bg-bg-surface border border-border rounded p-3 md:p-4 mt-6">
          <h2 className="text-lg font-semibold text-text-primary mb-2">Derby Rivals</h2>
          <p className="text-sm text-text-secondary">
            {club.rivals.map((r, i) => (
              <span key={r}>
                <span className="text-negative font-medium">{r}</span>
                {i < club.rivals.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </p>
          <p className="text-xs text-text-secondary mt-1">Matches against rivals carry extra fan trust and board confidence stakes.</p>
        </div>
      )}
    </div>
  )
}

function getOrdinalSuffix(n: number): string {
  if (n === 1) return 'st'
  if (n === 2) return 'nd'
  if (n === 3) return 'rd'
  return 'th'
}
