import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../state/gameStore'
import nationalLeagueClubs from '../data/clubs/national-league.json'
import type { ClubData } from '../engine/types'
import { wageToRevenueRatio, wageHealthColor } from '../engine/finance'

const natClubs = (nationalLeagueClubs as ClubData[]).map((c) => ({
  ...c,
  id: `${c.shortName}-5`,
}))

export default function Dashboard() {
  const weekNumber = useGameStore((s) => s.weekNumber)
  const advanceWeek = useGameStore((s) => s.advanceWeek)
  const newGame = useGameStore((s) => s.newGame)
  const leagues = useGameStore((s) => s.leagues)
  const playerClubId = useGameStore((s) => s.playerClubId)
  const gameOver = useGameStore((s) => s.gameOver)
  const gameOverReason = useGameStore((s) => s.gameOverReason)
  const eventLog = useGameStore((s) => s.eventLog)
  const navigate = useNavigate()

  const [selectedClub, setSelectedClub] = useState('')
  const [customName, setCustomName] = useState('')
  const [scenario, setScenario] = useState('stable')

  const handleStart = () => {
    if (!selectedClub) return
    newGame(selectedClub, customName || undefined, scenario)
  }

  if (!playerClubId) {
    return (
      <div className="max-w-xl mx-auto mt-12">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Football Chairman</h1>
        <p className="text-text-secondary mb-6">Pick a National League club to take over as Chairman.</p>

        <div className="mb-4">
          <label className="block text-sm text-text-secondary mb-1">Club</label>
          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="w-full bg-bg-surface border border-border rounded px-3 py-2 text-text-primary"
          >
            <option value="">-- Select a club --</option>
            {natClubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.shortName}) — Cap: {c.stadiumCapacity.toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-text-secondary mb-1">Rename your club (optional)</label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Leave blank to keep original name"
            className="w-full bg-bg-surface border border-border rounded px-3 py-2 text-text-primary"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-text-secondary mb-1">Starting Scenario</label>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="w-full bg-bg-surface border border-border rounded px-3 py-2 text-text-primary"
          >
            <option value="stable">Stable Non-League Side (Easy)</option>
            <option value="yoYo">Yo-Yo Club (Medium)</option>
            <option value="crisis">Crisis Club (Hard)</option>
          </select>
        </div>

        <button
          onClick={handleStart}
          disabled={!selectedClub}
          className="px-6 py-2 bg-accent text-black font-semibold rounded hover:opacity-90 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          Start New Game
        </button>
      </div>
    )
  }

  if (gameOver) {
    return (
      <div className="max-w-xl mx-auto mt-12 text-center">
        <h1 className="text-3xl font-bold text-negative mb-4">Game Over</h1>
        <p className="text-text-primary mb-6">{gameOverReason}</p>
        <button
          onClick={() => {
            localStorage.removeItem('football-chairman-save')
            window.location.reload()
          }}
          className="px-6 py-2 bg-accent text-black font-semibold rounded cursor-pointer"
        >
          New Game
        </button>
      </div>
    )
  }

  const league = leagues.find((l) => l.clubs.some((c) => c.id === playerClubId))
  const club = league?.clubs.find((c) => c.id === playerClubId)

  if (!club || !league) {
    return <p className="text-negative">Error: Club not found.</p>
  }

  // League position & form
  const sortedTable = [...league.table].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const gdA = a.goalsFor - a.goalsAgainst
    const gdB = b.goalsFor - b.goalsAgainst
    if (gdB !== gdA) return gdB - gdA
    return b.goalsFor - a.goalsFor
  })
  const position = sortedTable.findIndex((r) => r.clubId === playerClubId) + 1

  // Form from last 5 player-club fixtures
  const allPlayerFixtures = league.fixtures
    .filter((f) => f.result && (f.homeId === playerClubId || f.awayId === playerClubId))
    .sort((a, b) => b.week - a.week)
    .slice(0, 5)
  const form = allPlayerFixtures.map((f) => {
    const isHome = f.homeId === playerClubId
    if (!f.result) return 'd' as const
    if (isHome && f.result.homeGoals > f.result.awayGoals) return 'w' as const
    if (!isHome && f.result.awayGoals > f.result.homeGoals) return 'w' as const
    if (f.result.homeGoals === f.result.awayGoals) return 'd' as const
    return 'l' as const
  }).reverse()

  // Next fixture
  const nextFixture = league.fixtures.find((f) => f.week === weekNumber + 1 && !f.result && (f.homeId === playerClubId || f.awayId === playerClubId))
  const nextOpponent = nextFixture
    ? league.clubs.find((c) => c.id === (nextFixture.homeId === playerClubId ? nextFixture.awayId : nextFixture.homeId))
    : null

  // Finance snapshot
  const totalRevenue = Object.values(club.finance.revenueByCategory).reduce((a, b) => a + b, 0)
  const totalWages = club.squad.reduce((s, p) => s + p.wage, 0) + (club.manager?.wageDemand ?? 0)
  const wtr = wageToRevenueRatio(totalWages, totalRevenue || 1)
  const wtrStatus = wageHealthColor(wtr)

  const formChip = (r: 'w' | 'd' | 'l', i: number) => {
    const colors = { w: 'bg-positive text-black', d: 'bg-warning text-black', l: 'bg-negative text-white' }
    return (
      <span key={i} className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${colors[r]}`}>
        {r.toUpperCase()}
      </span>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary">{club.name}</h1>
          <p className="text-text-secondary text-sm">{league.name} (Tier {league.tier})</p>
        </div>
        <div className="text-right">
          <p className="text-text-secondary text-xs">Season {useGameStore.getState().season} · Week {weekNumber}</p>
        </div>
      </div>

      {/* League Position & Next Fixture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="bg-bg-surface border border-border rounded p-3 md:p-4">
          <p className="text-text-secondary text-xs uppercase tracking-wider">League Position</p>
          <p className="text-2xl md:text-3xl font-bold text-text-primary mt-1">
            {position}<span className="text-sm font-normal text-text-secondary">{getOrdinalSuffix(position)}</span>
          </p>
          <p className="text-text-secondary text-xs mt-1">
            {sortedTable[0]?.clubId === playerClubId ? 'Top of the table!' : `${sortedTable[0]?.points - (sortedTable.find((r) => r.clubId === playerClubId)?.points ?? 0)}pts off top`}
          </p>
          {form.length > 0 && (
            <div className="flex gap-1 mt-2">
              <span className="text-text-secondary text-[10px] mr-1 self-center">Form:</span>
              {form.map((r, i) => formChip(r, i))}
            </div>
          )}
        </div>

        <div className="bg-bg-surface border border-border rounded p-3 md:p-4">
          <p className="text-text-secondary text-xs uppercase tracking-wider">Next Fixture</p>
          {nextFixture && nextOpponent ? (
            <>
              <p className="text-lg font-bold text-text-primary mt-1">
                {nextFixture.homeId === playerClubId ? 'Home' : 'Away'} vs {nextOpponent.shortName}
              </p>
              <p className="text-text-secondary text-xs">
                Week {nextFixture.week} · {nextOpponent.name}
              </p>
              {club.manager && (
                <p className="text-text-secondary text-xs mt-1">
                  Approach: <span className="text-accent">{club.manager.philosophy}</span>
                </p>
              )}
            </>
          ) : (
            <p className="text-text-secondary text-sm mt-1">No fixture scheduled</p>
          )}
        </div>
      </div>

      {/* Finance Snapshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-bg-surface border border-border rounded p-3">
          <p className="text-text-secondary text-[10px] uppercase tracking-wider">Cash</p>
          <p className="text-base font-bold text-text-primary">${club.finance.cash.toLocaleString()}</p>
        </div>
        <div className="bg-bg-surface border border-border rounded p-3">
          <p className="text-text-secondary text-[10px] uppercase tracking-wider">Debt</p>
          <p className={`text-base font-bold ${club.finance.debt > 0 ? 'text-negative' : 'text-positive'}`}>
            ${club.finance.debt.toLocaleString()}
          </p>
        </div>
        <div className="bg-bg-surface border border-border rounded p-3">
          <p className="text-text-secondary text-[10px] uppercase tracking-wider">Wage Ratio</p>
          <p className={`text-base font-bold ${wtrStatus === 'healthy' ? 'text-positive' : wtrStatus === 'risky' ? 'text-warning' : 'text-negative'}`}>
            {(wtr * 100).toFixed(0)}%
          </p>
        </div>
        <div className="bg-bg-surface border border-border rounded p-3">
          <p className="text-text-secondary text-[10px] uppercase tracking-wider">PSR</p>
          <p className={`text-base font-bold ${club.finance.rollingLoss3yr <= 5000000 ? 'text-positive' : 'text-negative'}`}>
            ${club.finance.rollingLoss3yr.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Board Confidence & Fan Trust */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-bg-surface border border-border rounded p-3">
          <div className="flex justify-between items-center mb-1">
            <p className="text-text-secondary text-[10px] uppercase tracking-wider">Board</p>
            <p className="text-sm font-bold" style={{ color: club.boardConfidence > 50 ? '#34d399' : club.boardConfidence > 25 ? '#fbbf24' : '#f87171' }}>
              {club.boardConfidence}%
            </p>
          </div>
          <div className="w-full bg-border rounded h-1.5">
            <div
              className="h-1.5 rounded transition-all"
              style={{
                width: `${club.boardConfidence}%`,
                backgroundColor: club.boardConfidence > 50 ? '#34d399' : club.boardConfidence > 25 ? '#fbbf24' : '#f87171',
              }}
            />
          </div>
        </div>
        <div className="bg-bg-surface border border-border rounded p-3">
          <div className="flex justify-between items-center mb-1">
            <p className="text-text-secondary text-[10px] uppercase tracking-wider">Fans</p>
            <p className="text-sm font-bold" style={{ color: club.fanTrust > 50 ? '#34d399' : club.fanTrust > 25 ? '#fbbf24' : '#f87171' }}>
              {club.fanTrust}%
            </p>
          </div>
          <div className="w-full bg-border rounded h-1.5">
            <div
              className="h-1.5 rounded transition-all"
              style={{
                width: `${club.fanTrust}%`,
                backgroundColor: club.fanTrust > 50 ? '#34d399' : club.fanTrust > 25 ? '#fbbf24' : '#f87171',
              }}
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={advanceWeek}
          className="flex-1 px-4 py-2.5 bg-accent text-black font-semibold rounded hover:opacity-90 cursor-pointer text-sm"
        >
          Advance Week
        </button>
        <button
          onClick={() => navigate('/squad')}
          className="flex-1 px-4 py-2.5 bg-bg-surface-raised text-text-primary border border-border rounded hover:bg-border cursor-pointer text-sm"
        >
          Squad
        </button>
        <button
          onClick={() => navigate('/league')}
          className="flex-1 px-4 py-2.5 bg-bg-surface-raised text-text-primary border border-border rounded hover:bg-border cursor-pointer text-sm"
        >
          Table
        </button>
      </div>

      {/* Activity feed */}
      {eventLog.length > 0 && (
        <div className="bg-bg-surface border border-border rounded p-3 md:p-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Activity</h3>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {[...eventLog].reverse().slice(0, 8).map((msg, i) => (
              <p key={i} className="text-xs text-text-secondary leading-relaxed">{msg}</p>
            ))}
          </div>
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
