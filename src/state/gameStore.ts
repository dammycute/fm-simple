import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Club, League, GameEvent, Manager } from '../engine/types'
import { createAllLeagues } from '../data/leagueGenerator'
import { simulateWeek } from '../engine/league'
import { generateFixtures } from '../engine/fixtures'
import { generateManager } from '../data/managerGenerator'
import { buyPlayer as executeBuy } from '../engine/transferMarket'
import { createExpansionProject, generateSponsorDeal } from '../engine/stadium'
import { pickRandomEvent, resolveEventChoice, type EventTemplate } from '../engine/events'
import { applyScenarioToClub, checkGameOverConditions, checkMilestones } from '../engine/difficulty'

export interface GameState {
  weekNumber: number
  season: number
  leagues: League[]
  playerClubId: string | null
  events: GameEvent[]
  eventLog: string[]
  gameOver: boolean
  gameOverReason: string | null
  managerCandidates: Manager[]
  pendingEvent: EventTemplate | null
}

interface GameActions {
  advanceWeek: () => void
  newGame: (clubId: string, customName?: string, scenario?: string) => void
  setPlayerClubId: (id: string) => void
  addEventLog: (msg: string) => void
  setGameOver: (reason: string) => void
  sackManager: () => void
  hireManager: (managerId: string) => void
  setTicketPrices: (standard: number) => void
  buyPlayer: (playerId: string, fromClubId: string, fee: number, contractLength: number, installment: boolean) => void
  sellPlayer: (playerId: string) => void
  transferListPlayer: (playerId: string, listed: boolean) => void
  startStadiumExpansion: (additionalCapacity: number) => void
  generateSponsors: () => void
  resolveEvent: (choiceIndex: number) => void
  dismissEvent: () => void
}

type GameStore = GameState & GameActions

const initialState: GameState = {
  weekNumber: 0,
  season: 1,
  leagues: [],
  playerClubId: null,
  events: [],
  eventLog: [],
  gameOver: false,
  gameOverReason: null,
  managerCandidates: [],
  pendingEvent: null,
}

