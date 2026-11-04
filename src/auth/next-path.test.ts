import { describe, expect, it } from 'vitest'
import { safeNextPath } from './next-path'

describe('safeNextPath', () => {
  it('keeps a path inside the site', () => {
    expect(safeNextPath('/convite/abc123')).toBe('/convite/abc123')
  })

  it.each([
    ['nothing', null],
    ['an empty value', ''],
    ['another site', 'https://evil.example'],
    ['a protocol-relative address', '//evil.example'],
    ['a backslash trick', '/\\evil.example'],
  ])('falls back to the tables list for %s', (_title, next) => {
    expect(safeNextPath(next)).toBe('/mesas')
  })
})
