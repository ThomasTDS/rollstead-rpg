export interface DiceRoll {
  count: number
  sides: number
  modifier: number
}

const DICE_NOTATION = /^(\d*)d(\d+)([+-]\d+)?$/

/**
 * Parses dice notation such as "2d6+3", "d20" or "1d8-1".
 * Returns null when the text is not valid notation.
 */
export function parseDiceNotation(notation: string): DiceRoll | null {
  const match = DICE_NOTATION.exec(notation.replace(/\s/g, '').toLowerCase())
  if (!match) return null

  const [, count = '', sides = '', modifier = '0'] = match
  const roll = {
    count: count === '' ? 1 : Number(count),
    sides: Number(sides),
    modifier: Number(modifier),
  }

  if (roll.count < 1 || roll.sides < 2) return null
  return roll
}
