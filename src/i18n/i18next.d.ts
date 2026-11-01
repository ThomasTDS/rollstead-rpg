import 'i18next'
import type common from './locales/pt-BR/common.json'

// pt-BR is the source language: keys are type-checked against it.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof common
    }
  }
}
