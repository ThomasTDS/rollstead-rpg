import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'wouter'
import { Window } from '../components/Window'
import { supabase } from '../lib/supabase'

interface LoadedTable {
  id: string
  name: string | null
}

/** Row level security answers "not found" for anyone outside the table. */
export function TablePage({ id }: { id: string }) {
  const { t } = useTranslation()
  const [table, setTable] = useState<LoadedTable | null>(null)

  useEffect(() => {
    let active = true
    void supabase
      .from('game_tables')
      .select('name')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setTable({ id, name: data?.name ?? null })
      })
    return () => {
      active = false
    }
  }, [id])

  if (table?.id !== id) return null

  return (
    <Window>
      <h1 className="text-3xl font-bold text-window-accent">
        {table.name ?? t('tables.notFound')}
      </h1>
      <Link href="/mesas" className="mt-4 block text-window-accent underline">
        {t('tables.backToList')}
      </Link>
    </Window>
  )
}
