import { globSync, readFileSync } from 'node:fs'
import { sep } from 'node:path'
import { describe, expect, it } from 'vitest'

const toPosix = (path: string) => path.split(sep).join('/')

// Read from disk on every run (an import.meta.glob list can be served stale from the Vitest cache).
// Scans every source file except tests and the token file itself.
const sources = globSync('src/**/*.{ts,tsx,css}')
  .map(toPosix)
  .filter((path) => !/\.test\.tsx?$/.test(path) && path !== 'src/styles/theme.css')
  .map((path) => [path, readFileSync(path, 'utf8')] as const)

const TAILWIND_PALETTE =
  'white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'

const FORBIDDEN: [string, RegExp][] = [
  ['hex color', /#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b/i],
  ['color function', /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i],
  [
    'Tailwind default palette',
    new RegExp(String.raw`\b[a-z-]+-(?:${TAILWIND_PALETTE})(?:-\d{2,3})?\b`),
  ],
]

describe('no hardcoded colors', () => {
  it('scans the source files', () => {
    expect(sources.map(([path]) => path)).toContain('src/App.tsx')
  })

  it.each(sources)('%s uses only theme tokens', (_path, content) => {
    const found = FORBIDDEN.flatMap(([kind, pattern]) => {
      const match = pattern.exec(content)
      return match ? [`${kind}: ${match[0]}`] : []
    })

    expect(found, 'colors must come from src/styles/theme.css').toEqual([])
  })
})
