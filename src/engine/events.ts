import type { Club } from './types'

export interface EventTemplate {
  id: string
  type: string
  title: string
  description: string
  baseProbability: number
  triggerCondition?: (club: Club) => boolean
  choices: {
    label: string
    effects: {
      cash?: number
      boardConfidence?: number
      fanTrust?: number
      managerPatience?: number
    }
    resultText: string
  }[]
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'star_player_injury',
    type: 'player',
    title: 'Star Player Injury',
    description: 'Your best player has picked up a knock in training. The physio says he needs rest.',
    baseProbability: 0.05,
    choices: [
      {
        label: 'Rest him for 2 weeks',
        effects: { fanTrust: -5 },
        resultText: 'The player will miss 2 weeks but returns fully fit.',
      },
      {
        label: 'Play through the pain',
        effects: { fanTrust: 5, boardConfidence: -5 },
        resultText: 'The player plays but his form suffers. Fans appreciate the commitment.',
      },
    ],
  },
  {
    id: 'takeover_interest',
    type: 'takeover',
    title: 'Takeover Interest',
    description: 'A consortium has expressed interest in buying the club. They want to discuss terms.',
    baseProbability: 0.03,
    triggerCondition: (club) => club.boardConfidence < 40 || club.finance.cash < 0,
    choices: [
      {
        label: 'Enter negotiations',
        effects: { boardConfidence: 10, cash: 5000000 },
        resultText: 'The consortium makes a preliminary offer. The board is intrigued.',
      },
      {
        label: 'Reject approach',
        effects: { boardConfidence: -10 },
        resultText: 'You reject the approach. The board is disappointed.',
      },
    ],
  },
  {
    id: 'sponsor_renegotiation',
    type: 'commercial',
    title: 'Sponsor Renegotiation',
    description: 'Your shirt sponsor wants to renegotiate terms mid-contract due to your improved league position.',
    baseProbability: 0.04,
    choices: [
      {
        label: 'Accept improved terms',
        effects: { cash: 2000000 },
        resultText: 'The sponsor increases their payments. Extra cash in the bank.',
      },
      {
        label: 'Hold firm on original deal',
        effects: { fanTrust: 5 },
        resultText: 'You stick to the original deal. Fans appreciate the stability.',
      },
    ],
  },
  {
    id: 'manager_poached',
    type: 'manager',
    title: 'Manager Approached',
    description: 'A bigger club has approached your manager. He is tempted by the offer.',
    baseProbability: 0.03,
    triggerCondition: (club) => club.manager !== null,
    choices: [
      {
        label: 'Let him go',
        effects: { boardConfidence: -10 },
        resultText: 'The manager leaves. You need to find a replacement.',
      },
      {
        label: 'Offer new contract',
        effects: { cash: -1000000, boardConfidence: 5 },
        resultText: 'The manager stays. The board approves of your commitment.',
      },
    ],
  },
  {
    id: 'stadium_incident',
    type: 'stadium',
    title: 'Stadium Incident',
    description: 'A minor structural issue has been found in the main stand during a routine inspection.',
    baseProbability: 0.04,
    choices: [
      {
        label: 'Pay for immediate repairs',
        effects: { cash: -500000, fanTrust: 5 },
        resultText: 'The repairs are quick. Fans feel safe and appreciate the swift action.',
      },
      {
        label: 'Delay repairs to next season',
        effects: { cash: -100000, fanTrust: -10, boardConfidence: -5 },
        resultText: 'Temporary fixes hold up for now, but fans are unhappy about the delay.',
      },
    ],
  },
  {
    id: 'psr_scare',
    type: 'financial',
    title: 'PSR Investigation',
    description: 'The league has flagged your accounts for review. They are concerned about your spending.',
    baseProbability: 0.04,
    triggerCondition: (club) => club.finance.rollingLoss3yr > 0,
    choices: [
      {
        label: 'Cooperate fully',
        effects: { boardConfidence: 5 },
        resultText: 'The investigation finds no wrongdoing. All clear.',
      },
      {
        label: 'Creative accounting',
        effects: { boardConfidence: -15, cash: -2000000 },
        resultText: 'The league hands down a fine and a warning. Board confidence drops.',
      },
    ],
  },
  {
    id: 'fan_protest',
    type: 'fan',
    title: 'Fan Protest',
    description: 'A group of supporters is protesting outside the stadium about ticket prices.',
    baseProbability: 0.04,
    triggerCondition: (club) => club.ticketPrices.standard > 30,
    choices: [
      {
        label: 'Reduce ticket prices',
        effects: { cash: -500000, fanTrust: 15 },
        resultText: 'Fans cheer the price reduction. Trust improves significantly.',
      },
      {
        label: 'Ignore the protest',
        effects: { fanTrust: -10, boardConfidence: -5 },
        resultText: 'The protest continues. Media coverage turns negative.',
      },
    ],
  },
  {
    id: 'player_transfer_request',
    type: 'player',
    title: 'Transfer Request',
    description: 'One of your key players has submitted a formal transfer request, citing ambition.',
    baseProbability: 0.04,
    choices: [
      {
        label: 'Accept the request',
        effects: { fanTrust: -10, boardConfidence: -5 },
        resultText: 'The player is put on the transfer list. Morale in the squad drops.',
      },
      {
        label: 'Reject and offer new contract',
        effects: { cash: -2000000, fanTrust: 5 },
        resultText: 'The player stays for now. Fans are happy to keep a star.',
      },
    ],
  },
  {
    id: 'youth_prospect',
    type: 'scouting',
    title: 'Youth Prospect Discovered',
    description: 'Your scouts have found a promising young player. He could be a star with the right development.',
    baseProbability: 0.05,
    choices: [
      {
        label: 'Sign him for the academy',
        effects: { cash: -200000, fanTrust: 5, boardConfidence: 5 },
        resultText: 'The youngster joins the academy. Potential future star.',
      },
      {
        label: 'Pass - too expensive',
        effects: {},
        resultText: 'You decide the investment is not worth it right now.',
      },
    ],
  },
  {
    id: 'board_budget_review',
    type: 'board',
    title: 'Board Budget Review',
    description: 'The board wants to discuss next season\'s budget. They are considering cutting costs.',
    baseProbability: 0.04,
    triggerCondition: (club) => club.finance.debt > 0,
    choices: [
      {
        label: 'Accept budget cuts',
        effects: { boardConfidence: 10, fanTrust: -5 },
        resultText: 'The board is pleased with your pragmatism.',
      },
      {
        label: 'Argue for more investment',
        effects: { boardConfidence: -10 },
        resultText: 'The board disagrees. Relationships are strained.',
      },
    ],
  },
]

export function pickRandomEvent(club: Club): EventTemplate | null {
  const eligible = EVENT_TEMPLATES.filter((t) => {
    if (t.triggerCondition && !t.triggerCondition(club)) return false
    return Math.random() < t.baseProbability
  })

  return eligible.length > 0 ? eligible[Math.floor(Math.random() * eligible.length)] : null
}

export function resolveEventChoice(
  club: Club,
  event: EventTemplate,
  choiceIndex: number
): { updatedClub: Club; resultText: string } {
  const choice = event.choices[choiceIndex]
  if (!choice) return { updatedClub: club, resultText: 'Invalid choice.' }

  const effects = choice.effects

  const updatedClub: Club = {
    ...club,
    boardConfidence: Math.max(0, Math.min(100, club.boardConfidence + (effects.boardConfidence ?? 0))),
    fanTrust: Math.max(0, Math.min(100, club.fanTrust + (effects.fanTrust ?? 0))),
    finance: {
      ...club.finance,
      cash: club.finance.cash + (effects.cash ?? 0),
    },
  }

  return { updatedClub, resultText: choice.resultText }
}
