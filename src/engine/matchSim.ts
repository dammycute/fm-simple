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

function getBestXI(club: Club): number {
  const sorted = [...club.squad].sort((a, b) => b.ability - a.ability)
  const best11 = sorted.slice(0, 11)
  if (best11.length === 0) return 40
  return best11.reduce((s, p) => s + p.ability, 0) / best11.length
}

function getManagerMod(manager: Club['manager']): number {
  if (!manager) return 0.95
  return 0.9 + (manager.tacticalSkill / 100) * 0.25
}

function getMoraleMod(squad: Club['squad']): number {
  if (squad.length === 0) return 0.95
  const avgMorale = squad.reduce((s, p) => s + p.morale, 0) / squad.length
  return 0.9 + (avgMorale / 100) * 0.2
}

export function simulateMatch(fixture: Fixture, homeClub: Club, awayClub: Club): Required<Fixture>['result'] {
  const homeAbility = getBestXI(homeClub)
  const awayAbility = getBestXI(awayClub)

  const homeManagerMod = getManagerMod(homeClub.manager)
  const awayManagerMod = getManagerMod(awayClub.manager)
  const homeMoraleMod = getMoraleMod(homeClub.squad)
  const awayMoraleMod = getMoraleMod(awayClub.squad)

  const homeAdvantage = 1.1

  const homeStrength = homeAbility * homeManagerMod * homeMoraleMod * homeAdvantage
  const awayStrength = awayAbility * awayManagerMod * awayMoraleMod

  const baseXg = 1.35
  const expectedHome = clamp(baseXg * (homeStrength / Math.max(0.01, homeStrength + awayStrength)) * 2, 0, 4)
  const expectedAway = clamp(baseXg * (awayStrength / Math.max(0.01, homeStrength + awayStrength)) * 2, 0, 4)

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
