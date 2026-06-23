import { useState } from 'react'
import { useGameStore, getPlayerClub } from '../state/gameStore'
import { getTransferList, calculateOfferSuccess } from '../engine/transferMarket'
import { CardTable } from '../components/CardTable'

export default function TransferMarketPage() {
  const playerClubId = useGameStore((s) => s.playerClubId)
  const leagues = useGameStore((s) => s.leagues)
  const buyPlayer = useGameStore((s) => s.buyPlayer)

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [bidAmount, setBidAmount] = useState(0)
  const [contractLength, setContractLength] = useState(3)
  const [installment] = useState(true)
  const [offerResult, setOfferResult] = useState<string | null>(null)

  if (!playerClubId) return <h1 className="text-2xl font-bold text-text-primary">No game in progress</h1>

  const club = getPlayerClub({ leagues, playerClubId } as any)
  if (!club) return <p className="text-negative">Club not found</p>

  const transferList = getTransferList(leagues, playerClubId)

  const handleBid = (playerId: string, fromClubId: string) => {
    const entry = transferList.find((t) => t.player.id === playerId)
    if (!entry) return

    const result = calculateOfferSuccess(bidAmount, entry.player.transferFee, entry.club.reputation, club.reputation, entry.player.ability)

    if (result.accepted) {
      buyPlayer(playerId, fromClubId, bidAmount, contractLength, installment)
      setOfferResult(`Signed ${entry.player.name} for $${bidAmount.toLocaleString()}.`)
      setSelectedPlayerId(null)
    } else if (result.counterOffer) {
      setOfferResult(`Rejected. Counter: $${result.counterOffer.toLocaleString()}`)
    } else {
      setOfferResult('Offer rejected.')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-4">Transfer Market</h1>
      <p className="text-text-secondary mb-4 text-sm">
        Cash: ${club.finance.cash.toLocaleString()} | Wages: ${club.squad.reduce((s, p) => s + p.wage, 0).toLocaleString()}/w
      </p>

      {offerResult && (
        <div className="bg-bg-surface border border-border rounded p-3 mb-4 text-text-primary text-sm">
          {offerResult}
          <button onClick={() => setOfferResult(null)} className="ml-3 text-xs text-text-secondary cursor-pointer">Dismiss</button>
        </div>
      )}

      <div className="bg-bg-surface border border-border rounded p-3 md:p-4">
        <CardTable
          columns={[
            { header: 'Name', accessor: (e) => e.player.name },
            { header: 'Pos', accessor: (e) => e.player.position, align: 'center' },
            { header: 'Age', accessor: (e) => e.player.age, align: 'center' },
            { header: 'Abil', accessor: (e) => (
              <span className={e.player.ability >= 70 ? 'text-positive' : e.player.ability >= 50 ? 'text-warning' : 'text-negative'}>{e.player.ability}</span>
            ), align: 'center' },
            { header: 'Value', accessor: (e) => `$${e.player.transferFee.toLocaleString()}`, align: 'right' },
            { header: 'Wage', accessor: (e) => `$${e.player.wage.toLocaleString()}`, align: 'right', hideOnMobile: true },
            { header: 'Tier', accessor: (e) => `T${e.tier}`, align: 'center' },
            { header: 'Club', accessor: (e) => e.club.shortName, hideOnMobile: true },
            { header: '', accessor: (e) => selectedPlayerId === e.player.id ? (
              <div className="flex gap-1 items-center justify-end">
                <input type="number" value={bidAmount} onChange={(e2) => setBidAmount(Number(e2.target.value))}
                  className="w-16 md:w-20 bg-bg-base border border-border rounded px-1 py-1 text-xs text-text-primary" placeholder="Fee" />
                <select value={contractLength} onChange={(e2) => setContractLength(Number(e2.target.value))}
                  className="bg-bg-base border border-border rounded px-1 py-1 text-xs text-text-primary">
                  <option value={2}>2yr</option>
                  <option value={3}>3yr</option>
                  <option value={4}>4yr</option>
                  <option value={5}>5yr</option>
                </select>
                <button onClick={() => handleBid(e.player.id, e.club.id)}
                  className="text-xs px-2 py-1.5 bg-accent text-black rounded font-semibold cursor-pointer min-h-[28px]">Bid</button>
                <button onClick={() => { setSelectedPlayerId(null); setOfferResult(null) }}
                  className="text-xs px-2 py-1.5 bg-border rounded cursor-pointer min-h-[28px]">X</button>
              </div>
            ) : (
              <button onClick={() => { setSelectedPlayerId(e.player.id); setBidAmount(e.player.transferFee); setOfferResult(null) }}
                className="text-xs px-3 py-1.5 bg-bg-surface-raised border border-border rounded cursor-pointer hover:bg-border min-h-[28px]">Bid</button>
            ), align: 'right' },
          ]}
          data={transferList}
          rowKey={(e) => e.player.id}
          cardTitle={(e) => e.player.name}
          cardSubtitle={(e) => `${e.player.position} · ${e.club.shortName}`}
          cardMeta={(e) => [
            { label: 'Abil', value: e.player.ability, color: e.player.ability >= 70 ? 'text-positive' : e.player.ability >= 50 ? 'text-warning' : 'text-negative' },
            { label: 'Value', value: `$${e.player.transferFee.toLocaleString()}` },
          ]}
          emptyMessage="No players available on the transfer market"
        />
      </div>
    </div>
  )
}
