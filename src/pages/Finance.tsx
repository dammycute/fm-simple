import { useState } from 'react'
import { useGameStore, getPlayerClub } from '../state/gameStore'
import {
  wageToRevenueRatio,
  wageHealthColor,
  checkPSR,
  calculateAttendance,
  calculateMatchdayRevenue,
} from '../engine/finance'
import { getSponsorshipSummary, createExpansionProject } from '../engine/stadium'

export default function Finance() {
  const playerClubId = useGameStore((s) => s.playerClubId)
  const leagues = useGameStore((s) => s.leagues)
  const setTicketPrices = useGameStore((s) => s.setTicketPrices)
  const startStadiumExpansion = useGameStore((s) => s.startStadiumExpansion)
  const generateSponsors = useGameStore((s) => s.generateSponsors)

  const [newTicketPrice, setNewTicketPrice] = useState(0)
  const [expansionCapacity, setExpansionCapacity] = useState(1000)
  const [showExpansion, setShowExpansion] = useState(false)

  if (!playerClubId) return <h1 className="text-2xl font-bold text-text-primary">No game in progress</h1>

  const club = getPlayerClub({ leagues, playerClubId } as any)
  if (!club) return <p className="text-negative">Club not found</p>

  const fin = club.finance
  const totalRevenue = Object.values(fin.revenueByCategory).reduce((a, b) => a + b, 0)
  const totalExpenses = Object.values(fin.expenseByCategory).reduce((a, b) => a + b, 0)
  const netProfit = totalRevenue - totalExpenses
  const totalWages = club.squad.reduce((s, p) => s + p.wage, 0) + (club.manager?.wageDemand ?? 0)
  const wtr = wageToRevenueRatio(totalWages, totalRevenue || 1)
  const wtrStatus = wageHealthColor(wtr)
  const psr = checkPSR(fin.rollingLoss3yr, club.tier)

  const attendance = calculateAttendance(club.stadiumCapacity, club.fanTrust, club.ticketPrices.standard, 30, 0.5)
  const matchdayRev = calculateMatchdayRevenue(attendance, club.ticketPrices.standard)

  const sponsorTotal = getSponsorshipSummary(club.sponsors)

  const expansionPreview = expansionCapacity > 0 ? createExpansionProject(expansionCapacity) : null

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-4">Finance Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        <div className="bg-bg-surface border border-border rounded p-4">
          <p className="text-text-secondary text-sm">Cash</p>
          <p className="text-xl font-bold text-text-primary">${fin.cash.toLocaleString()}</p>
        </div>
        <div className="bg-bg-surface border border-border rounded p-4">
          <p className="text-text-secondary text-sm">Debt</p>
          <p className={`text-xl font-bold ${fin.debt > 0 ? 'text-negative' : 'text-positive'}`}>${fin.debt.toLocaleString()}</p>
        </div>
        <div className="bg-bg-surface border border-border rounded p-4">
          <p className="text-text-secondary text-sm">Net Profit/Loss (YTD)</p>
          <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-positive' : 'text-negative'}`}>
            {netProfit >= 0 ? '+' : ''}${(netProfit / 1000).toFixed(1)}k
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
        <div className="bg-bg-surface border border-border rounded p-3 md:p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-3">Revenue (YTD)</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-text-secondary">Matchday</span><span className="text-positive">${fin.revenueByCategory.matchday.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">TV</span><span className="text-positive">${fin.revenueByCategory.tv.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Commercial</span><span className="text-positive">${fin.revenueByCategory.commercial.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Prize Money</span><span className="text-positive">${fin.revenueByCategory.prizeMoney.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Sales</span><span className="text-positive">${fin.revenueByCategory.sales.toLocaleString()}</span></div>
            <div className="flex justify-between font-bold border-t border-border pt-2">
              <span className="text-text-primary">Total</span><span className="text-positive">${totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="bg-bg-surface border border-border rounded p-3 md:p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-3">Expenses (YTD)</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-text-secondary">Wages</span><span className="text-negative">${fin.expenseByCategory.wages.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Amortization</span><span className="text-negative">${fin.expenseByCategory.amortization.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Agent Fees</span><span className="text-negative">${fin.expenseByCategory.agentFees.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Upkeep</span><span className="text-negative">${fin.expenseByCategory.upkeep.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-text-secondary">Interest</span><span className="text-negative">${fin.expenseByCategory.interest.toLocaleString()}</span></div>
            <div className="flex justify-between font-bold border-t border-border pt-2">
              <span className="text-text-primary">Total</span><span className="text-negative">${totalExpenses.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
        <div className="bg-bg-surface border border-border rounded p-3 md:p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-3">Wage-to-Revenue</h2>
          <p className={`text-2xl font-bold ${wtrStatus === 'healthy' ? 'text-positive' : wtrStatus === 'risky' ? 'text-warning' : 'text-negative'}`}>
            {(wtr * 100).toFixed(1)}%
          </p>
          <p className="text-text-secondary text-sm">{wtrStatus === 'healthy' ? 'Healthy' : wtrStatus === 'risky' ? 'Risky' : 'Danger Zone'}</p>
        </div>
        <div className="bg-bg-surface border border-border rounded p-3 md:p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-3">PSR / FFP Compliance</h2>
          <p className={`text-xl font-bold ${psr.compliant ? 'text-positive' : 'text-negative'}`}>
            {psr.compliant ? 'Compliant' : 'BREACHED'}
          </p>
          <p className="text-text-secondary text-sm">Loss: ${fin.rollingLoss3yr.toLocaleString()} / Limit: ${psr.limit.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
        <div className="bg-bg-surface border border-border rounded p-3 md:p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-3">Ticket Pricing</h2>
          <p className="text-text-primary text-xl font-bold">${club.ticketPrices.standard}</p>
          <p className="text-text-secondary text-sm">Est. Attendance: {attendance.toLocaleString()} | Est. Matchday Rev: ${matchdayRev.toLocaleString()}</p>
          <div className="flex gap-2 mt-3">
            <input
              type="number"
              value={newTicketPrice || club.ticketPrices.standard}
              onChange={(e) => setNewTicketPrice(Number(e.target.value))}
              className="w-24 bg-bg-base border border-border rounded px-2 py-1 text-sm text-text-primary"
            />
            <button
              onClick={() => { setTicketPrices(newTicketPrice); setNewTicketPrice(0) }}
              className="px-3 py-1 bg-accent text-black text-sm font-semibold rounded cursor-pointer"
            >
              Set Price
            </button>
          </div>
        </div>

        <div className="bg-bg-surface border border-border rounded p-3 md:p-4">
          <h2 className="text-lg font-semibold text-text-primary mb-3">Sponsorships</h2>
          {club.sponsors.length === 0 ? (
            <div>
              <p className="text-text-secondary text-sm mb-2">No sponsors yet.</p>
              <button onClick={generateSponsors} className="px-3 py-1 bg-accent text-black text-sm font-semibold rounded cursor-pointer">
                Generate Sponsors
              </button>
            </div>
          ) : (
            <div className="space-y-1 text-sm">
              {club.sponsors.map((s, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-text-secondary">{s.partnerName} ({s.type})</span>
                  <span className="text-positive">${s.annualValue.toLocaleString()}/yr</span>
                </div>
              ))}
              <div className="flex justify-between font-bold border-t border-border pt-1 mt-1">
                <span className="text-text-primary">Total</span>
                <span className="text-positive">${sponsorTotal.toLocaleString()}/yr</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-bg-surface border border-border rounded p-4 mb-6">
        <h2 className="text-lg font-semibold text-text-primary mb-3">Stadium</h2>
        <p className="text-text-primary">Capacity: {club.stadiumCapacity.toLocaleString()}</p>

        {club.stadiumExpansion ? (
          <div className="mt-2">
            <p className="text-warning text-sm">
              Expansion in progress: {club.stadiumExpansion.weeksRemaining}/{club.stadiumExpansion.totalWeeks} weeks remaining
              (cost so far: ${club.stadiumExpansion.cost.toLocaleString()})
            </p>
          </div>
        ) : (
          <div className="mt-3">
            {!showExpansion ? (
              <button onClick={() => setShowExpansion(true)} className="px-3 py-1 bg-accent text-black text-sm font-semibold rounded cursor-pointer">
                Start Expansion
              </button>
            ) : (
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={expansionCapacity}
                  onChange={(e) => setExpansionCapacity(Math.max(100, Number(e.target.value)))}
                  className="w-24 bg-bg-base border border-border rounded px-2 py-1 text-sm text-text-primary"
                />
                <span className="text-text-secondary text-sm">seats</span>
                {expansionPreview && (
                  <span className="text-text-secondary text-sm">
                    Cost: ${expansionPreview.cost.toLocaleString()} · {expansionPreview.totalWeeks} weeks
                    · Est. payback: {expansionPreview.cost > 0 ? Math.round(expansionPreview.cost / Math.max(1, expansionPreview.additionalCapacity * attendance / club.stadiumCapacity * club.ticketPrices.standard * 0.85)) : 0} weeks
                  </span>
                )}
                <button
                  onClick={() => { startStadiumExpansion(expansionCapacity); setShowExpansion(false) }}
                  className="px-3 py-1 bg-accent text-black text-sm font-semibold rounded cursor-pointer"
                >
                  Confirm
                </button>
                <button onClick={() => setShowExpansion(false)} className="px-2 py-1 bg-border rounded text-sm cursor-pointer">Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
