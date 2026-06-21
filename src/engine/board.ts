import type { Club } from './types'

export function updateBoardConfidence(
  club: Club,
  leaguePosition: number,
  targetPosition: number
): number {
  let delta = 0

  const actualPos = leaguePosition
  const posDiff = targetPosition - actualPos

  // Performance relative to target
  if (posDiff > 0) {
    delta += posDiff * 3 // Overperforming
  } else if (posDiff < 0) {
    delta += posDiff * 2 // Underperforming
  }

  // Financial health
  if (club.finance.debt > club.finance.cash) {
    delta -= 5
  }
  if (club.finance.cash < 0) {
    delta -= 10
  }

  return Math.max(0, Math.min(100, club.boardConfidence + delta))
}

export function updateFanTrust(
  club: Club,
  recentResults: ('win' | 'draw' | 'loss')[],
  ticketPriceChange: number
): number {
  let delta = 0

  for (const result of recentResults) {
    if (result === 'win') delta += 5
    else if (result === 'draw') delta += 1
    else delta -= 3
  }

  // Ticket price sensitivity
  if (ticketPriceChange > 5) delta -= 10
  else if (ticketPriceChange > 0) delta -= 3
  else if (ticketPriceChange < -5) delta += 5
  else if (ticketPriceChange < 0) delta += 2

  return Math.max(0, Math.min(100, club.fanTrust + delta))
}

export function generateSeasonObjective(leaguePosition: number, leagueSize: number, tier: number): string {
  if (tier <= 2 && leaguePosition <= 3) return 'Promotion challenge'
  if (tier <= 2) return 'Top half finish'
  if (leaguePosition <= leagueSize * 0.25) return 'Promotion push'
  if (leaguePosition >= leagueSize * 0.75) return 'Avoid relegation'
  return 'Mid-table finish'
}

export function evaluateObjective(
  objective: string,
  finalPosition: number,
  leagueSize: number
): 'passed' | 'failed' | 'neutral' {
  switch (objective) {
    case 'Promotion challenge':
    case 'Promotion push':
      return finalPosition <= Math.max(1, Math.floor(leagueSize * 0.15)) ? 'passed' : 'failed'
    case 'Top half finish':
      return finalPosition <= Math.ceil(leagueSize / 2) ? 'passed' : 'failed'
    case 'Avoid relegation':
      return finalPosition <= leagueSize - 4 ? 'passed' : 'failed'
    case 'Mid-table finish':
    default:
      return finalPosition > leagueSize * 0.25 && finalPosition <= leagueSize * 0.75 ? 'passed' : 'neutral'
  }
}

export function checkNoConfidence(boardConfidence: number): boolean {
  return boardConfidence <= 0
}
