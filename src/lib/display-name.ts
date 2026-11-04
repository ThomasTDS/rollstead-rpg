export const MAX_DISPLAY_NAME_LENGTH = 40

/** Returns the name ready to save, or null if it breaks the rules of NT-73. */
export function normalizeDisplayName(input: string): string | null {
  const name = input.trim()
  if (name.length === 0 || name.length > MAX_DISPLAY_NAME_LENGTH) return null
  return name
}
