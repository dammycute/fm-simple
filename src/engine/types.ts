export interface ClubData {
  name: string
  shortName: string
  city: string
  foundedYear: number
  reputation: number
  stadiumCapacity: number
}

export interface Player {
  id: string
  name: string
  age: number
  position: 'GK' | 'DEF' | 'MID' | 'FWD'
  ability: number
  potential: number
  wage: number
  contractYears: number
  transferFee: number
  bookValue: number
  morale: number
  injuryWeeksLeft: number
  transferListed: boolean
}

export interface Manager {
  id: string
  name: string
  tacticalSkill: number
  transferSkill: number
  manManagement: number
  ambition: number
  patience: number
  wageDemand: number
  contractYears: number
  philosophy: 'attacking' | 'balanced' | 'defensive'
}

export interface AmortEntry {
  playerId: string
  totalFee: number
  annualAmount: number
  yearsRemaining: number
}

export interface ClubHistory {
  seasonsManaged: number
  bestFinish: number
  bestTier: number
  promotions: number
  relegations: number
  trophies: string[]
}

export interface SponsorDeal {
  type: string
  partnerName: string
  annualValue: number
  yearsRemaining: number
  bonusClauses: { condition: string; value: number }[]
}

export interface StadiumExpansion {
  cost: number
  additionalCapacity: number
  weeksRemaining: number
  totalWeeks: number
  costOverrunRisk: number
}

export interface FinanceLedger {
  cash: number
  debt: number
  interestRate: number
  revenueByCategory: { matchday: number; tv: number; commercial: number; prizeMoney: number; sales: number }
  expenseByCategory: { wages: number; amortization: number; agentFees: number; upkeep: number; interest: number }
  rollingLoss3yr: number
  rollingLossHistory: number[]
  amortizationSchedule: AmortEntry[]
  transferBudget: number
  remainingTransferBudget: number
}

export interface Club {
  id: string
  name: string
  shortName: string
  city: string
  foundedYear: number
  reputation: number
  stadiumCapacity: number
  tier: number
  boardConfidence: number
  fanTrust: number
  seasonObjective: string
  finance: FinanceLedger
  squad: Player[]
  manager: Manager | null
  sponsors: SponsorDeal[]
  ticketPrices: { standard: number; premium: number }
  stadiumExpansion: StadiumExpansion | null
  isPlayerClub: boolean
  history: ClubHistory
  rivals: string[]
}

export interface DivisionRules {
  tier: number
  name: string
  clubCount: number
  autoPromoteSpots: number
  playoffSpots: number
  relegationSpots: number
}

export interface TableRow {
  clubId: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export interface Fixture {
  week: number
  homeId: string
  awayId: string
  result?: { homeGoals: number; awayGoals: number; events: MatchEvent[] }
}

export interface MatchEvent {
  minute: number
  type: 'goal' | 'card' | 'injury'
  clubId: string
  playerName: string
  description: string
}

export interface League {
  id: string
  tier: number
  name: string
  rules: DivisionRules
  clubs: Club[]
  table: TableRow[]
  fixtures: Fixture[]
}

export interface GameEvent {
  id: string
  week: number
  type: string
  description: string
  choices: { label: string; effects: Record<string, number> }[]
}
