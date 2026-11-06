import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Redirect, useLocation } from 'wouter'
import { Button } from '../components/Button'
import { Window } from '../components/Window'
import { supabase } from '../lib/supabase'

interface Invite {
  token: string
  /** Null when the link is invalid, expired or revoked. */
  table: { id: string; name: string; isMember: boolean } | null
}

type InviteError = 'invites.tableFull' | 'invites.invalid' | 'errors.generic'

function joinErrorKey(message: string): InviteError {
  if (message === 'table_full') return 'invites.tableFull'
  if (message === 'invite_invalid') return 'invites.invalid'
  return 'errors.generic'
}

export function InvitePage({ token }: { token: string }) {
  const { t } = useTranslation()
  const [, navigate] = useLocation()
  const [invite, setInvite] = useState<Invite | null>(null)
  const [joining, setJoining] = useState(false)
  const [errorKey, setErrorKey] = useState<InviteError | null>(null)

  useEffect(() => {
    let active = true
    void supabase.rpc('get_invite', { invite_token: token }).then(({ data }) => {
      if (!active) return
      const row = data?.[0]
      setInvite({
        token,
        table: row ? { id: row.table_id, name: row.table_name, isMember: row.is_member } : null,
      })
    })
    return () => {
      active = false
    }
  }, [token])

  async function join() {
    setJoining(true)
    setErrorKey(null)
    const { data, error } = await supabase.rpc('join_table', { invite_token: token })
    setJoining(false)
    if (error) {
      setErrorKey(joinErrorKey(error.message))
      return
    }
    navigate(`/mesas/${data}`)
  }

  if (invite?.token !== token) return null
  if (invite.table?.isMember) return <Redirect to={`/mesas/${invite.table.id}`} replace />

  return (
    <Window>
      <h1 className="text-3xl font-bold text-window-accent">
        {invite.table ? t('invites.title') : t('invites.invalid')}
      </h1>
      {invite.table && (
        <>
          <p className="mt-4">{t('invites.intro', { name: invite.table.name })}</p>
          <Button
            disabled={joining}
            onClick={() => {
              void join()
            }}
          >
            {t('invites.join')}
          </Button>
        </>
      )}
      {errorKey && (
        <p role="alert" className="mt-4 font-bold text-window-accent">
          {t(errorKey)}
        </p>
      )}
      <Link
        href="/mesas"
        className="mt-4 block text-window-accent underline focus-visible:outline-window-accent"
      >
        {t('tables.backToList')}
      </Link>
    </Window>
  )
}
