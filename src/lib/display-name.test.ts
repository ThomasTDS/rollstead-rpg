import { describe, expect, it } from 'vitest'
import { MAX_DISPLAY_NAME_LENGTH, normalizeDisplayName } from './display-name'

describe('normalizeDisplayName', () => {
  it('trims surrounding spaces', () => {
    expect(normalizeDisplayName('  Ana Clara  ')).toBe('Ana Clara')
  })

  it.each(['', '    '])('rejects a blank name: "%s"', (input) => {
    expect(normalizeDisplayName(input)).toBeNull()
  })

  it('accepts a name at the limit', () => {
    const name = 'a'.repeat(MAX_DISPLAY_NAME_LENGTH)

    expect(normalizeDisplayName(name)).toBe(name)
  })

  it('rejects a name over the limit', () => {
    expect(normalizeDisplayName('a'.repeat(MAX_DISPLAY_NAME_LENGTH + 1))).toBeNull()
  })

  it('keeps accents and emoji', () => {
    expect(normalizeDisplayName('João 🎲')).toBe('João 🎲')
  })
})
