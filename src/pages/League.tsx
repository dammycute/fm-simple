import { useGameStore, getPlayerClub } from '../state/gameStore'
import { CardTable } from '../components/CardTable'

export default function LeaguePage() {
  const leagues = useGameStore((s) => s.leagues)
  const playerClubId = useGameStore((s) => s.playerClubId)

  if (!playerClubId) return <h1 className="text-2xl font-bold text-text-primary">No game in progress</h1>

  const club = getPlayerClub({ leagues, playerClubId } as any)
  const playerTier = club ? club.tier : -1

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-4">League Standings</h1>

      <div className="space-y-4">
        {leagues.map((league) => {
          const isPlayerLeague = league.tier === playerTier
          const clubMap = new Map(league.clubs.map((c) => [c.id, c]))
          const sorted = [...league.table].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points
            const gdA = a.goalsFor - a.goalsAgainst
            const gdB = b.goalsFor - b.goalsAgainst
            if (gdB !== gdA) return gdB - gdA
            return b.goalsFor - a.goalsFor
          })
          return (
            <div key={league.tier} className={`bg-bg-surface border rounded p-3 md:p-4 ${isPlayerLeague ? 'border-accent' : 'border-border'}`}>
              <h2 className="text-lg font-semibold text-text-primary mb-1">{league.name}</h2>
              <p className="text-xs text-text-secondary mb-3">
                Tier {league.tier}{isPlayerLeague ? ' · Your Division' : ''}
              </p>
              <CardTable
                columns={[
                  { header: '#', accessor: (row) => {
                    const pos = sorted.indexOf(row) + 1
                    return <span className="font-semibold">{pos}</span>
                  }, align: 'center' },
                  { header: 'Club', accessor: (row) => {
                    const c = clubMap.get(row.clubId)
                    return (
                      <span className={row.clubId === playerClubId ? 'font-bold text-accent' : ''}>
                        {c?.name ?? row.clubId} {row.clubId === playerClubId && '★'}
                      </span>
                    )
                  } },
                  { header: 'P', accessor: (row) => row.played, align: 'center' },
                  { header: 'W', accessor: (row) => row.won, align: 'center' },
                  { header: 'D', accessor: (row) => row.drawn, align: 'center', hideOnMobile: true },
                  { header: 'L', accessor: (row) => row.lost, align: 'center', hideOnMobile: true },
                  { header: 'GF', accessor: (row) => row.goalsFor, align: 'center' },
                  { header: 'GA', accessor: (row) => row.goalsAgainst, align: 'center', hideOnMobile: true },
                  { header: 'GD', accessor: (row) => {
                    const gd = row.goalsFor - row.goalsAgainst
                    return <span className={gd >= 0 ? 'text-positive' : 'text-negative'}>{gd > 0 ? '+' : ''}{gd}</span>
                  }, align: 'center' },
                  { header: 'Pts', accessor: (row) => <span className="font-bold">{row.points}</span>, align: 'center' },
                ]}
                data={sorted}
                rowKey={(r) => r.clubId}
                cardTitle={(r) => {
                  const c = clubMap.get(r.clubId)
                  return `${sorted.indexOf(r) + 1}. ${c?.name ?? r.clubId}`
                }}
                cardMeta={(r) => [
                  { label: 'Pts', value: r.points, color: 'text-accent' },
                  { label: 'P', value: r.played },
                  { label: 'GD', value: r.goalsFor - r.goalsAgainst, color: (r.goalsFor - r.goalsAgainst) >= 0 ? 'text-positive' : 'text-negative' },
                ]}
              />
              {isPlayerLeague && (
                <div className="mt-2 text-xs text-text-secondary border-t border-border pt-2">
                  <span className="text-positive">Pos</span> = Promotion zone · <span className="text-negative">Neg</span> = Relegation zone
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
