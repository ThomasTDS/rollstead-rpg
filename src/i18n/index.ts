import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next'
import { LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES, toSupportedLanguage } from './languages'

i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language
})

// Only the active language is downloaded: each locale file becomes its own chunk.
// No fallback language is loaded; a test guarantees every key exists in every language.
i18n
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`),
    ),
  )
  .use(initReactI18next)
  .init({
    supportedLngs: SUPPORTED_LANGUAGES,
    fallbackLng: false,
    load: 'currentOnly',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
      convertDetectedLanguage: toSupportedLanguage,
    },
  })
  .catch((error: unknown) => {
    console.error('Failed to initialize translations', error)
  })

export default i18n
