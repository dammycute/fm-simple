import { useGameStore, getPlayerClub } from '../state/gameStore'

export default function SquadPage() {
  const playerClubId = useGameStore((s) => s.playerClubId)
  const leagues = useGameStore((s) => s.leagues)
  const sellPlayer = useGameStore((s) => s.sellPlayer)
  const transferListPlayer = useGameStore((s) => s.transferListPlayer)

  if (!playerClubId) return <h1 className="text-2xl font-bold text-text-primary">No game in progress</h1>

  const club = getPlayerClub({ leagues, playerClubId } as any)
  if (!club) return <p className="text-negative">Club not found</p>

  const totalWages = club.squad.reduce((s, p) => s + p.wage, 0)
  const gk = club.squad.filter((p) => p.position === 'GK')
  const def = club.squad.filter((p) => p.position === 'DEF')
  const mid = club.squad.filter((p) => p.position === 'MID')
  const fwd = club.squad.filter((p) => p.position === 'FWD')

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Squad</h1>
      <p className="text-text-secondary mb-4">
        {club.squad.length} players · Total weekly wages: ${totalWages.toLocaleString()}
      </p>

      <PlayerSection title="Goalkeepers" players={gk} playerClubId={playerClubId} onSell={sellPlayer} onToggleList={transferListPlayer} />
      <PlayerSection title="Defenders" players={def} playerClubId={playerClubId} onSell={sellPlayer} onToggleList={transferListPlayer} />
      <PlayerSection title="Midfielders" players={mid} playerClubId={playerClubId} onSell={sellPlayer} onToggleList={transferListPlayer} />
      <PlayerSection title="Forwards" players={fwd} playerClubId={playerClubId} onSell={sellPlayer} onToggleList={transferListPlayer} />
    </div>
  )
}

function PlayerSection({
  title,
  players,
  playerClubId,
  onSell,
  onToggleList,
}: {
  title: string
  players: import('../engine/types').Player[]
  playerClubId: string
  onSell: (id: string) => void
  onToggleList: (id: string, listed: boolean) => void
}) {
  if (players.length === 0) return null

  return (
    <div className="bg-bg-surface border border-border rounded mb-4 overflow-x-auto">
      <h2 className="text-lg font-semibold text-text-primary px-4 pt-3 pb-1">{title}</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-text-secondary border-b border-border">
            <th className="text-left py-2 px-3">Name</th>
            <th className="text-left px-2">Age</th>
            <th className="text-center px-2">Abil</th>
            <th className="text-center px-2">Pot</th>
            <th className="text-right px-2">Wage</th>
            <th className="text-right px-2">Market Value</th>
            <th className="text-right px-2">Book Value</th>
            <th className="text-center px-2">Listed</th>
            <th className="text-right px-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.id} className="border-b border-border/50 text-text-primary">
              <td className="py-1.5 px-3">{p.name}</td>
              <td className="px-2">{p.age}</td>
              <td className={`text-center px-2 ${p.ability >= 70 ? 'text-positive' : p.ability >= 50 ? 'text-warning' : 'text-negative'}`}>
                {p.ability}
              </td>
              <td className="text-center px-2 text-text-secondary">{p.potential}</td>
              <td className="text-right px-2">${p.wage.toLocaleString()}</td>
              <td className="text-right px-2">${p.transferFee.toLocaleString()}</td>
              <td className="text-right px-2 text-text-secondary">${p.bookValue.toLocaleString()}</td>
              <td className="text-center px-2">
                <button
                  onClick={() => onToggleList(p.id, !p.transferListed)}
                  className={`text-xs px-2 py-0.5 rounded cursor-pointer ${p.transferListed ? 'bg-warning text-black' : 'bg-border text-text-secondary'}`}
                >
                  {p.transferListed ? 'Yes' : 'No'}
                </button>
              </td>
              <td className="text-right px-3">
                <button
                  onClick={() => onSell(p.id)}
                  className="text-xs px-2 py-0.5 bg-negative/20 text-negative rounded cursor-pointer hover:bg-negative/40"
                >
                  Sell
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
