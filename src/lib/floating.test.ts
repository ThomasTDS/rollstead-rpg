import { describe, expect, it } from 'vitest'
import { floatingPosition } from './floating'

const viewport = { width: 320, height: 600 }
const size = { width: 200, height: 100 }

describe('floatingPosition', () => {
  it('opens below the anchor when it fits', () => {
    expect(floatingPosition({ top: 100, bottom: 140, left: 20 }, size, viewport)).toEqual({
      top: 148,
      left: 20,
    })
  })

  it('opens above when the space below runs out', () => {
    expect(floatingPosition({ top: 520, bottom: 560, left: 20 }, size, viewport)).toEqual({
      top: 412,
      left: 20,
    })
  })

  it('never passes the right edge', () => {
    expect(floatingPosition({ top: 100, bottom: 140, left: 300 }, size, viewport).left).toBe(112)
  })

  it('never passes the top or left edges, even when nothing fits', () => {
    const tiny = { width: 150, height: 80 }

    expect(floatingPosition({ top: 20, bottom: 60, left: 20 }, size, tiny)).toEqual({
      top: 8,
      left: 8,
    })
  })
})
