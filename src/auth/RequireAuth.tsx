import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Redirect } from 'wouter'
import { Window } from '../components/Window'
import { DisplayNamePage } from '../pages/DisplayNamePage'
import { useAuth } from './auth-context'

/** Sends visitors to the login and first-time users to the display name step. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { loading, session, displayName, profileFailed } = useAuth()

  if (loading) return null
  // Keeps the hash: a rejected magic link comes back with its error in it
  if (!session) return <Redirect to={`/entrar${window.location.hash}`} replace />
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
