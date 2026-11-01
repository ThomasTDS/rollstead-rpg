import { describe, expect, it } from 'vitest'
import { parseDiceNotation } from './dice'

describe('parseDiceNotation', () => {
  it.each([
    ['2d6+3', { count: 2, sides: 6, modifier: 3 }],
    ['d20', { count: 1, sides: 20, modifier: 0 }],
    ['1d8-1', { count: 1, sides: 8, modifier: -1 }],
    [' 3D4 + 2 ', { count: 3, sides: 4, modifier: 2 }],
  ])('parses "%s"', (notation, expected) => {
    expect(parseDiceNotation(notation)).toEqual(expected)
  })

  it.each(['', 'abc', '2d', 'd', '0d6', '2d1', '2d6+', '2d6*3'])('rejects "%s"', (notation) => {
    expect(parseDiceNotation(notation)).toBeNull()
  })
})
