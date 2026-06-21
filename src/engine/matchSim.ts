import type { Fixture, Club, MatchEvent } from './types'

function poissonSample(lambda: number): number {
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1
  do {
    k++
    p *= Math.random()
  } while (p > L)
  return k - 1
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

const firstNames = ['James', 'Oliver', 'Harry', 'Jack', 'George', 'Tom', 'Ryan', 'Dan', 'Sam', 'Ben']
const lastNames = ['Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Wilson', 'Evans', 'Thomas', 'Roberts', 'Cook']

function randomPlayerName(club: Club): string {
  if (club.squad.length > 0) {
    return club.squad[Math.floor(Math.random() * club.squad.length)].name
  }
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
}

export function simulateMatch(fixture: Fixture, homeClub: Club, awayClub: Club): Required<Fixture>['result'] {
  const homeAbility = homeClub.squad.reduce((s, p) => s + p.ability, 0) / Math.max(1, homeClub.squad.length)
  const awayAbility = awayClub.squad.reduce((s, p) => s + p.ability, 0) / Math.max(1, awayClub.squad.length)

  const managerMod = 1.0
  const moraleMod = 1.0
  const homeAdvantage = 1.1

  const homeStrength = homeAbility * managerMod * moraleMod * homeAdvantage
  const awayStrength = awayAbility * managerMod * moraleMod

  const baseXg = 2.5
  const expectedHome = clamp(baseXg * (homeStrength / Math.max(0.01, homeStrength + awayStrength)) * 2, 0, 6)
  const expectedAway = clamp(baseXg * (awayStrength / Math.max(0.01, homeStrength + awayStrength)) * 2, 0, 6)

  const homeGoals = poissonSample(expectedHome)
  const awayGoals = poissonSample(expectedAway)

  const events: MatchEvent[] = []
  const totalGoals = homeGoals + awayGoals

  for (let g = 0; g < totalGoals; g++) {
    const minute = 1 + Math.floor(Math.random() * 90)
    const isHome = g < homeGoals
    const clubId = isHome ? homeClub.id : awayClub.id
    const scorer = randomPlayerName(isHome ? homeClub : awayClub)
    events.push({
      minute,
      type: 'goal',
      clubId,
      playerName: scorer,
      description: `${scorer} scores! (${minute}')`,
    })
  }

  events.sort((a, b) => a.minute - b.minute)

  if (Math.random() < 0.15) {
    const minute = 1 + Math.floor(Math.random() * 90)
    const player = randomPlayerName(Math.random() < 0.5 ? homeClub : awayClub)
    events.push({
      minute,
      type: 'card',
      clubId: Math.random() < 0.5 ? homeClub.id : awayClub.id,
      playerName: player,
      description: `${player} receives a yellow card (${minute}')`,
    })
  }

  if (Math.random() < 0.08) {
    const minute = 1 + Math.floor(Math.random() * 90)
    const player = randomPlayerName(Math.random() < 0.5 ? homeClub : awayClub)
    events.push({
      minute,
      type: 'injury',
      clubId: Math.random() < 0.5 ? homeClub.id : awayClub.id,
      playerName: player,
      description: `${player} is injured and subbed off (${minute}')`,
    })
  }

  events.sort((a, b) => a.minute - b.minute)

  return { homeGoals, awayGoals, events }
}