function updateClubInLeagues(leagues: League[], clubId: string, updater: (c: Club) => Club): League[] {
  return leagues.map((l) => ({
    ...l,
    clubs: l.clubs.map((c) => (c.id === clubId ? updater(c) : c)),
  }))
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      newGame: (clubId: string, customName?: string, scenario?: string) => {
        const allLeagues = createAllLeagues()
        let playerClub: Club | null = null

        for (const league of allLeagues) {
          league.fixtures = generateFixtures(league)
          for (const club of league.clubs) {
            if (club.id === clubId) {
              club.isPlayerClub = true
              if (customName) club.name = customName
              club.manager = generateManager(club.reputation)
              club.sponsors = ['shirt', 'stadiumNaming', 'kitSupplier'].map((t) => generateSponsorDeal(club.reputation, t))

              if (scenario) {
                const modded = applyScenarioToClub(club, scenario)
                Object.assign(club, modded)
              }

              playerClub = club
              break
            }
          }
          if (playerClub) break
        }

        set({
          weekNumber: 0,
          season: 1,
          leagues: allLeagues,
          playerClubId: clubId,
          events: [],
          eventLog: [`Season 1 started. You are chairman of ${playerClub?.name ?? clubId}.`],
          gameOver: false,
          gameOverReason: null,
          managerCandidates: [],
        })
      },

      advanceWeek: () => {
        set((s) => {
          const newWeek = s.weekNumber + 1
          const newLeagues = simulateWeek(s.leagues, newWeek)
          let newLog = [...s.eventLog]
          const playerLeague = newLeagues.find((l) => l.clubs.some((c) => c.id === s.playerClubId))

          const playerLeagueFixtures = playerLeague?.fixtures.filter((f) => f.week === newWeek && f.result) ?? []

          for (const f of playerLeagueFixtures) {
            const home = playerLeague?.clubs.find((c) => c.id === f.homeId)
            const away = playerLeague?.clubs.find((c) => c.id === f.awayId)
            if (home && away && f.result) {
              newLog.push(`${home.name} ${f.result.homeGoals}-${f.result.awayGoals} ${away.name}`)
            }
          }

          // Check for random events
          const currentClub = newLeagues.flatMap((l) => l.clubs).find((c) => c.id === s.playerClubId)
          const newEvent = currentClub ? pickRandomEvent(currentClub) : null

          // Check game-over conditions
          const curLeague = newLeagues.find((l) => l.clubs.some((c) => c.id === s.playerClubId))
          if (currentClub && curLeague) {
            const { gameOver, reason } = checkGameOverConditions(currentClub, curLeague, currentClub.boardConfidence)
            if (gameOver) {
              return {
                weekNumber: newWeek,
                leagues: newLeagues,
                eventLog: [...newLog, reason!],
                pendingEvent: null,
                gameOver: true,
                gameOverReason: reason,
              }
            }

            const milestones = checkMilestones(currentClub, curLeague, s.season)
            for (const m of milestones) {
              newLog.push(`Milestone: ${m}`)
            }
          }

          return { weekNumber: newWeek, leagues: newLeagues, eventLog: newLog, pendingEvent: newEvent ?? null }
        })
      },

      sackManager: () => {
        set((s) => {
          const club = s.leagues.flatMap((l) => l.clubs).find((c) => c.id === s.playerClubId)
          if (!club?.manager) return s

          const compo = club.manager.wageDemand * club.manager.contractYears * 52
          const newLeagues = updateClubInLeagues(s.leagues, s.playerClubId!, (c) => ({
            ...c,
            manager: null,
            finance: {
              ...c.finance,
              cash: c.finance.cash - compo,
              expenseByCategory: { ...c.finance.expenseByCategory, agentFees: c.finance.expenseByCategory.agentFees + compo },
            },
          }))

          return {
            leagues: newLeagues,
            managerCandidates: [generateManager(club.reputation), generateManager(club.reputation), generateManager(club.reputation)],
            eventLog: [...s.eventLog, `Sacked manager. Compensation: $${compo.toLocaleString()}`],
          }
        })
      },

      hireManager: (managerId: string) => {
        set((s) => {
          const manager = s.managerCandidates.find((m) => m.id === managerId)
          if (!manager) return s

          const newLeagues = updateClubInLeagues(s.leagues, s.playerClubId!, (c) => ({
            ...c,
            manager,
          }))

          return {
            leagues: newLeagues,
            managerCandidates: [],
            eventLog: [...s.eventLog, `Hired ${manager.name} as manager.`],
          }
        })
      },

      setTicketPrices: (standard: number) => {
        set((s) => {
          const newLeagues = updateClubInLeagues(s.leagues, s.playerClubId!, (c) => ({
            ...c,
            ticketPrices: { ...c.ticketPrices, standard },
          }))
          return { leagues: newLeagues, eventLog: [...s.eventLog, `Ticket price set to $${standard}.`] }
        })
      },

      buyPlayer: (playerId: string, fromClubId: string, fee: number, contractLength: number, installment: boolean) => {
        set((s) => {
          let buyer: Club | undefined
          let seller: Club | undefined
          let player: import('../engine/types').Player | undefined

          for (const league of s.leagues) {
            for (const club of league.clubs) {
              if (club.id === s.playerClubId) buyer = club
              if (club.id === fromClubId) seller = club
              if (buyer && seller) break
            }
            if (buyer && seller) break
          }

          if (!buyer || !seller) return s

          player = seller.squad.find((p) => p.id === playerId)
          if (!player) return s

          const { updatedBuyer, updatedSeller } = executeBuy(buyer, seller, player, fee, contractLength, installment)

          const newLeagues = s.leagues.map((l) => ({
            ...l,
            clubs: l.clubs.map((c) => {
              if (c.id === updatedBuyer.id) return updatedBuyer
              if (c.id === updatedSeller.id) return updatedSeller
              return c
            }),
          }))

          return {
            leagues: newLeagues,
            eventLog: [...s.eventLog, `Signed ${player.name} for $${fee.toLocaleString()}.`],
          }
        })
      },

      sellPlayer: (playerId: string) => {
        set((s) => {
          const playerClub = s.leagues.flatMap((l) => l.clubs).find((c) => c.id === s.playerClubId)
          if (!playerClub) return s

          const player = playerClub.squad.find((p) => p.id === playerId)
          if (!player) return s

          const saleFee = Math.round(player.transferFee * 0.8 + Math.random() * player.transferFee * 0.4)
          const profit = saleFee - player.bookValue

          const newLeagues = updateClubInLeagues(s.leagues, s.playerClubId!, (c) => ({
            ...c,
            squad: c.squad.filter((p) => p.id !== playerId),
            finance: {
              ...c.finance,
              cash: c.finance.cash + saleFee,
              revenueByCategory: { ...c.finance.revenueByCategory, sales: c.finance.revenueByCategory.sales + saleFee },
              rollingLoss3yr: c.finance.rollingLoss3yr + Math.max(0, profit),
            },
          }))

          return {
            leagues: newLeagues,
            eventLog: [...s.eventLog, `Sold ${player.name} for $${saleFee.toLocaleString()}.`],
          }
        })
      },

      transferListPlayer: (playerId: string, listed: boolean) => {
        set((s) => {
          const newLeagues = updateClubInLeagues(s.leagues, s.playerClubId!, (c) => ({
            ...c,
            squad: c.squad.map((p) => (p.id === playerId ? { ...p, transferListed: listed } : p)),
          }))
          return { leagues: newLeagues }
        })
      },

      startStadiumExpansion: (additionalCapacity: number) => {
        set((s) => {
          const project = createExpansionProject(additionalCapacity)
          const newLeagues = updateClubInLeagues(s.leagues, s.playerClubId!, (c) => ({
            ...c,
            stadiumExpansion: project,
            finance: { ...c.finance, cash: c.finance.cash - project.cost },
          }))
          return {
            leagues: newLeagues,
            eventLog: [...s.eventLog, `Started stadium expansion: +${additionalCapacity} seats, $${project.cost.toLocaleString()}, ${project.totalWeeks} weeks.`],
          }
        })
      },

      resolveEvent: (choiceIndex: number) => {
        set((s) => {
          if (!s.pendingEvent) return s
          const club = s.leagues.flatMap((l) => l.clubs).find((c) => c.id === s.playerClubId)
          if (!club) return { ...s, pendingEvent: null }

          const { updatedClub, resultText } = resolveEventChoice(club, s.pendingEvent, choiceIndex)

          const newLeagues = updateClubInLeagues(s.leagues, s.playerClubId!, () => updatedClub)

          return {
            leagues: newLeagues,
            pendingEvent: null,
            events: [...s.events, { ...s.pendingEvent, id: `${s.pendingEvent.id}-${Date.now()}`, week: s.weekNumber } as any],
            eventLog: [...s.eventLog, `Event: ${s.pendingEvent.title} — ${resultText}`],
          }
        })
      },

      dismissEvent: () => {
        set({ pendingEvent: null })
      },

      generateSponsors: () => {
        set((s) => {
          const club = s.leagues.flatMap((l) => l.clubs).find((c) => c.id === s.playerClubId)
          if (!club) return s
          const types = ['shirt', 'stadiumNaming', 'kitSupplier']
          const sponsors = types.map((t) => generateSponsorDeal(club.reputation, t))
          const totalValue = getSponsorshipSummary(sponsors)

          const newLeagues = updateClubInLeagues(s.leagues, s.playerClubId!, (c) => ({
            ...c,
            sponsors,
          }))

          return {
            leagues: newLeagues,
            eventLog: [...s.eventLog, `New sponsorship deals signed: $${totalValue.toLocaleString()}/yr total.`],
          }
        })
      },

      setPlayerClubId: (id: string) => set({ playerClubId: id }),

      addEventLog: (msg: string) => {
        set((s) => ({ eventLog: [...s.eventLog, `Week ${s.weekNumber}: ${msg}`] }))
      },

      setGameOver: (reason: string) => {
        set({ gameOver: true, gameOverReason: reason })
      },
    }),
    {
      name: 'football-chairman-save',
      partialize: (state) => ({
        weekNumber: state.weekNumber,
        season: state.season,
        leagues: state.leagues,
        playerClubId: state.playerClubId,
        events: state.events,
        eventLog: state.eventLog,
        gameOver: state.gameOver,
        gameOverReason: state.gameOverReason,
      }),
    }
  )
)

export function getPlayerClub(state: GameState): Club | undefined {
  if (!state.playerClubId) return undefined
  for (const league of state.leagues) {
    const club = league.clubs.find((c) => c.id === state.playerClubId)
    if (club) return club
  }
  return undefined
}

export function getPlayerLeague(state: GameState): League | undefined {
  if (!state.playerClubId) return undefined
  return state.leagues.find((l) => l.clubs.some((c) => c.id === state.playerClubId))
}
