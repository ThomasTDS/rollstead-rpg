import { describe, expect, it } from 'vitest'
import { normalizeName } from './names'

describe('normalizeName', () => {
  it('trims surrounding spaces', () => {
    expect(normalizeName('  Ana Clara  ', 40)).toBe('Ana Clara')
  })

  it.each(['', '    '])('rejects a blank name: "%s"', (input) => {
    expect(normalizeName(input, 40)).toBeNull()
  })

  it('accepts a name at the limit', () => {
    const name = 'a'.repeat(40)

    expect(normalizeName(name, 40)).toBe(name)
  })

  it('rejects a name over the limit', () => {
    expect(normalizeName('a'.repeat(41), 40)).toBeNull()
  })

  it('keeps accents and emoji', () => {
    expect(normalizeName('João 🎲', 40)).toBe('João 🎲')
  })
})
