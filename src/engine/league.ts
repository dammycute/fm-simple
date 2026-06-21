import type { DivisionRules, League, Fixture } from './types'
import { simulateMatch } from './matchSim'

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
