import type { SponsorDeal, StadiumExpansion } from './types'

// ── Stadium Expansion ───────────────────────────────────────────────

export function createExpansionProject(
  additionalCapacity: number,
  costPerSeat: number = 2000
): StadiumExpansion {
  const cost = additionalCapacity * costPerSeat
  const weeks = Math.max(4, Math.round(additionalCapacity / 500))
  return {
    cost,
    additionalCapacity,
    weeksRemaining: weeks,
    totalWeeks: weeks,
    costOverrunRisk: 0.2,
  }
}

export function processExpansionWeek(project: StadiumExpansion): {
  project: StadiumExpansion
  overrunAmount?: number
  completed: boolean
} {
  let proj = { ...project }
  let overrunAmount: number | undefined
  let completed = false

  proj.weeksRemaining--

  if (Math.random() < proj.costOverrunRisk) {
    overrunAmount = Math.round(proj.cost * 0.1 * Math.random())
    proj.cost += overrunAmount
  }

  if (proj.weeksRemaining <= 0) {
    completed = true
  }

  return { project: proj, overrunAmount, completed }
}

// ── Sponsors ────────────────────────────────────────────────────────

const sponsorNames = [
  'Fly Emirates', 'Etihad Airways', 'Standard Chartered', 'Chevrolet', 'Qatar Airways',
  'Bet365', 'DraftKings', 'Coca-Cola', 'Pepsi', 'Nike', 'Adidas', 'Puma',
  'Honda', 'Samsung', 'Sony', 'SAP', 'Oracle', 'Expedia', 'Booking.com', 'Uber',
  'LocalTech Solutions', 'RegionalBank', 'CityBrewery', 'AutoMart',
]

// (sponsor types used inline via the types array in gameStore)

export function generateSponsorDeal(clubReputation: number, type: string): SponsorDeal {
  const repScale = Math.max(0.1, clubReputation / 100)
  const baseValue = type === 'shirt' ? 200000 : type === 'stadiumNaming' ? 150000 : type === 'kitSupplier' ? 100000 : 50000

  return {
    type,
    partnerName: sponsorNames[Math.floor(Math.random() * sponsorNames.length)],
    annualValue: Math.round(baseValue * repScale * (0.8 + Math.random() * 0.4)),
    yearsRemaining: 1 + Math.floor(Math.random() * 3),
    bonusClauses: [
      { condition: 'top-half finish', value: Math.round(baseValue * repScale * 0.2) },
    ],
  }
}

export function getSponsorshipSummary(sponsors: SponsorDeal[]): number {
  return sponsors.reduce((s, d) => s + d.annualValue, 0)
}
