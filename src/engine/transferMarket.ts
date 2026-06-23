import type { Player, Club } from './types'
import { createAmortEntry } from './finance'

export function calculateOfferSuccess(
  bidAmount: number,
  playerValue: number,
  sellingClubReputation: number,
  buyingClubReputation: number,
  playerAbility: number
): { accepted: boolean; counterOffer?: number } {
  const repGap = sellingClubReputation - buyingClubReputation

  // Hard block: top players won't drop way down regardless of fee
  if (repGap > 35 && playerAbility >= 55) {
    return { accepted: false }
  }

  const ratio = bidAmount / playerValue

  // Rep gap > 20: selling club is much more prestigious, demand premium
  if (repGap > 20) {
    const premium = ratio * (1 - (repGap - 20) / 100)
    if (premium >= 1.8) return { accepted: true }
    if (premium >= 1.3) return { accepted: Math.random() < 0.4, counterOffer: Math.round(playerValue * 1.5) }
    return { accepted: false, counterOffer: Math.round(playerValue * (1.3 + repGap / 100)) }
  }

  // Negative rep gap (buyer more prestigious): easier deals
  if (repGap < 0) {
    const boost = Math.abs(repGap) / 100
    if (ratio >= 1.2 - boost) return { accepted: true }
    if (ratio >= 0.8 - boost) return { accepted: Math.random() < 0.7 }
    return { accepted: Math.random() < 0.3, counterOffer: Math.round(playerValue * 1.1) }
  }

  // Similar reputation: original logic
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

export function getTransferList(leagues: import('./types').League[], playerClubId: string): { player: Player; club: Club; tier: number }[] {
  const playerClub = leagues.flatMap((l) => l.clubs).find((c) => c.id === playerClubId)
  if (!playerClub) return []

  const playerRep = playerClub.reputation
  const playerTier = playerClub.tier

  const results: { player: Player; club: Club; tier: number }[] = []
  for (const league of leagues) {
    for (const club of league.clubs) {
      if (club.id === playerClubId) continue

      const tierGap = Math.abs(league.tier - playerTier)
      const repGap = club.reputation - playerRep

      // ±2 tiers max, and not too far above in reputation
      if (tierGap > 2) continue
      if (repGap > 30 && league.tier < playerTier) continue

      const listed = club.squad.filter((p) => {
        // From bigger clubs: only aging or low-ability players
        if (repGap > 15 && p.ability >= 60 && p.age < 28) return false
        // From smaller clubs: only realistic targets
        if (repGap < -15 && p.ability > playerRep * 0.8) return false
        // Minimum ability floor
        return p.ability >= Math.max(35, 50 - tierGap * 5)
      })
      for (const player of listed) {
        results.push({ player, club, tier: league.tier })
      }
    }
  }

  return results.sort((a, b) => b.player.ability - a.player.ability).slice(0, 50)
}
