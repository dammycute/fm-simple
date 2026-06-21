import { describe, it, expect } from 'vitest'
import {
  calculateAttendance,
  calculateMatchdayRevenue,
  calculateTVRevenue,
  createAmortEntry,
  calculateBookValue,
  calculateProfitOnSale,
  checkPSR,
  wageToRevenueRatio,
  wageHealthColor,
} from '../finance'

describe('Amortization', () => {
  it('splits a £20m fee over 5 years as £4m/year', () => {
    const entry = createAmortEntry('p1', 20_000_000, 5)
    expect(entry.annualAmount).toBe(4_000_000)
    expect(entry.yearsRemaining).toBe(5)
    expect(entry.totalFee).toBe(20_000_000)
  })

  it('calculates book value after 2 years of a 5-year deal', () => {
    const bv = calculateBookValue(20_000_000, 5, 2)
    expect(bv).toBe(12_000_000)
  })

  it('sale above book value books a profit equal to the difference', () => {
    const profit = calculateProfitOnSale(25_000_000, 12_000_000)
    expect(profit).toBe(13_000_000)
  })

  it('sale below book value books a loss', () => {
    const loss = calculateProfitOnSale(8_000_000, 12_000_000)
    expect(loss).toBe(-4_000_000)
  })
})

describe('PSR / FFP Compliance', () => {
  it('is compliant when within limit', () => {
    const result = checkPSR(30_000_000, 2)
    expect(result.compliant).toBe(true)
    expect(result.overspend).toBe(0)
  })

  it('detects breach when over limit', () => {
    const result = checkPSR(50_000_000, 2)
    expect(result.compliant).toBe(false)
    expect(result.overspend).toBe(11_000_000)
  })

  it('uses correct limits per tier', () => {
    expect(checkPSR(20_000_000, 5).compliant).toBe(false)
    expect(checkPSR(4_000_000, 5).compliant).toBe(true)
    expect(checkPSR(200_000_000, 1).compliant).toBe(false)
    expect(checkPSR(100_000_000, 1).compliant).toBe(true)
  })
})

describe('Attendance', () => {
  it('returns reasonable attendance between 25% and 100% of capacity', () => {
    const att = calculateAttendance(50000, 50, 30, 30, 0.5)
    expect(att).toBeGreaterThan(12500)
    expect(att).toBeLessThanOrEqual(50000)
  })

  it('penalizes attendance when ticket price is above fair price', () => {
    const cheap = calculateAttendance(50000, 50, 25, 30, 0.5)
    const expensive = calculateAttendance(50000, 50, 60, 30, 0.5)
    expect(cheap).toBeGreaterThan(expensive)
  })
})

describe('Matchday Revenue', () => {
  it('calculates ticket revenue plus concessions', () => {
    const rev = calculateMatchdayRevenue(30000, 40)
    expect(rev).toBe(30000 * 40 * 0.85 + 30000 * 5)
  })
})

describe('TV Revenue', () => {
  it('scales by tier and position', () => {
    const tier1 = calculateTVRevenue(1, 19)
    const tier2 = calculateTVRevenue(2, 0)
    expect(tier1).toBeGreaterThan(tier2)
  })
})

describe('Wage-to-Revenue Ratio', () => {
  it('flags healthy ratio below 60%', () => {
    expect(wageHealthColor(wageToRevenueRatio(500_000, 1_000_000))).toBe('healthy')
  })

  it('flags risky ratio between 60-80%', () => {
    expect(wageHealthColor(wageToRevenueRatio(700_000, 1_000_000))).toBe('risky')
  })

  it('flags danger ratio above 80%', () => {
    expect(wageHealthColor(wageToRevenueRatio(900_000, 1_000_000))).toBe('danger')
  })
})
