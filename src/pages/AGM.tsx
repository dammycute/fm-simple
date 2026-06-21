import { useGameStore, getPlayerClub, getPlayerLeague } from '../state/gameStore'

export default function AGM() {
  const playerClubId = useGameStore((s) => s.playerClubId)
  const leagues = useGameStore((s) => s.leagues)

  if (!playerClubId) return <h1 className="text-2xl font-bold text-text-primary">No game in progress</h1>

  const club = getPlayerClub({ leagues, playerClubId } as any)
  const league = getPlayerLeague({ leagues, playerClubId } as any)

  if (!club || !league) return <p className="text-negative">Club not found</p>

  const sortedTable = [...league.table].sort((a, b) => b.points - a.points)
  const position = sortedTable.findIndex((r) => r.clubId === playerClubId) + 1

  const fin = club.finance
  const totalRevenue = Object.values(fin.revenueByCategory).reduce((a, b) => a + b, 0)
  const totalExpenses = Object.values(fin.expenseByCategory).reduce((a, b) => a + b, 0)
  const netProfit = totalRevenue - totalExpenses

  const seasonComplete = league.fixtures.every((f) => f.result !== undefined)

  if (!seasonComplete) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-4">AGM / Season Review</h1>
        <p className="text-text-secondary">The season is still in progress. Check back after the final match.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-4">AGM — End of Season Review</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-bg-surface border border-border rounded p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-2">Sporting Summary</h2>
          <p className="text-text-secondary">Final Position: <span className="text-text-primary font-bold">{position}{position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'}</span></p>
          <p className="text-text-secondary">Division: {league.name}</p>
          <p className="text-text-secondary">Objective: <span className="text-text-primary">{club.seasonObjective}</span></p>
        </div>

        <div className="bg-bg-surface border border-border rounded p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-2">Financial Summary</h2>
          <p className="text-text-secondary">Revenue: <span className="text-positive">${totalRevenue.toLocaleString()}</span></p>
          <p className="text-text-secondary">Expenses: <span className="text-negative">${totalExpenses.toLocaleString()}</span></p>
          <p className={`font-bold ${netProfit >= 0 ? 'text-positive' : 'text-negative'}`}>
            Net: {netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()}
          </p>
          <p className="text-text-secondary mt-1">Cash: ${fin.cash.toLocaleString()} | Debt: ${fin.debt.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-bg-surface border border-border rounded p-4 mb-6">
        <h2 className="text-lg font-semibold text-text-primary mb-2">Board Confidence</h2>
        <div className="w-full bg-border rounded h-4">
          <div
            className="h-4 rounded transition-all"
            style={{
              width: `${club.boardConfidence}%`,
              backgroundColor: club.boardConfidence > 50 ? '#34d399' : club.boardConfidence > 25 ? '#fbbf24' : '#f87171',
            }}
          />
        </div>
        <p className="text-text-secondary text-sm mt-1">{club.boardConfidence}%</p>
        {club.boardConfidence <= 20 && (
          <p className="text-negative mt-2 font-semibold">Warning: Board confidence is critically low. A no-confidence vote may be triggered!</p>
        )}
      </div>

      <div className="bg-bg-surface border border-border rounded p-4">
        <h2 className="text-lg font-semibold text-text-primary mb-2">Fan Trust</h2>
        <div className="w-full bg-border rounded h-4">
          <div
            className="h-4 rounded transition-all"
            style={{
              width: `${club.fanTrust}%`,
              backgroundColor: club.fanTrust > 50 ? '#34d399' : club.fanTrust > 25 ? '#fbbf24' : '#f87171',
            }}
          />
        </div>
        <p className="text-text-secondary text-sm mt-1">{club.fanTrust}%</p>
      </div>
    </div>
  )
}
