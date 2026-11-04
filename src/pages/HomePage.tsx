import { useTranslation } from 'react-i18next'
import { Link, Redirect } from 'wouter'
import { useAuth } from '../auth/auth-context'
import { primaryButtonClass } from '../components/Button'
import { Window } from '../components/Window'

export function HomePage() {
  const { t } = useTranslation()
  const { session } = useAuth()

  if (session) return <Redirect to="/mesas" replace />

  return (
    <Window>
      <h1 className="text-4xl font-bold text-window-accent">{t('app.name')}</h1>
      <p className="mt-4 text-xl">{t('app.tagline')}</p>
      <p className="mt-2">{t('app.description')}</p>
      <Link href="/entrar" className={`mt-6 ${primaryButtonClass}`}>
        {t('auth.signIn')}
      </Link>
    </Window>
  )
}
