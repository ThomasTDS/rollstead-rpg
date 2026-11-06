import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'wouter'
import { useAuth } from '../auth/auth-context'
import { Window } from '../components/Window'
import { supabase } from '../lib/supabase'
import { LeaveTable } from './LeaveTable'
import { ManageTable } from './ManageTable'

interface LoadedTable {
  id: string
  /** Null when the user is not a member: to them, the table does not exist. */
  seat: { name: string; isMaster: boolean } | null
}

export function TablePage({ id }: { id: string }) {
  const { t } = useTranslation()
  const { session } = useAuth()
  const [table, setTable] = useState<LoadedTable | null>(null)
  const userId = session?.user.id

  useEffect(() => {
    if (!userId) return
    let active = true
    void supabase
      .rpc('list_my_tables')
      .select('name, role')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) {
          setTable({
            id,
            seat: data ? { name: data.name, isMaster: data.role === 'master' } : null,
          })
        }
      })
    return () => {
      active = false
    }
  }, [id, userId])

  if (table?.id !== id) return null

  return (
    <Window>
      <h1 className="text-3xl font-bold text-window-accent">
        {table.seat?.name ?? t('tables.notFound')}
      </h1>
      {table.seat?.isMaster && (
        <ManageTable
          tableId={id}
          tableName={table.seat.name}
          onRenamed={(name) => {
            setTable({ id, seat: { name, isMaster: true } })
          }}
        />
      )}
      {table.seat && !table.seat.isMaster && userId && (
        <LeaveTable
          tableId={id}
          userId={userId}
          onAlreadyRemoved={() => {
            setTable({ id, seat: null })
          }}
        />
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
