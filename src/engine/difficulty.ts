import type { Club, League, Player, Manager } from './types'

export interface ScenarioPreset {
  name: string
  description: string
  cash: number
  debt: number
  boardConfidence: number
  fanTrust: number
  stadiumCapacity: number
  squadAbilityBoost: number
  managerSkillBoost: number
}

export const SCENARIOS: Record<string, ScenarioPreset> = {
  stable: {
    name: 'Stable Non-League Side',
    description: 'Solvent, decent fanbase, patient board, mid-table. Learn the systems while chasing promotion.',
    cash: 1_000_000,
    debt: 500_000,
    boardConfidence: 65,
    fanTrust: 60,
    stadiumCapacity: 8000,
    squadAbilityBoost: 0,
    managerSkillBoost: 0,
  },
  yoYo: {
    name: 'Yo-Yo Club',
    description: 'Recently dropped from League Two, fans expect an immediate bounce back, thin squad.',
    cash: 500_000,
    debt: 2_000_000,
    boardConfidence: 45,
    fanTrust: 70,
    stadiumCapacity: 12000,
    squadAbilityBoost: 5,
    managerSkillBoost: 5,
  },
  crisis: {
    name: 'Crisis Club',
    description: 'In debt, relegation form, impatient board, smallest stadium. Financial triage from turn one.',
    cash: 100_000,
    debt: 3_000_000,
    boardConfidence: 25,
    fanTrust: 30,
    stadiumCapacity: 5000,
    squadAbilityBoost: -5,
    managerSkillBoost: -5,
  },
}

export function checkGameOverConditions(
  playerClub: Club,
  playerLeague: League,
  boardConfidence: number
): { gameOver: boolean; reason: string | null } {
  // No-confidence
  if (boardConfidence <= 0) {
    return { gameOver: true, reason: 'The board has passed a vote of no confidence. You have been removed as chairman.' }
  }

  // Insolvency
  if (playerClub.finance.cash <= -10_000_000) {
    return { gameOver: true, reason: 'The club is insolvent. Administration and liquidation are unavoidable.' }
  }

  // Relegation out of bottom tier (tier 5)
  if (playerClub.tier >= 5) {
    const table = playerLeague.table
    const sorted = [...table].sort((a, b) => a.points - b.points)
    const relegationZone = sorted.slice(0, playerLeague.rules.relegationSpots)
    const isRelegated = relegationZone.some((r) => r.clubId === playerClub.id)

    if (isRelegated && playerClub.tier >= 5) {
      return { gameOver: true, reason: `Relegated from the ${playerLeague.name}. Your football journey ends here.` }
    }
  }

  return { gameOver: false, reason: null }
}

export function checkMilestones(
  playerClub: Club,
  playerLeague: League,
  season: number
): string[] {
  const milestones: string[] = []

  // Promotion to top tier
  if (playerClub.tier === 1) {
    milestones.push('🏆 Reached the Premier League! A monumental achievement.')
  }

  // Financial self-sufficiency
  if (playerClub.finance.debt <= 0 && playerClub.finance.cash > 0 && playerClub.finance.rollingLoss3yr <= 0) {
    milestones.push('💰 The club is financially self-sufficient. No debt, positive net worth.')
  }

  return milestones
}

export function applyScenarioToClub(club: Club, scenarioKey: string): Club {
  const preset = SCENARIOS[scenarioKey]
  if (!preset) return club

  return {
    ...club,
    boardConfidence: preset.boardConfidence,
    fanTrust: preset.fanTrust,
    stadiumCapacity: preset.stadiumCapacity,
    finance: {
      ...club.finance,
      cash: preset.cash,
      debt: preset.debt,
    },
    squad: club.squad.map((p) => ({
      ...p,
      ability: Math.max(20, Math.min(99, p.ability + preset.squadAbilityBoost)),
    })),
    manager: club.manager
      ? {
          ...club.manager,
          tacticalSkill: Math.max(20, Math.min(99, club.manager.tacticalSkill + preset.managerSkillBoost)),
          transferSkill: Math.max(20, Math.min(99, club.manager.transferSkill + preset.managerSkillBoost)),
          manManagement: Math.max(20, Math.min(99, club.manager.manManagement + preset.managerSkillBoost)),
        }
      : null,
  }
}
