import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './components/LanguageSwitcher'

function App() {
  const { t } = useTranslation()

  return (
    <>
      <header>
        <LanguageSwitcher />
      </header>
      <main>
        <h1>{t('app.name')}</h1>
        <p>{t('app.tagline')}</p>
        <p>{t('app.description')}</p>
      </main>
    </>
  )
}

export default App
