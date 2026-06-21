import type { Fixture, League } from './types'

export function generateFixtures(league: League): Fixture[] {
  const clubIds = league.clubs.map((c) => c.id)
  const n = clubIds.length
  const fixtures: Fixture[] = []

  if (n % 2 !== 0) clubIds.push('BYE')

  const rounds = clubIds.length - 1
  const matchesPerRound = clubIds.length / 2

  const ids = [...clubIds]

  for (let round = 0; round < rounds; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const home = ids[match]
      const away = ids[ids.length - 1 - match]
      if (home !== 'BYE' && away !== 'BYE') {
        fixtures.push({ week: round * 2 + 1, homeId: home, awayId: away })
        fixtures.push({ week: round * 2 + 2, homeId: away, awayId: home })
      }
    }
    ids.splice(1, 0, ids.pop()!)
  }

  return fixtures
}
