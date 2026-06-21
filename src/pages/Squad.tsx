import { useGameStore, getPlayerClub } from '../state/gameStore'
import { CardTable } from '../components/CardTable'

export default function SquadPage() {
  const playerClubId = useGameStore((s) => s.playerClubId)
  const leagues = useGameStore((s) => s.leagues)
  const sellPlayer = useGameStore((s) => s.sellPlayer)
  const transferListPlayer = useGameStore((s) => s.transferListPlayer)

  if (!playerClubId) return <h1 className="text-2xl font-bold text-text-primary">No game in progress</h1>

  const club = getPlayerClub({ leagues, playerClubId } as any)
  if (!club) return <p className="text-negative">Club not found</p>

  const totalWages = club.squad.reduce((s, p) => s + p.wage, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Squad</h1>
      <p className="text-text-secondary mb-4">
        {club.squad.length} players · Total wages: ${totalWages.toLocaleString()}/w
      </p>

      <PlayerSection title="Goalkeepers" players={club.squad.filter((p) => p.position === 'GK')} playerClubId={playerClubId} onSell={sellPlayer} onToggleList={transferListPlayer} />
      <PlayerSection title="Defenders" players={club.squad.filter((p) => p.position === 'DEF')} playerClubId={playerClubId} onSell={sellPlayer} onToggleList={transferListPlayer} />
      <PlayerSection title="Midfielders" players={club.squad.filter((p) => p.position === 'MID')} playerClubId={playerClubId} onSell={sellPlayer} onToggleList={transferListPlayer} />
      <PlayerSection title="Forwards" players={club.squad.filter((p) => p.position === 'FWD')} playerClubId={playerClubId} onSell={sellPlayer} onToggleList={transferListPlayer} />
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
    <div className="bg-bg-surface border border-border rounded mb-4 p-3 md:p-4">
      <h2 className="text-lg font-semibold text-text-primary mb-3">{title} ({players.length})</h2>
      <CardTable
        columns={[
          { header: 'Name', accessor: (p) => p.name },
          { header: 'Age', accessor: (p) => p.age, align: 'center' },
          { header: 'Abil', accessor: (p) => (
            <span className={p.ability >= 70 ? 'text-positive' : p.ability >= 50 ? 'text-warning' : 'text-negative'}>{p.ability}</span>
          ), align: 'center' },
          { header: 'Pot', accessor: (p) => p.potential, align: 'center', hideOnMobile: true },
          { header: 'Wage', accessor: (p) => `$${p.wage.toLocaleString()}`, align: 'right' },
          { header: 'Value', accessor: (p) => `$${p.transferFee.toLocaleString()}`, align: 'right', hideOnMobile: true },
          { header: 'Book Val', accessor: (p) => `$${p.bookValue.toLocaleString()}`, align: 'right', hideOnMobile: true },
          { header: 'Listed', accessor: (p) => (
            <button
              onClick={() => onToggleList(p.id, !p.transferListed)}
              className={`text-xs px-2 py-1 rounded cursor-pointer min-h-[28px] ${p.transferListed ? 'bg-warning text-black' : 'bg-border text-text-secondary'}`}
            >
              {p.transferListed ? 'Yes' : 'No'}
            </button>
          ), align: 'center' },
          { header: '', accessor: (p) => (
            <button
              onClick={() => onSell(p.id)}
              className="text-xs px-2 py-1 bg-negative/20 text-negative rounded cursor-pointer hover:bg-negative/40 min-h-[28px]"
            >
              Sell
            </button>
          ), align: 'right' },
        ]}
        data={players}
        rowKey={(p) => p.id}
        cardTitle={(p) => p.name}
        cardSubtitle={(p) => `${p.position} · Age ${p.age}`}
        cardMeta={(p) => [
          { label: 'Abil', value: p.ability, color: p.ability >= 70 ? 'text-positive' : p.ability >= 50 ? 'text-warning' : 'text-negative' },
          { label: 'Wage', value: `$${p.wage.toLocaleString()}` },
        ]}
        emptyMessage={`No ${title.toLowerCase()}`}
      />
    </div>
  )
}
