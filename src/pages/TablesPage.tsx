import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/auth-context'
import { TextButton } from '../components/Button'
import { Window } from '../components/Window'
import { supabase } from '../lib/supabase'

/** "Minhas mesas": the list of tables arrives with NT-08. */
export function TablesPage() {
  const { t } = useTranslation()
  const { displayName } = useAuth()

  return (
    <Window>
      <h1 className="text-3xl font-bold text-window-accent">{t('tables.title')}</h1>
      <p className="mt-4">{t('tables.greeting', { name: displayName })}</p>
      <TextButton
        onClick={() => {
          void supabase.auth.signOut()
        }}
      >
        {t('auth.signOut')}
      </TextButton>
    </Window>
  )
}
