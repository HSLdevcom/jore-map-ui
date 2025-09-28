import { isCurrentDateWithinTimeSpan, toMidnightDate } from '../dateUtils'

describe('dateUtils.isCurrentDateWithinTimeSpan', () => {
  it('Returns true if currentDate is within timeSpan', () => {
    const a = toMidnightDate(new Date(new Date().setDate(new Date().getDate() - 1)))
    const b = toMidnightDate(new Date())
    const c = toMidnightDate(new Date(new Date().setDate(new Date().getDate() + 1)))
    expect(isCurrentDateWithinTimeSpan(a, b)).toBe(true)
    expect(isCurrentDateWithinTimeSpan(b, c)).toBe(true)
    expect(isCurrentDateWithinTimeSpan(a, c)).toBe(true)
    expect(isCurrentDateWithinTimeSpan(c, c)).toBe(false)
    expect(isCurrentDateWithinTimeSpan(a, a)).toBe(false)
  })
})
