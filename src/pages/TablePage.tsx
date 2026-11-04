import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'wouter'
import { useAuth } from '../auth/auth-context'
import { Window } from '../components/Window'
import type { Database } from '../lib/database.types'
import { supabase } from '../lib/supabase'
import { ManageTable } from './ManageTable'

interface LoadedTable {
  id: string
  /** Null when the user is not a member: to them, the table does not exist. */
  seat: { name: string; role: Database['public']['Enums']['table_role'] } | null
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
      .from('table_members')
      .select('role, game_tables(name)')
      .eq('table_id', id)
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) {
          setTable({
            id,
            seat: data ? { name: data.game_tables.name, role: data.role } : null,
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
      {table.seat?.role === 'master' && <ManageTable tableId={id} />}
      <Link href="/mesas" className="mt-4 block text-window-accent underline">
        {t('tables.backToList')}
      </Link>
    </Window>
  )
}
