import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { isSupportedLanguage, LANGUAGE_NAMES, SUPPORTED_LANGUAGES } from '../i18n/languages'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const selectId = useId()

  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor={selectId} className="text-muted">
        {t('language.label')}
      </label>
      <select
        id={selectId}
        className="rounded border border-border bg-background px-2 py-1 text-foreground"
        value={i18n.resolvedLanguage}
        onChange={(event) => {
          const language = event.target.value
          if (isSupportedLanguage(language)) void i18n.changeLanguage(language)
        }}
      >
        {SUPPORTED_LANGUAGES.map((language) => (
          <option key={language} value={language} lang={language}>
            {LANGUAGE_NAMES[language]}
          </option>
        ))}
      </select>
    </div>
  )
}
