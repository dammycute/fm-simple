import type { Club } from './types'

export interface EventTemplate {
  id: string
  type: string
  title: string
  description: string
  baseProbability: number
  triggerCondition?: (club: Club) => boolean
  getWeight?: (club: Club) => number
  choices: {
    label: string
    effects: {
      cash?: number
      boardConfidence?: number
      fanTrust?: number
      moraleHit?: number
    }
    resultText: string
    deferredEventId?: string
  }[]
}

export function getEventWeight(template: EventTemplate, club: Club): number {
  if (template.getWeight) return template.getWeight(club)
  return template.baseProbability
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  // ── Original 10 ──────────────────────────────────────────────────────
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
        deferredEventId: 'aggravated_injury',
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
    getWeight: (club) => club.boardConfidence < 20 ? 0.08 : club.finance.cash < -1000000 ? 0.07 : 0.03,
    choices: [
      {
        label: 'Enter negotiations',
        effects: { boardConfidence: 10, cash: 5000000 },
        resultText: 'The consortium makes a preliminary offer. The board is intrigued.',
        deferredEventId: 'takeover_second_round',
      },
      {
        label: 'Reject approach',
        effects: { boardConfidence: -10 },
        resultText: 'You reject the approach. The board is disappointed.',
        deferredEventId: 'takeover_resurfaces',
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
    getWeight: (club) => club.tier <= 2 ? 0.05 : 0.03,
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
    getWeight: (club) => {
      const ratio = club.finance.rollingLoss3yr / 5000000
      return Math.min(0.15, 0.03 + ratio * 0.04)
    },
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
        deferredEventId: 'unhappy_player_aftermath',
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

  // ── NEW: 20 more events (10 original + 20 new = 30 total) ──────────

  // 11. Tax bill surprise
  {
    id: 'tax_bill',
    type: 'financial',
    title: 'HMRC Tax Bill',
    description: 'HMRC has notified the club of an unexpected tax bill from a previous accounting period. Payment is due within the month.',
    baseProbability: 0.03,
    getWeight: (club) => club.finance.debt > 0 ? 0.05 : 0.03,
    choices: [
      {
        label: 'Pay in full',
        effects: { cash: -1500000, boardConfidence: 5 },
        resultText: 'The bill is paid. The board appreciates the financial discipline.',
      },
      {
        label: 'Negotiate a payment plan',
        effects: { cash: -500000, boardConfidence: -5, fanTrust: -5 },
        resultText: 'HMRC agrees to a plan. Interest accrues but the immediate hit is smaller.',
      },
      {
        label: 'Dispute the assessment',
        effects: { boardConfidence: -15 },
        resultText: 'The dispute buys time but legal fees mount. The board is unhappy with the risk.',
      },
    ],
  },

  // 12. Local derby build-up
  {
    id: 'derby_buildup',
    type: 'fan',
    title: 'Derby Week Fan March',
    description: 'Fans are organizing a march to the stadium before the local derby. They want the chairman to acknowledge the occasion.',
    baseProbability: 0.03,
    triggerCondition: (club) => club.fanTrust > 30,
    choices: [
      {
        label: 'Join the march and speak',
        effects: { fanTrust: 10, boardConfidence: 5 },
        resultText: 'Fans cheer your presence. Great for morale and PR.',
      },
      {
        label: 'Provide free scarves',
        effects: { cash: -100000, fanTrust: 5 },
        resultText: 'Fans appreciate the gesture. The stadium is a sea of club colors.',
      },
      {
        label: 'Stay away — let the team focus',
        effects: { fanTrust: -5 },
        resultText: 'Fans notice your absence. A missed opportunity.',
      },
    ],
  },

  // 13. Agent pushing a client
  {
    id: 'agent_push',
    type: 'player',
    title: 'Agent Demands Playing Time',
    description: 'An agent representing one of your squad players has called to demand more first-team football for his client, or he\'ll push for a move.',
    baseProbability: 0.04,
    triggerCondition: (club) => club.squad.length > 15,
    getWeight: (club) => {
      const fringe = club.squad.filter((p) => p.ability < 60).length
      return 0.02 + fringe * 0.005
    },
    choices: [
      {
        label: 'Promise more minutes',
        effects: { boardConfidence: -5 },
        resultText: 'The agent is appeased. You\'ll need to rotate the squad more.',
      },
      {
        label: 'Sell him in January',
        effects: { fanTrust: -5 },
        resultText: 'The player is transfer-listed. Fans are divided on the decision.',
      },
      {
        label: 'Loan him out',
        effects: {},
        resultText: 'A loan move is arranged. The player gets minutes elsewhere.',
      },
    ],
  },

  // 14. Pitch invasion scare
  {
    id: 'pitch_invasion',
    type: 'stadium',
    title: 'Pitch Invasion Attempt',
    description: 'A group of fans attempted to invade the pitch after the last match. The FA has issued a warning.',
    baseProbability: 0.02,
    triggerCondition: (club) => club.fanTrust > 70,
    choices: [
      {
        label: 'Increase security',
        effects: { cash: -200000, boardConfidence: 5 },
        resultText: 'Extra stewards and barriers installed. The FA is satisfied.',
      },
      {
        label: 'Issue a public apology',
        effects: { fanTrust: -5, boardConfidence: -5 },
        resultText: 'The apology is accepted, but the club\'s reputation takes a small hit.',
      },
    ],
  },

  // 15. Training ground upgrade opportunity
  {
    id: 'training_ground',
    type: 'board',
    title: 'Training Ground Upgrade',
    description: 'The facilities team reports that the training ground equipment is outdated. An upgrade could improve player development.',
    baseProbability: 0.03,
    choices: [
      {
        label: 'Fund the upgrade',
        effects: { cash: -800000, boardConfidence: 5, fanTrust: 5 },
        resultText: 'State-of-the-art equipment installed. Players are buzzing.',
      },
      {
        label: 'Partial refurbishment',
        effects: { cash: -300000 },
        resultText: 'Essential equipment replaced. Good enough for now.',
      },
      {
        label: 'Prioritize other spending',
        effects: { boardConfidence: -5 },
        resultText: 'The training ground remains outdated. The manager is disappointed.',
      },
    ],
  },

  // 16. Media speculation — star player linked away
  {
    id: 'media_speculation',
    type: 'player',
    title: 'Transfer Speculation',
    description: 'The media is reporting that a bigger club is monitoring your star player. His head might be turned.',
    baseProbability: 0.04,
    triggerCondition: (club) => club.squad.some((p) => p.ability >= 70),
    getWeight: (club) => {
      const stars = club.squad.filter((p) => p.ability >= 70).length
      return 0.02 + stars * 0.02
    },
    choices: [
      {
        label: 'Publicly reject the rumors',
        effects: { fanTrust: 5, boardConfidence: 5 },
        resultText: 'The player stays focused. Fans appreciate the clarity.',
      },
      {
        label: 'Quietly listen to offers',
        effects: { boardConfidence: -5 },
        resultText: 'You keep your options open. The player is unsettled.',
        deferredEventId: 'media_speculation_bid',
      },
    ],
  },

  // 17. Community outreach
  {
    id: 'community_outreach',
    type: 'fan',
    title: 'Community Outreach Program',
    description: 'Local community leaders are asking the club to run free coaching sessions for underprivileged kids.',
    baseProbability: 0.03,
    choices: [
      {
        label: 'Fund the program fully',
        effects: { cash: -150000, fanTrust: 10, boardConfidence: 5 },
        resultText: 'The program is a hit. Great PR and community ties strengthen.',
      },
      {
        label: 'Co-brand with a sponsor',
        effects: { fanTrust: 5 },
        resultText: 'A sponsor covers half the cost. Decent outcome with less financial hit.',
      },
      {
        label: 'Decline — focus on football',
        effects: { fanTrust: -5 },
        resultText: 'The community feels let down. A PR misstep.',
      },
    ],
  },

  // 18. Player morale crisis
  {
    id: 'morale_crisis',
    type: 'player',
    title: 'Dressing Room Unrest',
    description: 'Word reaches you that the dressing room is divided after a string of poor results. Morale is low.',
    baseProbability: 0.03,
    triggerCondition: (club) => {
      const recent = club.fanTrust < 50
      return recent
    },
    choices: [
      {
        label: 'Address the squad personally',
        effects: { boardConfidence: 5, fanTrust: 5 },
        resultText: 'Your speech rallies the team. Results improve slightly.',
      },
      {
        label: 'Let the manager handle it',
        effects: {},
        resultText: 'The manager sorts it internally. No lasting damage.',
      },
    ],
  },

  // 19. FA Cup giant-killing (non-league only)
  {
    id: 'fa_cup_run',
    type: 'board',
    title: 'Cup Run Bonus',
    description: 'The club has progressed further than expected in the FA Cup. Prize money and TV revenue are rolling in.',
    baseProbability: 0.02,
    triggerCondition: (club) => club.tier >= 4,
    choices: [
      {
        label: 'Invest in the squad',
        effects: { cash: 1000000, boardConfidence: 10 },
        resultText: 'Cup revenue is reinvested. Fans dream of more giant-killings.',
      },
      {
        label: 'Bank the revenue',
        effects: { cash: 2000000, boardConfidence: 5 },
        resultText: 'Prudent financial management. The board approves.',
      },
    ],
  },

  // 20. New shirt launch backlash
  {
    id: 'shirt_launch',
    type: 'commercial',
    title: 'New Kit Controversy',
    description: 'The new season kit design has been leaked and fans hate it. Social media is in uproar.',
    baseProbability: 0.02,
    choices: [
      {
        label: 'Go back to the drawing board',
        effects: { cash: -200000, fanTrust: 10 },
        resultText: 'A redesigned kit is rushed through. Fans are mollified.',
      },
      {
        label: 'Ride out the criticism',
        effects: { fanTrust: -5 },
        resultText: 'Sales are lower than expected. Next year\'s design will be better.',
      },
    ],
  },

  // 21. Scouting discovery — hidden gem
  {
    id: 'scouting_gem',
    type: 'scouting',
    title: 'Hidden Gem in Non-League',
    description: 'Your scouts have found a raw talent playing in the lower leagues. He could be a bargain.',
    baseProbability: 0.04,
    choices: [
      {
        label: 'Sign him immediately',
        effects: { cash: -300000, fanTrust: 5 },
        resultText: 'The player joins for a modest fee. High potential, raw ability.',
      },
      {
        label: 'Monitor for a month',
        effects: {},
        resultText: 'You wait. Another club snaps him up. Missed opportunity.',
      },
    ],
  },

  // 22. Boardroom power struggle
  {
    id: 'boardroom_struggle',
    type: 'board',
    title: 'Boardroom Power Struggle',
    description: 'A minority shareholder is challenging the board\'s direction. They want more say in financial decisions.',
    baseProbability: 0.015,
    triggerCondition: (club) => club.boardConfidence < 50,
    choices: [
      {
        label: 'Side with the board',
        effects: { boardConfidence: 5 },
        resultText: 'The board appreciates your loyalty. Stability restored.',
      },
      {
        label: 'Listen to the challenger',
        effects: { boardConfidence: -10, cash: 1000000 },
        resultText: 'The challenger brings fresh ideas and a small investment. The board is unhappy.',
      },
    ],
  },

  // 23. Academy graduate breakthrough
  {
    id: 'academy_grad',
    type: 'scouting',
    title: 'Academy Graduate Breakthrough',
    description: 'One of your youth academy graduates is knocking on the first-team door. The coaches are excited.',
    baseProbability: 0.03,
    choices: [
      {
        label: 'Promote to first team',
        effects: { fanTrust: 10 },
        resultText: 'The youngster makes his debut. Fans love homegrown talent.',
      },
      {
        label: 'Keep him in the reserves',
        effects: { fanTrust: -5 },
        resultText: 'He stays in the reserves. Fans question the pathway.',
      },
    ],
  },

  // 24. Player arrested (off-field)
  {
    id: 'player_arrested',
    type: 'player',
    title: 'Player Off-Field Incident',
    description: 'One of your players has been involved in a late-night incident. The tabloids are having a field day.',
    baseProbability: 0.015,
    triggerCondition: (club) => club.squad.length > 15,
    choices: [
      {
        label: 'Fine and discipline internally',
        effects: { fanTrust: 5, boardConfidence: 5 },
        resultText: 'The player is fined two weeks\' wages. Strong message sent.',
      },
      {
        label: 'Defend the player publicly',
        effects: { fanTrust: -5 },
        resultText: 'The media scrutiny intensifies. Fans are divided.',
      },
      {
        label: 'Sweep it under the rug',
        effects: { boardConfidence: -10 },
        resultText: 'The story eventually dies, but the board questions your judgment.',
      },
    ],
  },

  // 25. Loyalty bonus dispute
  {
    id: 'loyalty_bonus',
    type: 'financial',
    title: 'Loyalty Bonus Dispute',
    description: 'A veteran player\'s contract has a loyalty bonus clause that the club thought had expired. His agent disagrees.',
    baseProbability: 0.025,
    choices: [
      {
        label: 'Pay the bonus',
        effects: { cash: -500000, boardConfidence: -5, fanTrust: 5 },
        resultText: 'The player gets his bonus. Fans appreciate loyalty to a club servant.',
      },
      {
        label: 'Take it to arbitration',
        effects: { cash: -100000, boardConfidence: 5 },
        resultText: 'Arbitration rules in the club\'s favor. The player is unhappy.',
        deferredEventId: 'loyalty_bonus_aftermath',
      },
    ],
  },

  // 26. Weather caused fixture pileup
  {
    id: 'weather_disruption',
    type: 'stadium',
    title: 'Storm Damage',
    description: 'A severe storm has damaged part of the stadium roof. Safety inspectors have closed one stand.',
    baseProbability: 0.02,
    choices: [
      {
        label: 'Emergency repairs',
        effects: { cash: -750000, fanTrust: 5 },
        resultText: 'The stand reopens quickly. Fans are relieved.',
      },
      {
        label: 'Temporary cover only',
        effects: { cash: -200000, fanTrust: -10 },
        resultText: 'The stand remains closed for weeks. Lost matchday revenue.',
      },
    ],
  },

  // 27. Endorsement offer
  {
    id: 'endorsement_offer',
    type: 'commercial',
    title: 'Global Brand Endorsement',
    description: 'A global brand wants your star player to feature in a campaign. They are offering a fee to the club.',
    baseProbability: 0.025,
    triggerCondition: (club) => club.squad.some((p) => p.ability >= 75),
    choices: [
      {
        label: 'Accept the deal',
        effects: { cash: 1000000, fanTrust: 5 },
        resultText: 'The campaign runs globally. Great exposure and a nice cash injection.',
      },
      {
        label: 'Decline — keep focus',
        effects: { boardConfidence: 5 },
        resultText: 'The player stays focused on football. The board respects the priority.',
      },
    ],
  },

  // 28. Player falls out with manager
  {
    id: 'player_manager_fallout',
    type: 'manager',
    title: 'Player-Manager Fallout',
    description: 'A senior player has had a public falling out with the manager in training. The squad is taking sides.',
    baseProbability: 0.03,
    triggerCondition: (club) => club.manager !== null,
    choices: [
      {
        label: 'Back the manager',
        effects: { boardConfidence: 5, fanTrust: -5 },
        resultText: 'The player is dropped. The manager\'s authority is reinforced.',
      },
      {
        label: 'Mediate a truce',
        effects: {},
        resultText: 'Both sides shake hands. Tensions ease but don\'t fully disappear.',
      },
      {
        label: 'Sell the player',
        effects: { fanTrust: -10, boardConfidence: -5 },
        resultText: 'The player is sold in January. Squad morale drops.',
      },
    ],
  },

  // 29. Travel disruption
  {
    id: 'travel_disruption',
    type: 'stadium',
    title: 'Travel Nightmare',
    description: 'Train strikes and road closures mean the team bus is stuck ahead of a crucial away fixture.',
    baseProbability: 0.02,
    choices: [
      {
        label: 'Charter a private coach',
        effects: { cash: -150000, boardConfidence: -5 },
        resultText: 'The team arrives tired but on time. A narrow escape.',
      },
      {
        label: 'Reschedule the trip',
        effects: { fanTrust: -5 },
        resultText: 'The fixture is moved. Fans who traveled are left stranded.',
      },
    ],
  },

  // 30. Season ticket renewal push
  {
    id: 'season_tickets',
    type: 'fan',
    title: 'Season Ticket Campaign',
    description: 'Season ticket renewals are below target. The commercial team wants to run a discount campaign.',
    baseProbability: 0.03,
    choices: [
      {
        label: 'Authorize the discount',
        effects: { cash: -300000, fanTrust: 10 },
        resultText: 'Renewals pick up. Fans appreciate the value.',
      },
      {
        label: 'Hold the price — invest in marketing',
        effects: { cash: -200000, fanTrust: -5 },
        resultText: 'Marketing pushes renewals but fans grumble about the price.',
      },
    ],
  },

  // ── Deferred (follow-up) events ──────────────────────────────────────

  {
    id: 'aggravated_injury',
    type: 'player',
    title: 'Aggravated Injury',
    description: 'Playing through the pain has backfired. Your star player has aggravated the injury and is now out for 6 weeks.',
    baseProbability: 0.8,
    choices: [
      {
        label: 'Send him to a specialist',
        effects: { cash: -200000, fanTrust: 5 },
        resultText: 'The specialist prescribes intensive rehab. The player will return stronger.',
      },
      {
        label: 'Standard recovery',
        effects: {},
        resultText: 'The player works through standard rehab. A frustrating setback.',
      },
    ],
  },

  {
    id: 'takeover_resurfaces',
    type: 'takeover',
    title: 'Takeover Interest Returns',
    description: 'Remember the consortium you rejected? They\'re back with a higher offer and are talking directly to the board.',
    baseProbability: 0.5,
    choices: [
      {
        label: 'Open negotiations',
        effects: { cash: 7000000, boardConfidence: 5 },
        resultText: 'A deal is struck. The club gets a cash injection and new board members.',
      },
      {
        label: 'Hold firm again',
        effects: { boardConfidence: -15 },
        resultText: 'The consortium walks away for good. The board is deeply frustrated.',
      },
    ],
  },

  {
    id: 'takeover_second_round',
    type: 'takeover',
    title: 'Takeover Due Diligence',
    description: 'The consortium is performing due diligence. They\'ve found some worrying numbers in the club\'s accounts.',
    baseProbability: 0.5,
    choices: [
      {
        label: 'Be transparent about the finances',
        effects: { boardConfidence: 5 },
        resultText: 'The consortium appreciates the honesty. The deal proceeds.',
      },
      {
        label: 'Downplay the concerns',
        effects: { boardConfidence: -10, cash: -1000000 },
        resultText: 'The consortium walks away demanding compensation for wasted time.',
      },
    ],
  },

  {
    id: 'unhappy_player_aftermath',
    type: 'player',
    title: 'Unhappy Player Performance Dip',
    description: 'The player you rejected a transfer request for is visibly unhappy. His performances have dipped and the fans are noticing.',
    baseProbability: 0.6,
    choices: [
      {
        label: 'Give him a captaincy role',
        effects: { boardConfidence: -5, fanTrust: 5 },
        resultText: 'The armband lifts his spirits. Form gradually returns.',
      },
      {
        label: 'Transfer-list him quietly',
        effects: { fanTrust: -10 },
        resultText: 'The player is sold at a discount. A disappointing end.',
      },
    ],
  },

  {
    id: 'media_speculation_bid',
    type: 'player',
    title: 'Official Bid Arrives',
    description: 'A formal bid has arrived for your star player, matching your valuation. The player wants to talk to them.',
    baseProbability: 0.5,
    choices: [
      {
        label: 'Accept the bid',
        effects: { cash: 8000000, fanTrust: -10 },
        resultText: 'The player departs for a big fee. Fans are gutted.',
      },
      {
        label: 'Reject and offer improved terms',
        effects: { cash: -3000000, boardConfidence: 5 },
        resultText: 'The player signs an improved deal. A statement of intent.',
      },
    ],
  },

  {
    id: 'loyalty_bonus_aftermath',
    type: 'player',
    title: 'Veteran Requests Transfer',
    description: 'After the arbitration ruling, the veteran player feels undervalued and has requested a transfer.',
    baseProbability: 0.6,
    choices: [
      {
        label: 'Grant the request',
        effects: { fanTrust: -10 },
        resultText: 'The club legend departs. A sad end to his time here.',
      },
      {
        label: 'Offer a compromise',
        effects: { cash: -250000, fanTrust: 5 },
        resultText: 'A partial payment and a testimonial match are agreed. Peace is restored.',
      },
    ],
  },
]

export function pickRandomEvent(club: Club): EventTemplate | null {
  const eligible = EVENT_TEMPLATES.filter((t) => {
    if (t.triggerCondition && !t.triggerCondition(club)) return false
    return Math.random() < getEventWeight(t, club)
  })

  return eligible.length > 0 ? eligible[Math.floor(Math.random() * eligible.length)] : null
}

export function resolveEventChoice(
  club: Club,
  event: EventTemplate,
  choiceIndex: number
): { updatedClub: Club; resultText: string; deferredEventId?: string } {
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

  return { updatedClub, resultText: choice.resultText, deferredEventId: choice.deferredEventId }
}
