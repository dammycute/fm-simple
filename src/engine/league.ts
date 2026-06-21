import type { DivisionRules, League, Fixture, Club } from './types'
import { simulateMatch } from './matchSim'
import { generateFixtures } from './fixtures'

export const DIVISION_RULES: DivisionRules[] = [
  { tier: 1, name: 'Premier League', clubCount: 20, autoPromoteSpots: 0, playoffSpots: 0, relegationSpots: 3 },
  { tier: 2, name: 'Championship', clubCount: 24, autoPromoteSpots: 2, playoffSpots: 6, relegationSpots: 3 },
  { tier: 3, name: 'League One', clubCount: 24, autoPromoteSpots: 2, playoffSpots: 4, relegationSpots: 4 },
  { tier: 4, name: 'League Two', clubCount: 24, autoPromoteSpots: 3, playoffSpots: 4, relegationSpots: 2 },
  { tier: 5, name: 'National League', clubCount: 24, autoPromoteSpots: 1, playoffSpots: 6, relegationSpots: 4 },
]

export function getRulesForTier(tier: number): DivisionRules {
  return DIVISION_RULES.find((r) => r.tier === tier)!
}

export function updateTable(table: League['table'], fixture: Fixture): League['table'] {
  const { homeGoals, awayGoals } = fixture.result!
  const homeRow = table.find((r) => r.clubId === fixture.homeId)
  const awayRow = table.find((r) => r.clubId === fixture.awayId)

  if (!homeRow || !awayRow) return table

  homeRow.played++
  awayRow.played++
  homeRow.goalsFor += homeGoals
  homeRow.goalsAgainst += awayGoals
  awayRow.goalsFor += awayGoals
  awayRow.goalsAgainst += homeGoals

  if (homeGoals > awayGoals) {
    homeRow.won++
    homeRow.points += 3
    awayRow.lost++
  } else if (homeGoals < awayGoals) {
    awayRow.won++
    awayRow.points += 3
    homeRow.lost++
  } else {
    homeRow.drawn++
    awayRow.drawn++
    homeRow.points++
    awayRow.points++
  }

  return table
}

function getSortedTable(league: League) {
  return [...league.table].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const gdA = a.goalsFor - a.goalsAgainst
    const gdB = b.goalsFor - b.goalsAgainst
    if (gdB !== gdA) return gdB - gdA
    return b.goalsFor - a.goalsFor
  })
}

export function isSeasonComplete(leagues: League[]): boolean {
  return leagues.every((l) => l.fixtures.length > 0 && l.fixtures.every((f) => f.result !== undefined))
}

export function computePromotionsRelegations(leagues: League[]): { promotions: { clubId: string; fromTier: number; toTier: number }[]; relegations: { clubId: string; fromTier: number; toTier: number }[] } {
  const promotions: { clubId: string; fromTier: number; toTier: number }[] = []
  const relegations: { clubId: string; fromTier: number; toTier: number }[] = []

  for (const league of leagues) {
    const sorted = getSortedTable(league)
    const rules = league.rules

    for (let i = 0; i < rules.autoPromoteSpots; i++) {
      const clubId = sorted[i]?.clubId
      if (clubId && league.tier > 1) {
        promotions.push({ clubId, fromTier: league.tier, toTier: league.tier - 1 })
      }
    }

    const playoffStart = rules.autoPromoteSpots
    const playoffEnd = playoffStart + rules.playoffSpots
    const playoffClubs = sorted.slice(playoffStart, playoffEnd).map((r) => r.clubId).filter(Boolean)

    if (playoffClubs.length >= 2 && rules.playoffSpots > 0 && league.tier > 1) {
      let remaining = [...playoffClubs]
      while (remaining.length > 1) {
        const nextRound: string[] = []
        for (let i = 0; i < remaining.length; i += 2) {
          if (i + 1 < remaining.length) {
            const home = remaining[i]
            const away = remaining[i + 1]
            const homeClub = league.clubs.find((c) => c.id === home)
            const awayClub = league.clubs.find((c) => c.id === away)
            if (homeClub && awayClub) {
              const result = simulateMatch({ week: 0, homeId: home, awayId: away }, homeClub, awayClub)
              const winner = result.homeGoals >= result.awayGoals ? home : away
              nextRound.push(winner)
            } else {
              nextRound.push(home)
            }
          } else {
            nextRound.push(remaining[i])
          }
        }
        remaining = nextRound
      }
      const playoffWinner = remaining[0]
      if (playoffWinner) {
        promotions.push({ clubId: playoffWinner, fromTier: league.tier, toTier: league.tier - 1 })
      }
    }

    const relegationStart = sorted.length - rules.relegationSpots
    for (let i = relegationStart; i < sorted.length; i++) {
      const clubId = sorted[i]?.clubId
      if (clubId && league.tier < 5) {
        relegations.push({ clubId, fromTier: league.tier, toTier: league.tier + 1 })
      }
    }
  }

  return { promotions, relegations }
}

