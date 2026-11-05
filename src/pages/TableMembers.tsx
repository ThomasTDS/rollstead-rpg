import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/auth-context'
import { Button, TextButton } from '../components/Button'
import { supabase } from '../lib/supabase'

interface Member {
  userId: string
  name: string
}

interface LoadedMembers {
  tableId: string
  list: Member[]
}

/** The seats of a table, for its master. Masters always hold the first one. */
export function TableMembers({ tableId }: { tableId: string }) {
  const { t } = useTranslation()
  const { session } = useAuth()
  const [members, setMembers] = useState<LoadedMembers | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [removing, setRemoving] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    void supabase.rpc('list_table_seats', { target_table: tableId }).then(({ data, error }) => {
      if (!active) return
      if (error) setFailed(true)
      setMembers({
        tableId,
        list: (data ?? []).map((seat) => ({ userId: seat.user_id, name: seat.display_name })),
      })
    })
    return () => {
      active = false
    }
  }, [tableId])

  async function remove(userId: string) {
    setRemoving(true)
    setFailed(false)
    const { error } = await supabase
      .from('table_members')
      .delete()
      .eq('table_id', tableId)
      .eq('user_id', userId)
    setRemoving(false)
    if (error) {
      setFailed(true)
      return
    }
    // A player who left in the meantime reaches no row, and the outcome is the same
    setConfirming(null)
    setMembers(
      (current) =>
        current && { ...current, list: current.list.filter((member) => member.userId !== userId) },
    )
  }

  if (members?.tableId !== tableId) return null

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold text-window-accent">{t('manage.membersTitle')}</h3>
      <ul className="mt-2 space-y-2">
        {members.list.map((member) => {
          const isMaster = member.userId === session?.user.id
          return (
            <li key={member.userId}>
              {member.name} <span>({t(`tables.roles.${isMaster ? 'master' : 'player'}`)})</span>
              {!isMaster && confirming !== member.userId && (
                <TextButton
                  aria-label={t('manage.removeOpen', { name: member.name })}
                  onClick={() => {
                    setConfirming(member.userId)
                  }}
                >
                  {t('manage.remove')}
                </TextButton>
              )}
              {confirming === member.userId && (
                <>
                  <p className="mt-2">{t('manage.removeWarning', { name: member.name })}</p>
                  <Button
                    disabled={removing}
                    onClick={() => {
                      void remove(member.userId)
                    }}
                  >
                    {t('manage.removeConfirm')}
                  </Button>
                  <TextButton
                    onClick={() => {
                      setConfirming(null)
                    }}
                  >
                    {t('manage.deleteCancel')}
                  </TextButton>
                </>
              )}
            </li>
          )
        })}
      </ul>
      {failed && (
        <p role="alert" className="mt-4 font-bold text-window-accent">
          {t('errors.generic')}
        </p>
      )}
    </div>
  )
}
