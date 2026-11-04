export const MAX_DISPLAY_NAME_LENGTH = 40
export const MAX_TABLE_NAME_LENGTH = 60

/** Returns the name ready to save, or null if it is blank or over the limit. */
export function normalizeName(input: string, maxLength: number): string | null {
  const name = input.trim()
  if (name.length === 0 || name.length > maxLength) return null
  return name
}
