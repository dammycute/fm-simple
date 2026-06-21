import { useGameStore, getPlayerLeague } from '../state/gameStore'

export default function LeaguePage() {
  const leagues = useGameStore((s) => s.leagues)
  const playerClubId = useGameStore((s) => s.playerClubId)

  if (!playerClubId) {
    return <h1 className="text-2xl font-bold text-text-primary">No game in progress</h1>
  }

  const league = getPlayerLeague({ leagues, playerClubId } as any)

  if (!league) return <p className="text-negative">League not found</p>

  const sortedTable = [...league.table].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const gdA = a.goalsFor - a.goalsAgainst
    const gdB = b.goalsFor - b.goalsAgainst
    if (gdB !== gdA) return gdB - gdA
    return b.goalsFor - a.goalsFor
  })

  const clubMap = new Map(league.clubs.map((c) => [c.id, c]))

  const currentWeekFixtures = league.fixtures.filter((f) => f.result)
  const latestFixtures = currentWeekFixtures.slice(-6).reverse()

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-4">{league.name}</h1>

      <div className="bg-bg-surface border border-border rounded overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-secondary border-b border-border">
              <th className="text-left py-2 px-3">#</th>
              <th className="text-left px-3">Club</th>
              <th className="text-center px-2">P</th>
              <th className="text-center px-2">W</th>
              <th className="text-center px-2">D</th>
              <th className="text-center px-2">L</th>
              <th className="text-center px-2">GF</th>
              <th className="text-center px-2">GA</th>
              <th className="text-center px-2">GD</th>
              <th className="text-center px-3 font-bold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {sortedTable.map((row, i) => {
              const club = clubMap.get(row.clubId)
              const isPlayer = row.clubId === playerClubId
              const gd = row.goalsFor - row.goalsAgainst
              return (
                <tr
                  key={row.clubId}
                  className={`border-b border-border/50 ${isPlayer ? 'bg-accent/10' : ''}`}
                >
                  <td className="py-1.5 px-3 text-text-secondary">{i + 1}</td>
                  <td className={`px-3 font-medium ${isPlayer ? 'text-accent' : 'text-text-primary'}`}>
                    {club?.name ?? row.clubId}
                  </td>
                  <td className="text-center px-2 text-text-primary">{row.played}</td>
                  <td className="text-center px-2 text-text-primary">{row.won}</td>
                  <td className="text-center px-2 text-text-primary">{row.drawn}</td>
                  <td className="text-center px-2 text-text-primary">{row.lost}</td>
                  <td className="text-center px-2 text-text-primary">{row.goalsFor}</td>
                  <td className="text-center px-2 text-text-primary">{row.goalsAgainst}</td>
                  <td className={`text-center px-2 ${gd > 0 ? 'text-positive' : gd < 0 ? 'text-negative' : 'text-text-primary'}`}>
                    {gd > 0 ? '+' : ''}{gd}
                  </td>
                  <td className="text-center px-3 font-bold text-text-primary">{row.points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {latestFixtures.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-text-primary mb-2">Recent Results</h2>
          <div className="space-y-2">
            {latestFixtures.map((f) => {
              const home = clubMap.get(f.homeId)
              const away = clubMap.get(f.awayId)
              if (!home || !away) return null
              return (
                <div key={`${f.homeId}-${f.awayId}-${f.week}`} className="bg-bg-surface border border-border rounded p-3 flex items-center justify-between">
                  <span className={`text-sm ${f.homeId === playerClubId ? 'text-accent font-semibold' : 'text-text-primary'}`}>{home.name}</span>
                  <span className="text-lg font-bold text-text-primary px-4">
                    {f.result?.homeGoals} - {f.result?.awayGoals}
                  </span>
                  <span className={`text-sm ${f.awayId === playerClubId ? 'text-accent font-semibold' : 'text-text-primary'}`}>{away.name}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
