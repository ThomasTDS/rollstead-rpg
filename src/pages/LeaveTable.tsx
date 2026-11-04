import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'wouter'
import { Button, TextButton } from '../components/Button'
import { supabase } from '../lib/supabase'

interface LeaveTableProps {
  tableId: string
  userId: string
  /** The seat was already gone: the master removed this player while the page was open. */
  onAlreadyRemoved: () => void
}

export function LeaveTable({ tableId, userId, onAlreadyRemoved }: LeaveTableProps) {
  const { t } = useTranslation()
  const [, navigate] = useLocation()
  const [confirming, setConfirming] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [failed, setFailed] = useState(false)

  async function leave() {
    setLeaving(true)
    setFailed(false)
    const { data, error } = await supabase
      .from('table_members')
      .delete()
      .eq('table_id', tableId)
      .eq('user_id', userId)
      .select('user_id')
    setLeaving(false)
    if (error) {
      setFailed(true)
      return
    }
    if (data.length === 0) {
      onAlreadyRemoved()
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
        {t('tables.leaveOpen')}
      </TextButton>
    )
  }

  return (
    <div className="mt-6">
      <p>{t('tables.leaveWarning')}</p>
      <Button
        disabled={leaving}
        onClick={() => {
          void leave()
        }}
      >
        {t('tables.leaveConfirm')}
      </Button>
      <TextButton
        onClick={() => {
          setConfirming(false)
        }}
      >
        {t('manage.deleteCancel')}
      </TextButton>
      {failed && (
        <p role="alert" className="mt-4 font-bold text-window-accent">
          {t('errors.generic')}
        </p>
      )}
    </div>
  )
}
