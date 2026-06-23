import type { Club, ClubData, League } from '../engine/types'
import { getRulesForTier } from '../engine/league'
import { generateSquad } from './playerGenerator'

import premierLeague from './clubs/premier-league.json'
import championship from './clubs/championship.json'
import leagueOne from './clubs/league-one.json'
import leagueTwo from './clubs/league-two.json'
import nationalLeague from './clubs/national-league.json'

const clubDataMap: Record<number, ClubData[]> = {
  1: premierLeague as ClubData[],
  2: championship as ClubData[],
  3: leagueOne as ClubData[],
  4: leagueTwo as ClubData[],
  5: nationalLeague as ClubData[],
}

export function createLeague(tier: number): League {
  const rules = getRulesForTier(tier)
  const clubsData = clubDataMap[tier]
  if (!clubsData) throw new Error(`Unknown tier: ${tier}`)

  const clubs: Club[] = clubsData.map((cd) => {
    const rivals = clubsData
      .filter((other) => other.shortName !== cd.shortName)
      .sort(() => Math.random() - 0.5)
      .slice(0, 1 + Math.floor(Math.random() * 2))
      .map((r) => r.shortName)

    return {
      id: `${cd.shortName}-${tier}`,
      name: cd.name,
      shortName: cd.shortName,
      city: cd.city,
      foundedYear: cd.foundedYear,
      reputation: cd.reputation,
      stadiumCapacity: cd.stadiumCapacity,
      tier,
      boardConfidence: tier === 5 ? 60 : 50 + Math.floor(Math.random() * 20),
      fanTrust: 50 + Math.floor(Math.random() * 20),
      seasonObjective: 'Mid-table finish',
      finance: {
        cash: tier === 1 ? 50000000 : tier === 2 ? 10000000 : tier === 3 ? 3000000 : tier === 4 ? 1500000 : 500000,
        debt: tier === 5 ? 1000000 : tier === 4 ? 3000000 : tier === 3 ? 5000000 : tier === 2 ? 15000000 : 0,
        interestRate: 0.05,
        revenueByCategory: { matchday: 0, tv: 0, commercial: 0, prizeMoney: 0, sales: 0 },
        expenseByCategory: { wages: 0, amortization: 0, agentFees: 0, upkeep: 0, interest: 0 },
        rollingLoss3yr: 0,
        rollingLossHistory: [],
        amortizationSchedule: [],
        transferBudget: 0,
        remainingTransferBudget: 0,
      },
      squad: generateSquad(cd),
      manager: null,
      sponsors: [],
      ticketPrices: { standard: tier === 1 ? 50 : tier === 2 ? 30 : tier === 3 ? 25 : tier === 4 ? 20 : 15, premium: 0 },
      stadiumExpansion: null,
      isPlayerClub: false,
      history: { seasonsManaged: 0, bestFinish: 999, bestTier: tier, promotions: 0, relegations: 0, trophies: [] },
      rivals,
    }
  })

  return {
    id: `league-${tier}`,
    tier,
    name: rules.name,
    rules,
    clubs,
    table: clubs.map((c) => ({
      clubId: c.id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    })),
    fixtures: [],
  }
}

export function createAllLeagues(): League[] {
  return [1, 2, 3, 4, 5].map(createLeague)
}
