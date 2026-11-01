export const SUPPORTED_LANGUAGES = ['pt-BR', 'en', 'es'] as const

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const DEFAULT_LANGUAGE: SupportedLanguage = 'pt-BR'

export const LANGUAGE_STORAGE_KEY = 'rollstead.language'

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
}

/**
 * Maps any browser language tag to a supported language: "pt", "pt-PT" and "pt-BR"
 * become "pt-BR", "en-US" becomes "en", "es-MX" becomes "es". Anything else falls
 * back to the default language.
 */
export function toSupportedLanguage(tag: string): SupportedLanguage {
  const base = tag.toLowerCase().split('-')[0]
  if (base === 'pt') return 'pt-BR'
  if (base === 'en' || base === 'es') return base
  return DEFAULT_LANGUAGE
}

/** Each language is always shown by its own name, whatever the current language. */
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  'pt-BR': 'Português',
  en: 'English',
  es: 'Español',
}
