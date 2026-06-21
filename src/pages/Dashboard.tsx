import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../state/gameStore'
import nationalLeagueClubs from '../data/clubs/national-league.json'
import type { ClubData } from '../engine/types'
import { CardTable } from '../components/CardTable'

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{club.name}</h1>
          <p className="text-text-secondary">{league.name} (Tier {league.tier})</p>
        </div>
        <div className="text-right">
          <p className="text-text-secondary text-sm">Season {useGameStore.getState().season} · Week {weekNumber}</p>
          <p className="text-text-primary font-semibold">Cash: ${club.finance.cash.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="bg-bg-surface border border-border rounded p-4">
          <p className="text-text-secondary text-sm">Board Confidence</p>
          <p className="text-xl font-bold text-positive">{club.boardConfidence}%</p>
        </div>
        <div className="bg-bg-surface border border-border rounded p-4">
          <p className="text-text-secondary text-sm">Fan Trust</p>
          <p className="text-xl font-bold text-positive">{club.fanTrust}%</p>
        </div>
        <div className="bg-bg-surface border border-border rounded p-4">
          <p className="text-text-secondary text-sm">Stadium Capacity</p>
          <p className="text-xl font-bold text-text-primary">{club.stadiumCapacity.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-bg-surface border border-border rounded p-3 md:p-4 mb-6">
        <h2 className="text-lg font-semibold text-text-primary mb-3">Squad ({club.squad.length} players)</h2>
        <CardTable
          columns={[
            { header: 'Name', accessor: (p) => p.name },
            { header: 'Pos', accessor: (p) => p.position, align: 'center' },
            { header: 'Age', accessor: (p) => p.age, align: 'center' },
            { header: 'Ability', accessor: (p) => (
              <span className={p.ability >= 70 ? 'text-positive' : p.ability >= 50 ? 'text-warning' : 'text-negative'}>{p.ability}</span>
            ), align: 'center' },
            { header: 'Pot', accessor: (p) => p.potential, align: 'center', hideOnMobile: true },
            { header: 'Wage', accessor: (p) => `$${p.wage.toLocaleString()}/w`, align: 'right' },
          ]}
          data={club.squad}
          rowKey={(p) => p.id}
          cardTitle={(p) => p.name}
          cardSubtitle={(p) => `${p.position} · Age ${p.age}`}
          cardMeta={(p) => [
            { label: 'Abil', value: p.ability, color: p.ability >= 70 ? 'text-positive' : p.ability >= 50 ? 'text-warning' : 'text-negative' },
            { label: 'Wage', value: `$${p.wage.toLocaleString()}/w` },
          ]}
        />
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={advanceWeek}
          className="px-6 py-2 bg-accent text-black font-semibold rounded hover:opacity-90 cursor-pointer"
        >
          Advance Week
        </button>
        <button
          onClick={() => navigate('/squad')}
          className="px-4 py-2 bg-bg-surface-raised text-text-primary border border-border rounded hover:bg-border cursor-pointer"
        >
          Full Squad
        </button>
      </div>

      {eventLog.length > 0 && (
        <div className="bg-bg-surface border border-border rounded p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-2">Event Log</h3>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {[...eventLog].reverse().slice(0, 10).map((msg, i) => (
              <p key={i} className="text-xs text-text-secondary">{msg}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
