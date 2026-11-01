import { describe, expect, it } from 'vitest'
import { toSupportedLanguage } from './languages'

describe('toSupportedLanguage', () => {
  it.each([
    ['pt-BR', 'pt-BR'],
    ['pt', 'pt-BR'],
    ['pt-PT', 'pt-BR'],
    ['en-US', 'en'],
    ['en', 'en'],
    ['es-MX', 'es'],
    ['ES', 'es'],
    ['fr-FR', 'pt-BR'],
    ['', 'pt-BR'],
  ])('maps "%s" to %s', (tag, expected) => {
    expect(toSupportedLanguage(tag)).toBe(expected)
  })
})
