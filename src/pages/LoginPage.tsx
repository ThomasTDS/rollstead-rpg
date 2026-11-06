import { useState, type SyntheticEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Redirect, useSearch } from 'wouter'
import { useAuth } from '../auth/auth-context'
import { authErrorKey, type AuthErrorKey } from '../auth/auth-errors'
import { safeNextPath } from '../auth/next-path'
import { Button, TextButton } from '../components/Button'
import { Field } from '../components/Field'
import { Window } from '../components/Window'
import { supabase } from '../lib/supabase'
import { TestLogin } from './TestLogin'

const CODE_LENGTH = 6
const TEST_LOGIN = import.meta.env.VITE_TEST_LOGIN === 'true'

export function LoginPage() {
  const { t } = useTranslation()
  const { session } = useAuth()
  const next = safeNextPath(new URLSearchParams(useSearch()).get('next'))
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [errorKey, setErrorKey] = useState<AuthErrorKey | 'auth.errors.invalidLink' | null>(() =>
    window.location.hash.includes('error_code=') ? 'auth.errors.invalidLink' : null,
  )

  if (session) return <Redirect to={next} replace />

  async function requestCode(event: SyntheticEvent) {
    event.preventDefault()
    setSending(true)
    setErrorKey(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}${next}` },
    })
    setSending(false)
    if (error) {
      setErrorKey(authErrorKey(error.code))
      return
    }
    setCodeSent(true)
  }

  async function verifyCode(event: SyntheticEvent) {
    event.preventDefault()
    setSending(true)
    setErrorKey(null)
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
    setSending(false)
    if (error) setErrorKey(authErrorKey(error.code))
  }

  return (
    <Window>
      <h1 className="text-3xl font-bold text-window-accent">{t('auth.signIn')}</h1>

      {codeSent ? (
        <form
          onSubmit={(event) => {
            void verifyCode(event)
          }}
        >
          <p className="mt-4">{t('auth.codeSent', { email })}</p>
          <Field
            label={t('auth.codeLabel')}
            name="code"
            required
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]*"
            minLength={CODE_LENGTH}
            maxLength={CODE_LENGTH}
            value={code}
            onChange={(event) => {
              setCode(event.target.value)
            }}
          />
          <Button type="submit" disabled={sending}>
            {t('auth.verifyCode')}
          </Button>
          <TextButton
            onClick={() => {
              setCodeSent(false)
              setCode('')
              setErrorKey(null)
            }}
          >
            {t('auth.useAnotherEmail')}
          </TextButton>
        </form>
      ) : (
        <form
          onSubmit={(event) => {
            void requestCode(event)
          }}
        >
          <p className="mt-4">{t('auth.intro')}</p>
          <Field
            label={t('auth.emailLabel')}
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
            }}
          />
          <Button type="submit" disabled={sending}>
            {t('auth.sendCode')}
          </Button>
        </form>
      )}

      {errorKey && (
        <p role="alert" className="mt-4 font-bold text-window-accent">
          {t(errorKey)}
        </p>
      )}

      {TEST_LOGIN && <TestLogin />}
    </Window>
  )
}
