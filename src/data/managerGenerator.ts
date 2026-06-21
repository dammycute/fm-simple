import type { Manager } from './types'

const managerFirstNames = [
  'Gary', 'Steve', 'Michael', 'Paul', 'David', 'Mark', 'Darren', 'Craig',
  'Phil', 'Kevin', 'Chris', 'Lee', 'John', 'Alan', 'Anthony', 'Brian',
]

const managerLastNames = [
  'Jones', 'Smith', 'Brown', 'Wilson', 'Taylor', 'Davies', 'Evans', 'Moore',
  'Parker', 'Cook', 'Morgan', 'Cooper', 'Kelly', 'Adams', 'Ward', 'Collins',
]

export function generateManager(reputation: number): Manager {
  const repScale = reputation / 100

  return {
    id: `mgr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: `${managerFirstNames[Math.floor(Math.random() * managerFirstNames.length)]} ${managerLastNames[Math.floor(Math.random() * managerLastNames.length)]}`,
    tacticalSkill: Math.round(40 + repScale * 40 + Math.random() * 20),
    transferSkill: Math.round(40 + repScale * 35 + Math.random() * 25),
    manManagement: Math.round(40 + repScale * 35 + Math.random() * 25),
    ambition: Math.round(30 + Math.random() * 70),
    patience: Math.round(30 + Math.random() * 70),
    wageDemand: Math.round(5000 + repScale * 50000 + Math.random() * 10000),
    contractYears: 2 + Math.floor(Math.random() * 3),
    philosophy: (['attacking', 'balanced', 'defensive'] as const)[Math.floor(Math.random() * 3)],
  }
}

export function generateManagerCandidates(count: number, clubTier: number): Manager[] {
  const repBase = Math.max(20, 60 - clubTier * 8)
  const managers: Manager[] = []
  for (let i = 0; i < count; i++) {
    managers.push(generateManager(repBase + Math.floor(Math.random() * 25)))
  }
  return managers
}
