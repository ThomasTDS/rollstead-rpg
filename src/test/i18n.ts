import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '../i18n/locales/en/common.json'
import es from '../i18n/locales/es/common.json'
import ptBR from '../i18n/locales/pt-BR/common.json'

// Synchronous instance for component tests: every language is bundled, no detection.
export const testI18nReady = i18n.use(initReactI18next).init({
  lng: 'pt-BR',
  fallbackLng: false,
  ns: ['common'],
  defaultNS: 'common',
  resources: {
    'pt-BR': { common: ptBR },
    en: { common: en },
    es: { common: es },
  },
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
})
