import type { Player, Club } from './types'
import { createAmortEntry } from './finance'

export function calculateOfferSuccess(
  bidAmount: number,
  playerValue: number,
  _sellingClubReputation: number
): { accepted: boolean; counterOffer?: number } {
  const ratio = bidAmount / playerValue

  if (ratio >= 1.5) return { accepted: true }
  if (ratio >= 1.0) return { accepted: Math.random() < 0.7 }
  if (ratio >= 0.7) return { accepted: Math.random() < 0.3, counterOffer: Math.round(playerValue * 1.2) }

  return { accepted: false, counterOffer: Math.round(playerValue * 1.3) }
}

export function buyPlayer(
  buyingClub: Club,
  sellingClub: Club,
  player: Player,
  fee: number,
  contractLength: number,
  installment: boolean
): { updatedBuyer: Club; updatedSeller: Club } {
  const amortEntry = createAmortEntry(player.id, fee, contractLength)

  const playerCopy = {
    ...player,
    contractYears: contractLength,
    transferFee: fee,
    bookValue: fee,
  }

  const cashHit = installment ? Math.round(fee * 0.3) : fee
  const deferredDebt = installment ? Math.round(fee * 0.7) : 0

  const updatedBuyer: Club = {
    ...buyingClub,
    squad: [...buyingClub.squad, playerCopy],
    finance: {
      ...buyingClub.finance,
      cash: buyingClub.finance.cash - cashHit,
      debt: buyingClub.finance.debt + deferredDebt,
      revenueByCategory: { ...buyingClub.finance.revenueByCategory },
      expenseByCategory: {
        ...buyingClub.finance.expenseByCategory,
        amortization: buyingClub.finance.expenseByCategory.amortization + amortEntry.annualAmount,
      },
      amortizationSchedule: [...(buyingClub.finance.amortizationSchedule || []), amortEntry],
      rollingLoss3yr: buyingClub.finance.rollingLoss3yr + (fee / contractLength),
    },
  }

  const profitOnSale = fee - player.bookValue

  const updatedSeller: Club = {
    ...sellingClub,
    squad: sellingClub.squad.filter((p) => p.id !== player.id),
    finance: {
      ...sellingClub.finance,
      cash: sellingClub.finance.cash + fee,
      revenueByCategory: {
        ...sellingClub.finance.revenueByCategory,
        sales: sellingClub.finance.revenueByCategory.sales + fee,
      },
      expenseByCategory: { ...sellingClub.finance.expenseByCategory },
      amortizationSchedule: (sellingClub.finance.amortizationSchedule || []).filter((e) => e.playerId !== player.id),
      rollingLoss3yr: sellingClub.finance.rollingLoss3yr - profitOnSale,
    },
  }

  return { updatedBuyer, updatedSeller }
}

export function getTransferList(leagues: import('./types').League[], playerClubId: string): { player: Player; club: Club }[] {
  const results: { player: Player; club: Club }[] = []
  for (const league of leagues) {
    for (const club of league.clubs) {
      if (club.id === playerClubId) continue
      const listed = club.squad.filter((p) => p.ability >= 50)
      for (const player of listed) {
        results.push({ player, club })
      }
    }
  }
  return results.sort((a, b) => b.player.ability - a.player.ability).slice(0, 50)
}
