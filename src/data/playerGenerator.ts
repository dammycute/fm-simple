import type { Player, ClubData } from './types'

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

export function generateSquad(club: ClubData): Player[] {
  const squadSize = 20 + Math.floor(Math.random() * 6)
  const players: Player[] = []

  const usedNames = new Set<string>()

  for (let i = 0; i < squadSize; i++) {
    let name: string
    do {
      name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
    } while (usedNames.has(name))
    usedNames.add(name)

    const reputationScale = club.reputation / 100

    const baseAbility = Math.round(40 + reputationScale * 40 + (Math.random() - 0.5) * 15)
    const ability = Math.max(20, Math.min(99, baseAbility))

    const potentialGap = Math.floor(Math.random() * 15)
    const potential = Math.min(99, ability + potentialGap)

    const age = 17 + Math.floor(Math.random() * 20)

    const position = positions[i % positions.length]

    const wage = Math.round(500 + reputationScale * 4000 + (ability - 40) * 50 + Math.random() * 1000)

    const marketValue = Math.round(50000 + reputationScale * 10000000 + ability * 100000 + Math.random() * 500000)

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
