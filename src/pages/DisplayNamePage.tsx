import { useState, type SyntheticEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/auth-context'
import { Button } from '../components/Button'
import { Field } from '../components/Field'
import { Window } from '../components/Window'
import { MAX_DISPLAY_NAME_LENGTH, normalizeDisplayName } from '../lib/display-name'
import { supabase } from '../lib/supabase'

export function DisplayNamePage() {
  const { t } = useTranslation()
  const { session, setDisplayName } = useAuth()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorKey, setErrorKey] = useState<'profile.invalidName' | 'errors.generic' | null>(null)

  async function save(event: SyntheticEvent) {
    event.preventDefault()
    const displayName = normalizeDisplayName(name)
    if (!session || displayName === null) {
      setErrorKey('profile.invalidName')
      return
    }
    setSaving(true)
    setErrorKey(null)
    const { error } = await supabase
      .from('profiles')
      .insert({ id: session.user.id, display_name: displayName })
    setSaving(false)
    if (error) {
      setErrorKey('errors.generic')
      return
    }
    setDisplayName(displayName)
  }

  return (
    <Window>
      <h1 className="text-3xl font-bold text-window-accent">{t('profile.title')}</h1>
      <form
        onSubmit={(event) => {
          void save(event)
        }}
      >
        <p className="mt-4">{t('profile.intro')}</p>
        <Field
          label={t('profile.nameLabel')}
          name="displayName"
          required
          autoComplete="nickname"
          maxLength={MAX_DISPLAY_NAME_LENGTH}
          value={name}
          onChange={(event) => {
            setName(event.target.value)
          }}
        />
        <Button type="submit" disabled={saving}>
          {t('profile.save')}
        </Button>
        {errorKey && (
          <p role="alert" className="mt-4 font-bold text-window-accent">
            {t(errorKey, { max: MAX_DISPLAY_NAME_LENGTH })}
          </p>
        )}
      </form>
    </Window>
  )
}
