import type { Club, AmortEntry } from './types'

// ── Config ──────────────────────────────────────────────────────────

export const TV_POOLS: Record<number, { basePool: number; perPosition: number }> = {
  1: { basePool: 30_000_000, perPosition: 1_000_000 },
  2: { basePool: 6_000_000, perPosition: 200_000 },
  3: { basePool: 1_500_000, perPosition: 50_000 },
  4: { basePool: 750_000, perPosition: 25_000 },
  5: { basePool: 300_000, perPosition: 10_000 },
}

export const PSR_LIMITS: Record<number, number> = {
  1: 105_000_000,
  2: 39_000_000,
  3: 18_000_000,
  4: 10_000_000,
  5: 5_000_000,
}

export const CONCESSIONS_PER_HEAD = 5

// ── Attendance ──────────────────────────────────────────────────────

export function calculateAttendance(
  capacity: number,
  fanTrust: number,
  ticketPrice: number,
  fairPrice: number,
  formFactor: number
): number {
  const pricePenalty = Math.max(0, (ticketPrice - fairPrice) / fairPrice) * 0.3
  const demandFactor = Math.max(0.25, Math.min(1.0,
    0.35 + (fanTrust / 100) * 0.4 + formFactor * 0.2 - pricePenalty
  ))
  return Math.round(capacity * demandFactor)
}

export function calculateMatchdayRevenue(
  attendance: number,
  ticketPrice: number
): number {
  return Math.round(attendance * ticketPrice * 0.85 + attendance * CONCESSIONS_PER_HEAD)
}

// ── TV Revenue ──────────────────────────────────────────────────────

export function calculateTVRevenue(tier: number, positionFromBottom: number): number {
  const pool = TV_POOLS[tier]
  if (!pool) return 0
  return pool.basePool + positionFromBottom * pool.perPosition
}

// ── Amortization ────────────────────────────────────────────────────

export function createAmortEntry(
  playerId: string,
  transferFee: number,
  contractLengthYears: number
): AmortEntry {
  const annualAmount = transferFee / contractLengthYears
  return {
    playerId,
    totalFee: transferFee,
    annualAmount,
    yearsRemaining: contractLengthYears,
  }
}

export function calculateBookValue(
  transferFee: number,
  contractLengthYears: number,
  yearsElapsed: number
): number {
  const annualAmort = transferFee / contractLengthYears
  return Math.round(transferFee - annualAmort * yearsElapsed)
}

export function calculateProfitOnSale(
  saleFee: number,
  currentBookValue: number
): number {
  return saleFee - currentBookValue
}

// ── PSR ──────────────────────────────────────────────────────────────

export function checkPSR(
  rollingLoss3yr: number,
  tier: number
): { compliant: boolean; overspend: number; limit: number } {
  const limit = PSR_LIMITS[tier] ?? 5_000_000
  const overspend = Math.max(0, rollingLoss3yr - limit)
  return {
    compliant: overspend <= 0,
    overspend,
    limit,
  }
}

// ── Wage-to-Revenue ─────────────────────────────────────────────────

export function wageToRevenueRatio(
  totalWages: number,
  totalRevenue: number
): number {
  if (totalRevenue <= 0) return totalWages > 0 ? 1 : 0
  return totalWages / totalRevenue
}

export function wageHealthColor(ratio: number): 'healthy' | 'risky' | 'danger' {
  if (ratio < 0.6) return 'healthy'
  if (ratio <= 0.8) return 'risky'
  return 'danger'
}

// ── Weekly Finance Update ───────────────────────────────────────────

export function processWeeklyFinances(
  club: Club,
  _week: number,
  totalWeeksInSeason: number,
  positionFromBottom: number,
  formFactor: number
): Club {
  const finance = { ...club.finance }
  const revenue = { ...finance.revenueByCategory }
  const expenses = { ...finance.expenseByCategory }

  // Matchday revenue
  const attendance = calculateAttendance(
    club.stadiumCapacity,
    club.fanTrust,
    club.ticketPrices.standard,
    club.tier === 1 ? 50 : club.tier === 2 ? 30 : club.tier === 3 ? 25 : club.tier === 4 ? 20 : 15,
    formFactor
  )
  const matchdayRev = calculateMatchdayRevenue(attendance, club.ticketPrices.standard)
  revenue.matchday += matchdayRev

  // TV revenue spread across season weeks
  const tvRevenue = calculateTVRevenue(club.tier, positionFromBottom)
  const weeklyTV = Math.round(tvRevenue / totalWeeksInSeason)
  revenue.tv += weeklyTV

  // Commercial revenue (placeholder - will be driven by sponsorship deals)
  const weeklyCommercial = Math.round((club.sponsors?.reduce((s, d) => s + d.annualValue, 0) ?? 0) / totalWeeksInSeason)
  revenue.commercial += weeklyCommercial

  // Wage expense (Player.wage is weekly, sum is the weekly bill)
  const weeklyWages = club.squad.reduce((s, p) => s + p.wage, 0) + (club.manager?.wageDemand ?? 0)
  expenses.wages += weeklyWages

  // Amortization expense
  const amortEntries = finance.amortizationSchedule ?? []
  const yearlyAmort = amortEntries.reduce((s, e) => s + e.annualAmount, 0)
  const weeklyAmort = Math.round(yearlyAmort / totalWeeksInSeason)
  expenses.amortization += weeklyAmort

  // Debt interest
  let weeklyInterest = 0
  if (finance.debt > 0) {
    const yearlyInterest = Math.round(finance.debt * finance.interestRate)
    weeklyInterest = Math.round(yearlyInterest / totalWeeksInSeason)
    expenses.interest += weeklyInterest
  }

  // Upkeep
  const weeklyUpkeep = Math.round(club.stadiumCapacity * 0.5 / totalWeeksInSeason)
  expenses.upkeep += weeklyUpkeep

  const weeklyProfit = weeklyTV + weeklyCommercial + matchdayRev - weeklyWages - weeklyAmort - weeklyInterest - weeklyUpkeep

  finance.cash += weeklyProfit
  finance.revenueByCategory = revenue
  finance.expenseByCategory = expenses

  return { ...club, finance }
}
