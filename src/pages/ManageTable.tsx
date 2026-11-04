import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, TextButton } from '../components/Button'
import { Field } from '../components/Field'
import { supabase } from '../lib/supabase'
import { DeleteTable } from './DeleteTable'
import { RenameTable } from './RenameTable'
import { TableMembers } from './TableMembers'

interface InviteState {
  tableId: string
  expiresAt: string | null
}

interface ManageTableProps {
  tableId: string
  tableName: string
  onRenamed: (name: string) => void
}

/** Master-only area (NT-10). Row level security also refuses all of this to players. */
export function ManageTable({ tableId, tableName, onRenamed }: ManageTableProps) {
  const { t, i18n } = useTranslation()
  const [invite, setInvite] = useState<InviteState | null>(null)
  // The plain link exists only here, right after generating it: the database keeps a hash
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [working, setWorking] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    void supabase
      .from('table_invites')
      .select('expires_at')
      .eq('table_id', tableId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setInvite({ tableId, expiresAt: data?.expires_at ?? null })
      })
    return () => {
      active = false
    }
  }, [tableId])

  async function generate() {
    setWorking(true)
    setFailed(false)
    const { data, error } = await supabase.rpc('create_invite', { target_table: tableId })
    setWorking(false)
    if (error) {
      setFailed(true)
      return
    }
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    setInvite({ tableId, expiresAt })
    setLink(`${window.location.origin}/convite/${data}`)
    setCopied(false)
  }

  async function revoke() {
    setWorking(true)
    setFailed(false)
    const { error } = await supabase.rpc('revoke_invite', { target_table: tableId })
    setWorking(false)
    if (error) {
      setFailed(true)
      return
    }
    setInvite({ tableId, expiresAt: null })
    setLink(null)
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
  }

  if (invite?.tableId !== tableId) return null

  const expiryDate =
    invite.expiresAt && new Date(invite.expiresAt).toLocaleDateString(i18n.resolvedLanguage)

  return (
    <section className="mt-8 border-t-2 border-window-border pt-6">
      <h2 className="text-2xl font-bold text-window-accent">{t('manage.title')}</h2>

      {link && (
        <>
          <Field label={t('manage.linkLabel')} name="inviteLink" readOnly value={link} />
          <p className="mt-2">{t('manage.linkOnce')}</p>
          <Button
            onClick={() => {
              void copy(link)
            }}
          >
            {copied ? t('manage.copied') : t('manage.copy')}
          </Button>
        </>
      )}

      {expiryDate && !link && <p className="mt-4">{t('manage.active', { date: expiryDate })}</p>}
      {!expiryDate && <p className="mt-4">{t('manage.noInvite')}</p>}

      {!link && (
        <Button
          disabled={working}
          onClick={() => {
            void generate()
          }}
        >
          {expiryDate ? t('manage.regenerate') : t('manage.generate')}
        </Button>
      )}
      {expiryDate && (
        <TextButton
          disabled={working}
          onClick={() => {
            void revoke()
          }}
        >
          {t('manage.revoke')}
        </TextButton>
      )}

      {failed && (
        <p role="alert" className="mt-4 font-bold text-window-accent">
          {t('errors.generic')}
        </p>
      )}

      <TableMembers tableId={tableId} />
      <RenameTable tableId={tableId} tableName={tableName} onRenamed={onRenamed} />
      <DeleteTable tableId={tableId} tableName={tableName} />
    </section>
  )
}