export function applyPromotionsRelegations(leagues: League[], promotions: { clubId: string; fromTier: number; toTier: number }[], relegations: { clubId: string; fromTier: number; toTier: number }[]): League[] {
  const clubMap = new Map<string, Club>()
  for (const league of leagues) {
    for (const club of league.clubs) {
      clubMap.set(club.id, { ...club })
    }
  }

  for (const p of promotions) {
    const club = clubMap.get(p.clubId)
    if (club) club.tier = p.toTier
  }
  for (const r of relegations) {
    const club = clubMap.get(r.clubId)
    if (club) club.tier = r.toTier
  }

  return [1, 2, 3, 4, 5].map((tier) => {
    const oldLeague = leagues.find((l) => l.tier === tier)!
    const rules = oldLeague.rules
    const tierClubs = Array.from(clubMap.values()).filter((c) => c.tier === tier)

    const newLeague: League = {
      id: `league-${tier}`,
      tier,
      name: rules.name,
      rules,
      clubs: tierClubs,
      table: tierClubs.map((c) => ({
        clubId: c.id,
        played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, points: 0,
      })),
      fixtures: [],
    }
    newLeague.fixtures = generateFixtures(newLeague)
    return newLeague
  })
}

export function rolloverSeason(leagues: League[], currentSeason: number): { leagues: League[]; newSeason: number; promotions: { clubId: string; fromTier: number; toTier: number }[]; relegations: { clubId: string; fromTier: number; toTier: number }[] } {
  const { promotions, relegations } = computePromotionsRelegations(leagues)
  const newLeagues = applyPromotionsRelegations(leagues, promotions, relegations)

  // Update rolling loss history for all clubs
  const allClubs = newLeagues.flatMap((l) => l.clubs)
  for (const club of allClubs) {
    const fin = club.finance
    const totalProfit = Object.values(fin.revenueByCategory).reduce((a, b) => a + b, 0) -
      Object.values(fin.expenseByCategory).reduce((a, b) => a + b, 0)

    const history = [...(fin.rollingLossHistory || []), totalProfit]
    if (history.length > 3) history.shift()

    const newRollingLoss = history.reduce((s, v) => s + v, 0)

    club.finance = {
      ...fin,
      rollingLossHistory: history,
      rollingLoss3yr: Math.max(0, newRollingLoss),
      revenueByCategory: { matchday: 0, tv: 0, commercial: 0, prizeMoney: 0, sales: 0 },
      expenseByCategory: { wages: 0, amortization: 0, agentFees: 0, upkeep: 0, interest: 0 },
    }
  }

  return { leagues: newLeagues, newSeason: currentSeason + 1, promotions, relegations }
}

export function simulateWeek(leagues: League[], weekNumber: number): League[] {
  return leagues.map((league) => {
    const weekFixtures = league.fixtures.filter((f) => f.week === weekNumber && !f.result)

    if (weekFixtures.length === 0) return league

    const clubMap = new Map(league.clubs.map((c) => [c.id, c]))

    for (const fixture of weekFixtures) {
      const home = clubMap.get(fixture.homeId)
      const away = clubMap.get(fixture.awayId)
      if (!home || !away) continue

      fixture.result = simulateMatch(fixture, home, away)
      updateTable(league.table, fixture)
    }

    return { ...league, table: [...league.table], fixtures: [...league.fixtures] }
  })
}
