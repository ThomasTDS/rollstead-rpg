import { useEffect, useState, type SyntheticEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'wouter'
import { useAuth } from '../auth/auth-context'
import { Button, TextButton } from '../components/Button'
import { Field } from '../components/Field'
import { Window } from '../components/Window'
import { MAX_TABLE_NAME_LENGTH, normalizeName } from '../lib/names'
import { UNIQUE_VIOLATION } from '../lib/postgres-errors'
import { supabase } from '../lib/supabase'

interface TableRow {
  id: string
  name: string
  role: 'master' | 'player'
}

type CreateError = 'tables.invalidName' | 'tables.duplicateName' | 'errors.generic'

export function TablesPage() {
  const { t } = useTranslation()
  const { displayName, session } = useAuth()
  const [, navigate] = useLocation()
  const [tables, setTables] = useState<TableRow[] | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [errorKey, setErrorKey] = useState<CreateError | null>(null)
  const userId = session?.user.id

  useEffect(() => {
    if (!userId) return
    let active = true
    void supabase.rpc('list_my_tables').then(({ data, error }) => {
      if (!active) return
      setLoadFailed(Boolean(error))
      setTables(
        (data ?? []).map((table) => ({
          id: table.id,
          name: table.name,
          role: table.role === 'master' ? 'master' : 'player',
        })),
      )
    })
    return () => {
      active = false
    }
  }, [userId])

  async function createTable(event: SyntheticEvent) {
    event.preventDefault()
    const name = normalizeName(newName, MAX_TABLE_NAME_LENGTH)
    if (name === null) {
      setErrorKey('tables.invalidName')
      return
    }
    setCreating(true)
    setErrorKey(null)
    const { data, error } = await supabase.rpc('create_table', { table_name: name })
    setCreating(false)
    if (error) {
      setErrorKey(error.code === UNIQUE_VIOLATION ? 'tables.duplicateName' : 'errors.generic')
      return
    }
    navigate(`/mesas/${data}`)
  }

  return (
    <Window>
      <h1 className="text-3xl font-bold text-window-accent">{t('tables.title')}</h1>
      <p className="mt-4">{t('tables.greeting', { name: displayName })}</p>

      {loadFailed && (
        <p role="alert" className="mt-4 font-bold text-window-accent">
          {t('errors.generic')}
        </p>
      )}
      {tables?.length === 0 && !loadFailed && <p className="mt-4">{t('tables.empty')}</p>}
      {tables && tables.length > 0 && (
        <ul className="mt-4 space-y-2">
          {tables.map((table) => (
            <li key={table.id}>
              <Link href={`/mesas/${table.id}`} className="text-window-accent underline">
                {table.name}
              </Link>{' '}
              <span>({t(`tables.roles.${table.role}`)})</span>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={(event) => {
          void createTable(event)
        }}
      >
        <Field
          label={t('tables.nameLabel')}
          name="tableName"
          required
          autoComplete="off"
          maxLength={MAX_TABLE_NAME_LENGTH}
          value={newName}
          onChange={(event) => {
            setNewName(event.target.value)
          }}
        />
        <Button type="submit" disabled={creating}>
          {t('tables.create')}
        </Button>
        {errorKey && (
          <p role="alert" className="mt-4 font-bold text-window-accent">
            {t(errorKey, { max: MAX_TABLE_NAME_LENGTH })}
          </p>
        )}
      </form>

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
