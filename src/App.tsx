import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './components/LanguageSwitcher'

function App() {
  const { t } = useTranslation()

  return (
    <>
      <header className="flex justify-end p-4">
        <LanguageSwitcher />
      </header>
      <main className="mx-auto max-w-xl px-4 py-12">
        <div className="rounded-lg border-4 border-window-border bg-window p-8 text-window-foreground">
          <h1 className="text-4xl font-bold text-window-accent">{t('app.name')}</h1>
          <p className="mt-4 text-xl">{t('app.tagline')}</p>
          <p className="mt-2">{t('app.description')}</p>
        </div>
      </main>
    </>
  )
}

export default App
