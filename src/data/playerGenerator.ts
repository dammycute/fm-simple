import type { Player, ClubData } from '../engine/types'

const firstNames = [
  'James', 'Oliver', 'George', 'Harry', 'Jack', 'Jacob', 'Charlie', 'Thomas',
  'William', 'Henry', 'Daniel', 'Alexander', 'Joseph', 'Samuel', 'David', 'Benjamin',
  'Oscar', 'Ryan', 'Ethan', 'Lucas', 'Mason', 'Luke', 'Adam', 'Noah',
  'Liam', 'Muhammad', 'Leo', 'Max', 'Aaron', 'Connor', 'Callum', 'Kyle',
  'Nathan', 'Jake', 'Dylan', 'Louis', 'Joe', 'Elliot', 'Harvey', 'Rhys',
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Wilson', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin',
  'Thompson', 'Moore', 'Allen', 'Young', 'Wright', 'King', 'Scott', 'Green',
  'Baker', 'Adams', 'Nelson', 'Hill', 'Campbell', 'Mitchell', 'Roberts', 'Turner',
  'Phillips', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Morris', 'Murphy', 'Cook',
  'Rogers', 'Morgan', 'Cooper', 'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard',
  'Ward', 'Cox', 'Diaz', 'Richardson', 'Wood', 'Watson', 'Brooks', 'Bennett',
  'Gray', 'James', 'Reyes', 'Cruz', 'Hughes', 'Price', 'Myers', 'Long',
  'Foster', 'Sanders', 'Ross', 'Powell', 'Sullivan', 'Russell', 'Ortiz', 'Jenkins',
  'Perry', 'Butler', 'Barnes', 'Fisher', 'Henderson', 'Coleman', 'Simmons', 'Patterson',
  'Jordan', 'Reynolds', 'Hamilton', 'Graham', 'Kim', 'Gonzalez', 'Alexander', 'Freeman',
  'Duncan', 'Armstrong', 'Berry', 'Johnston', 'Ray', 'West', 'Gordon', 'Hanson',
]

const positions: ('GK' | 'DEF' | 'MID' | 'FWD')[] = ['GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD']

function pickName(used: Set<string>): string {
  let name: string
  do {
    name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
  } while (used.has(name))
  used.add(name)
  return name
}

export function generateSquad(club: ClubData): Player[] {
  const squadSize = 20 + Math.floor(Math.random() * 6)
  const players: Player[] = []
  const usedNames = new Set<string>()
  const reputationScale = club.reputation / 100

  // Designate 3-5 key players (picked before loop so we know which indices)
  const keyCount = 3 + Math.floor(Math.random() * 3)
  const keyIndices = new Set<number>()
  while (keyIndices.size < keyCount) {
    keyIndices.add(Math.floor(Math.random() * squadSize))
  }

  for (let i = 0; i < squadSize; i++) {
    const name = pickName(usedNames)
    const isKey = keyIndices.has(i)

    // Ability: key players get a ceiling bonus, others spread below
    const baseRaw = 35 + reputationScale * 45
    const noise = (Math.random() - 0.5) * 20
    const keyBoost = isKey ? 8 + Math.random() * 12 : 0
    const ability = Math.max(20, Math.min(99, Math.round(baseRaw + noise + keyBoost)))

    const age = 17 + Math.floor(Math.random() * 20)

    // Potential tied to age
    let potentialGap: number
    if (age <= 23) {
      // Young: wide gap, more variance
      potentialGap = Math.floor(Math.random() * 18) + 5
    } else if (age <= 27) {
      // Prime: small upside
      potentialGap = Math.floor(Math.random() * 8)
    } else if (age <= 30) {
      // Early decline: potential at or slightly below ability
      potentialGap = -3 + Math.floor(Math.random() * 6)
    } else {
      // Decline: potential below ability
      potentialGap = -8 + Math.floor(Math.random() * 4)
    }
    const potential = Math.max(20, Math.min(99, ability + potentialGap))

    const position = positions[i % positions.length]

    // Non-linear wage: scales roughly with ability^3 / 50^3
    const abilityRatio = ability / 50
    const wageFloor = 200 + reputationScale * 1500
    const wageCurve = 300 * abilityRatio ** 3
    const wage = Math.round(wageFloor + wageCurve * (1 + Math.random() * 0.3) + reputationScale * 2000)

    // Non-linear market value
    const valueFloor = 10000 + reputationScale * 500000
    const valueCurve = 80000 * abilityRatio ** 3
    const marketValue = Math.round(valueFloor + valueCurve * (0.8 + Math.random() * 0.4))

    players.push({
      id: `${club.shortName}-${i}`,
      name,
      age,
      position,
      ability,
      potential,
      wage,
      contractYears: 1 + Math.floor(Math.random() * 4),
      transferFee: marketValue,
      bookValue: marketValue,
      morale: 50 + Math.floor(Math.random() * 30),
      injuryWeeksLeft: 0,
      transferListed: false,
    })
  }

  return players
}
