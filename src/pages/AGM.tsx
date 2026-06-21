import { useGameStore, getPlayerClub, getPlayerLeague } from '../state/gameStore'
import { evaluateObjective } from '../engine/board'

export default function AGM() {
  const playerClubId = useGameStore((s) => s.playerClubId)
  const leagues = useGameStore((s) => s.leagues)
  const season = useGameStore((s) => s.season)
  const seasonComplete = useGameStore((s) => s.seasonComplete)
  const rolloverData = useGameStore((s) => s.rolloverData)
  const rolloverSeasonAction = useGameStore((s) => s.rolloverSeasonAction)

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

  const objectiveResult = evaluateObjective(club.seasonObjective, position, league.rules.clubCount)

  const isPlayerPromoted = rolloverData?.promotions.some((p) => p.clubId === playerClubId)
  const isPlayerRelegated = rolloverData?.relegations.some((r) => r.clubId === playerClubId)

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-4">AGM — End of Season Review</h1>

      {rolloverData && (isPlayerPromoted || isPlayerRelegated) && (
        <div className={`border rounded p-4 mb-4 ${isPlayerPromoted ? 'bg-positive/10 border-positive' : 'bg-negative/10 border-negative'}`}>
          <p className={`text-xl font-bold ${isPlayerPromoted ? 'text-positive' : 'text-negative'}`}>
            {isPlayerPromoted ? 'PROMOTED!' : 'RELEGATED'}
          </p>
          <p className="text-text-secondary text-sm mt-1">
            {isPlayerPromoted
              ? `Your club moves up to ${leagues.find((l) => l.tier === club.tier - 1)?.name ?? 'the next division'}!`
              : `Your club drops to ${leagues.find((l) => l.tier === club.tier + 1)?.name ?? 'the lower division'}.`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
        <div className="bg-bg-surface border border-border rounded p-3 md:p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-2">Sporting Summary</h2>
          <p className="text-text-secondary">Division: {league.name}</p>
          <p className="text-text-secondary">Final Position: <span className="text-text-primary font-bold">{position}{getOrdinalSuffix(position)}</span></p>
          <p className="text-text-secondary">
            Objective: <span className="text-text-primary">{club.seasonObjective}</span>
            &nbsp;
            <span className={objectiveResult === 'passed' ? 'text-positive' : objectiveResult === 'failed' ? 'text-negative' : 'text-warning'}>
              ({objectiveResult === 'passed' ? 'PASSED' : objectiveResult === 'failed' ? 'FAILED' : 'NEUTRAL'})
            </span>
          </p>
        </div>

        <div className="bg-bg-surface border border-border rounded p-3 md:p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-2">Financial Summary</h2>
          <p className="text-text-secondary">Revenue: <span className="text-positive">${totalRevenue.toLocaleString()}</span></p>
          <p className="text-text-secondary">Expenses: <span className="text-negative">${totalExpenses.toLocaleString()}</span></p>
          <p className={`font-bold ${netProfit >= 0 ? 'text-positive' : 'text-negative'}`}>
            Net: {netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()}
          </p>
          <p className="text-text-secondary mt-1">Cash: ${fin.cash.toLocaleString()} | Debt: ${fin.debt.toLocaleString()}</p>
          <p className="text-text-secondary mt-1">PSR Loss: ${fin.rollingLoss3yr.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-bg-surface border border-border rounded p-3 md:p-4 mb-6">
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
      </div>

      <div className="bg-bg-surface border border-border rounded p-3 md:p-4 mb-6">
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

      {seasonComplete && (
        <button
          onClick={rolloverSeasonAction}
          className="px-6 py-3 bg-accent text-black font-semibold rounded hover:opacity-90 cursor-pointer"
        >
          Proceed to Season {season + 1}
        </button>
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
