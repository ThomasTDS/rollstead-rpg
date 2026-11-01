import { describe, expect, it } from 'vitest'
import themeCss from './theme.css?raw'

type Theme = 'light' | 'dark'

/** Reads every `--color-<name>: light-dark(#light, #dark)` token from theme.css. */
function readTokens() {
  const tokens: Record<string, Record<Theme, string>> = {}
  const pattern = /--color-([\w-]+):\s*light-dark\((#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\)/gi
  for (const [, name = '', light = '', dark = ''] of themeCss.matchAll(pattern)) {
    tokens[name] = { light, dark }
  }
  return tokens
}

/** WCAG 2 relative luminance of a #rrggbb color. */
function luminance(hex: string) {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
  const [r = 0, g = 0, b = 0] = channels.map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return ((high ?? 0) + 0.05) / ((low ?? 0) + 0.05)
}

const tokens = readTokens()

// [text or UI color, background, minimum WCAG ratio]: 4.5 for text, 3 for UI elements
const pairs: [string, string, number][] = [
  ['foreground', 'background', 4.5],
  ['muted', 'background', 4.5],
  ['accent', 'background', 3],
  ['window-foreground', 'window', 4.5],
  ['window-accent', 'window', 4.5],
]

describe('theme tokens', () => {
  it('define every color with a light and a dark value', () => {
    const declared = [...themeCss.matchAll(/^\s*--color-([\w-]+):/gm)].map(([, name]) => name)
    const colorTokens = declared.filter((name) => name !== '*')

    expect(colorTokens.length).toBeGreaterThan(0)
    expect(Object.keys(tokens).sort()).toEqual(colorTokens.sort())
  })

  describe.each<Theme>(['light', 'dark'])('%s theme', (theme) => {
    it.each(pairs)('%s on %s meets contrast %d:1', (color, background, minimum) => {
      const fg = tokens[color]?.[theme]
      const bg = tokens[background]?.[theme]
      if (!fg || !bg) throw new Error(`Missing token: ${color} or ${background}`)

      expect(contrast(fg, bg)).toBeGreaterThanOrEqual(minimum)
    })
  })
})
