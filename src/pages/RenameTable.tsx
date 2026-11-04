import { useState, type SyntheticEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/Button'
import { Field } from '../components/Field'
import { MAX_TABLE_NAME_LENGTH, normalizeName } from '../lib/names'
import { UNIQUE_VIOLATION } from '../lib/postgres-errors'
import { supabase } from '../lib/supabase'

type RenameError = 'tables.invalidName' | 'tables.duplicateName' | 'errors.generic'

interface RenameTableProps {
  tableId: string
  tableName: string
  onRenamed: (name: string) => void
}

export function RenameTable({ tableId, tableName, onRenamed }: RenameTableProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(tableName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errorKey, setErrorKey] = useState<RenameError | null>(null)

  async function rename(event: SyntheticEvent) {
    event.preventDefault()
    const newName = normalizeName(name, MAX_TABLE_NAME_LENGTH)
    setSaved(false)
    if (newName === null) {
      setErrorKey('tables.invalidName')
      return
    }
    setSaving(true)
    setErrorKey(null)
    const { error } = await supabase.from('game_tables').update({ name: newName }).eq('id', tableId)
    setSaving(false)
    if (error) {
      setErrorKey(error.code === UNIQUE_VIOLATION ? 'tables.duplicateName' : 'errors.generic')
      return
    }
    setName(newName)
    setSaved(true)
    onRenamed(newName)
  }

  return (
    <form
      onSubmit={(event) => {
        void rename(event)
      }}
    >
      <Field
        label={t('manage.renameLabel')}
        name="tableName"
        required
        autoComplete="off"
        maxLength={MAX_TABLE_NAME_LENGTH}
        value={name}
        onChange={(event) => {
          setName(event.target.value)
          setSaved(false)
        }}
      />
      <Button type="submit" disabled={saving}>
        {t('manage.rename')}
      </Button>
      {saved && (
        <p role="status" className="mt-4">
          {t('manage.renamed')}
        </p>
      )}
      {errorKey && (
        <p role="alert" className="mt-4 font-bold text-window-accent">
          {t(errorKey, { max: MAX_TABLE_NAME_LENGTH })}
        </p>
      )}
    </form>
  )
}
