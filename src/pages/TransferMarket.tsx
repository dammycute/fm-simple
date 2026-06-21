import { useState } from 'react'
import { useGameStore, getPlayerClub, getPlayerLeague } from '../state/gameStore'
import { getTransferList, calculateOfferSuccess } from '../engine/transferMarket'

export default function TransferMarketPage() {
  const playerClubId = useGameStore((s) => s.playerClubId)
  const leagues = useGameStore((s) => s.leagues)
  const buyPlayer = useGameStore((s) => s.buyPlayer)

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [bidAmount, setBidAmount] = useState(0)
  const [contractLength, setContractLength] = useState(3)
  const [installment, setInstallment] = useState(true)
  const [offerResult, setOfferResult] = useState<string | null>(null)

  if (!playerClubId) return <h1 className="text-2xl font-bold text-text-primary">No game in progress</h1>

  const club = getPlayerClub({ leagues, playerClubId } as any)
  const playerLeague = getPlayerLeague({ leagues, playerClubId } as any)

  if (!club || !playerLeague) return <p className="text-negative">Club not found</p>

  const transferList = getTransferList(leagues, playerClubId)
  const clubMap = new Map(leagues.flatMap((l) => l.clubs).map((c) => [c.id, c]))

  const handleBid = (playerId: string, fromClubId: string) => {
    const entry = transferList.find((t) => t.player.id === playerId)
    if (!entry) return

    const result = calculateOfferSuccess(bidAmount, entry.player.transferFee, entry.club.reputation)

    if (result.accepted) {
      buyPlayer(playerId, fromClubId, bidAmount, contractLength, installment)
      setOfferResult(`Offer accepted! Signed ${entry.player.name} for $${bidAmount.toLocaleString()}.`)
      setSelectedPlayerId(null)
    } else if (result.counterOffer) {
      setOfferResult(`Rejected. Counter offer: $${result.counterOffer.toLocaleString()}`)
    } else {
      setOfferResult('Offer rejected.')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-4">Transfer Market</h1>

      <p className="text-text-secondary mb-4">
        Cash: ${club.finance.cash.toLocaleString()} | Squad wages: ${club.squad.reduce((s, p) => s + p.wage, 0).toLocaleString()}/w
      </p>

      {offerResult && (
        <div className="bg-bg-surface border border-border rounded p-3 mb-4 text-text-primary text-sm">
          {offerResult}
          <button onClick={() => setOfferResult(null)} className="ml-3 text-xs text-text-secondary cursor-pointer">Dismiss</button>
        </div>
      )}

      <div className="bg-bg-surface border border-border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-secondary border-b border-border">
              <th className="text-left py-2 px-3">Name</th>
              <th className="text-left px-2">Pos</th>
              <th className="text-center px-2">Age</th>
              <th className="text-center px-2">Ability</th>
              <th className="text-right px-2">Value</th>
              <th className="text-right px-2">Wage</th>
              <th className="text-left px-3">Club</th>
              <th className="text-right px-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {transferList.length === 0 && (
              <tr><td colSpan={8} className="py-4 text-center text-text-secondary">No players available</td></tr>
            )}
            {transferList.map((entry) => (
              <tr key={entry.player.id} className="border-b border-border/50 text-text-primary">
                <td className="py-1.5 px-3">{entry.player.name}</td>
                <td className="px-2">{entry.player.position}</td>
                <td className="text-center px-2">{entry.player.age}</td>
                <td className={`text-center px-2 ${entry.player.ability >= 70 ? 'text-positive' : entry.player.ability >= 50 ? 'text-warning' : 'text-negative'}`}>
                  {entry.player.ability}
                </td>
                <td className="text-right px-2">${entry.player.transferFee.toLocaleString()}</td>
                <td className="text-right px-2">${entry.player.wage.toLocaleString()}</td>
                <td className="px-3 text-text-secondary">{entry.club.shortName}</td>
                <td className="text-right px-3">
                  {selectedPlayerId === entry.player.id ? (
                    <div className="flex gap-1 items-center justify-end">
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        className="w-20 bg-bg-base border border-border rounded px-1 py-0.5 text-xs text-text-primary"
                        placeholder="Fee"
                      />
                      <select
                        value={contractLength}
                        onChange={(e) => setContractLength(Number(e.target.value))}
                        className="bg-bg-base border border-border rounded px-1 py-0.5 text-xs text-text-primary"
                      >
                        <option value={2}>2yr</option>
                        <option value={3}>3yr</option>
                        <option value={4}>4yr</option>
                        <option value={5}>5yr</option>
                      </select>
                      <button
                        onClick={() => handleBid(entry.player.id, entry.club.id)}
                        className="text-xs px-2 py-0.5 bg-accent text-black rounded font-semibold cursor-pointer"
                      >
                        Bid
                      </button>
                      <button
                        onClick={() => { setSelectedPlayerId(null); setOfferResult(null) }}
                        className="text-xs px-2 py-0.5 bg-border rounded cursor-pointer"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setSelectedPlayerId(entry.player.id); setBidAmount(entry.player.transferFee); setOfferResult(null) }}
                      className="text-xs px-2 py-0.5 bg-bg-surface-raised border border-border rounded cursor-pointer hover:bg-border"
                    >
                      Bid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
