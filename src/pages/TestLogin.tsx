import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TextButton } from '../components/Button'
import { supabase } from '../lib/supabase'

// The accounts of supabase/seed.sql. They exist only locally and in staging, and this
// file is left out of the production bundle (the quality job in ci.yml checks it).
const PASSWORD = 'rollstead-teste'

const ACCOUNTS = [
  { name: 'Ana', email: 'ana@teste.rollstead.com.br', role: 'master' },
  { name: 'Bia', email: 'bia@teste.rollstead.com.br', role: 'player' },
  { name: 'Caio', email: 'caio@teste.rollstead.com.br', role: 'player' },
] as const

/** One click login for manual tests, shown only in builds with VITE_TEST_LOGIN. */
export function TestLogin() {
  const { t } = useTranslation()
  const [failed, setFailed] = useState(false)

  async function enter(email: string) {
    setFailed(false)
    const { error } = await supabase.auth.signInWithPassword({ email, password: PASSWORD })
    if (error) setFailed(true)
  }

  return (
    <section className="mt-8 border-t-2 border-window-border pt-6">
      <h2 className="text-xl font-bold text-window-accent">{t('auth.testLogin')}</h2>
      {ACCOUNTS.map(({ name, email, role }) => (
        <TextButton
          key={email}
          onClick={() => {
            void enter(email)
          }}
        >
          {t('auth.testLoginAs', { name, role: t(`tables.roles.${role}`) })}
        </TextButton>
      ))}
      {failed && (
        <p role="alert" className="mt-4 font-bold text-window-accent">
          {t('errors.generic')}
        </p>
      )}
    </section>
  )
}
