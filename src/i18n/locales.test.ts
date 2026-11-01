import { describe, expect, it } from 'vitest'
import { SUPPORTED_LANGUAGES } from './languages'

type Messages = Record<string, unknown>

const files = import.meta.glob<Messages>('./locales/*/*.json', { eager: true, import: 'default' })

/** Groups files as { namespace: { language: messages } }. */
function byNamespace() {
  const result: Record<string, Record<string, Messages>> = {}
  for (const [path, messages] of Object.entries(files)) {
    const [, language = '', namespace = ''] =
      /\.\/locales\/([^/]+)\/([^/]+)\.json$/.exec(path) ?? []
    result[namespace] = { ...result[namespace], [language]: messages }
  }
  return result
}

function flatten(messages: Messages, prefix = ''): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(messages).flatMap(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key
      return value !== null && typeof value === 'object'
        ? Object.entries(flatten(value as Messages, path))
        : [[path, value]]
    }),
  )
}

const namespaces = byNamespace()

describe('translation files', () => {
  it('exist for every supported language and nothing else', () => {
    for (const languages of Object.values(namespaces)) {
      expect(Object.keys(languages).sort()).toEqual([...SUPPORTED_LANGUAGES].sort())
    }
  })

  describe.each(Object.keys(namespaces))('namespace "%s"', (namespace) => {
    const languages = namespaces[namespace] ?? {}
    const source = flatten(languages['pt-BR'] ?? {})

    it.each(SUPPORTED_LANGUAGES)('has exactly the pt-BR keys in %s', (language) => {
      const keys = Object.keys(flatten(languages[language] ?? {})).sort()
      expect(keys).toEqual(Object.keys(source).sort())
    })

    it.each(SUPPORTED_LANGUAGES)('has only non-empty text in %s', (language) => {
      for (const [key, value] of Object.entries(flatten(languages[language] ?? {}))) {
        expect(typeof value === 'string' && value.trim() !== '', `${language}: ${key}`).toBe(true)
      }
    })
  })
})
