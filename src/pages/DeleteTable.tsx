import { useState, type SyntheticEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'wouter'
import { Button, TextButton } from '../components/Button'
import { Field } from '../components/Field'
import { supabase } from '../lib/supabase'

interface DeleteTableProps {
  tableId: string
  tableName: string
}

export function DeleteTable({ tableId, tableName }: DeleteTableProps) {
  const { t } = useTranslation()
  const [, navigate] = useLocation()
  const [confirming, setConfirming] = useState(false)
  const [typedName, setTypedName] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [failed, setFailed] = useState(false)

  async function deleteTable(event: SyntheticEvent) {
    event.preventDefault()
    setDeleting(true)
    setFailed(false)
    const { error } = await supabase.from('game_tables').delete().eq('id', tableId)
    setDeleting(false)
    if (error) {
      setFailed(true)
      return
    }
    navigate('/mesas')
  }

  if (!confirming) {
    return (
      <TextButton
        onClick={() => {
          setConfirming(true)
        }}
      >
        {t('manage.deleteOpen')}
      </TextButton>
    )
  }

  return (
    <form
      className="mt-6"
      onSubmit={(event) => {
        void deleteTable(event)
      }}
    >
      <p>{t('manage.deleteWarning')}</p>
      <Field
        label={t('manage.deleteConfirmLabel', { name: tableName })}
        name="confirmTableName"
        required
        autoComplete="off"
        value={typedName}
        onChange={(event) => {
          setTypedName(event.target.value)
        }}
      />
      <Button type="submit" disabled={deleting || typedName.trim() !== tableName}>
        {t('manage.deleteConfirm')}
      </Button>
      <TextButton
        onClick={() => {
          setConfirming(false)
          setTypedName('')
        }}
      >
        {t('manage.deleteCancel')}
      </TextButton>
      {failed && (
        <p role="alert" className="mt-4 font-bold text-window-accent">
          {t('errors.generic')}
        </p>
      )}
    </form>
  )
}
