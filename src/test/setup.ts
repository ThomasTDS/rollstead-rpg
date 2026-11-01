import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import i18n from 'i18next'
import { afterEach, beforeAll } from 'vitest'
import { testI18nReady } from './i18n'

beforeAll(async () => {
  await testI18nReady
})

afterEach(async () => {
  cleanup()
  await i18n.changeLanguage('pt-BR')
})
