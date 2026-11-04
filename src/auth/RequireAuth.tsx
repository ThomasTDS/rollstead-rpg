import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Redirect, useLocation } from 'wouter'
import { Window } from '../components/Window'
import { DisplayNamePage } from '../pages/DisplayNamePage'
import { useAuth } from './auth-context'

/** Sends visitors to the login and first-time users to the display name step. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { loading, session, displayName, profileFailed } = useAuth()
  const [location] = useLocation()

  if (loading) return null
  if (!session) {
    // Comes back here after signing in. Keeps the hash: a rejected magic link carries its error
    const login = `/entrar?next=${encodeURIComponent(location)}${window.location.hash}`
    return <Redirect to={login} replace />
  }
  if (profileFailed) {
    return (
      <Window>
        <p role="alert">{t('errors.generic')}</p>
      </Window>
    )
  }
  if (displayName === null) return <DisplayNamePage />

  return children
}
