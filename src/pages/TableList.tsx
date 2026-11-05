import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'wouter'
import type { ParticipantRole } from '../components/Portrait'
import { Tooltip } from '../components/Tooltip'
import { supabase } from '../lib/supabase'
import { TableParticipants, type Participant } from './TableParticipants'

// Long enough not to fight the scroll, short of the portraits' touch and hold
const TOUCH_HOLD_MS = 250
const TOUCH_TOLERANCE_PX = 5

export interface TableRow {
  id: string
  name: string
  role: ParticipantRole
  created_at: string
  participants: Participant[]
}

interface TableListProps {
  tables: TableRow[]
  onReordered: (tables: TableRow[]) => void
}

export function TableList({ tables, onReordered }: TableListProps) {
  const { t } = useTranslation()
  const [failed, setFailed] = useState(false)
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: TOUCH_HOLD_MS, tolerance: TOUCH_TOLERANCE_PX },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const announcements = useMemo<Announcements>(() => {
    const nameOf = (id: UniqueIdentifier) => tables.find((table) => table.id === id)?.name ?? ''
    const positionOf = (id: UniqueIdentifier) => tables.findIndex((table) => table.id === id) + 1
    return {
      onDragStart: ({ active }) => t('tables.reorder.picked', { name: nameOf(active.id) }),
      // A table starts over itself: announcing that would cut off the pick up message
      onDragOver: ({ active, over }) =>
        over && over.id !== active.id
          ? t('tables.reorder.over', { name: nameOf(active.id), position: positionOf(over.id) })
          : undefined,
      onDragEnd: ({ active, over }) =>
        over
          ? t('tables.reorder.dropped', { name: nameOf(active.id), position: positionOf(over.id) })
          : t('tables.reorder.cancelled', { name: nameOf(active.id) }),
      onDragCancel: ({ active }) => t('tables.reorder.cancelled', { name: nameOf(active.id) }),
    }
  }, [tables, t])

  async function moved({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const from = tables.findIndex((table) => table.id === active.id)
    const to = tables.findIndex((table) => table.id === over.id)
    const reordered = arrayMove(tables, from, to)
    setFailed(false)
    onReordered(reordered)
    const { error } = await supabase.rpc('reorder_my_tables', {
      table_ids: reordered.map((table) => table.id),
    })
    if (error) {
      setFailed(true)
      onReordered(tables)
    }
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        accessibility={{
          announcements,
          screenReaderInstructions: { draggable: t('tables.reorder.instructions') },
        }}
        onDragEnd={(event) => {
          void moved(event)
        }}
      >
        <SortableContext items={tables} strategy={verticalListSortingStrategy}>
          <ul className="mt-4 space-y-6">
            {tables.map((table) => (
              <TableItem key={table.id} table={table} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      {failed && (
        <p role="alert" className="mt-4 font-bold text-window-accent">
          {t('errors.generic')}
        </p>
      )}
    </>
  )
}

function TableItem({ table }: { table: TableRow }) {
  const { t, i18n } = useTranslation()
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: table.id })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={`flex gap-2 ${isDragging ? 'opacity-70' : ''}`}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={t('tables.reorder.handle', { name: table.name })}
        className="flex h-10 w-8 shrink-0 cursor-grab touch-manipulation items-start justify-center opacity-60 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-window-accent"
        {...attributes}
        {...listeners}
      >
        <svg viewBox="0 0 12 24" aria-hidden="true" className="h-6 w-3 fill-current">
          <circle cx="3" cy="6" r="1.5" />
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="3" cy="12" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="3" cy="18" r="1.5" />
          <circle cx="9" cy="18" r="1.5" />
        </svg>
      </button>
      <div className="min-w-0">
        <Link href={`/mesas/${table.id}`} className="text-window-accent underline">
          {table.name}
        </Link>{' '}
        <span>({t(`tables.roles.${table.role}`)})</span>
        <TableParticipants participants={table.participants} />
        <Tooltip
          text={t('tables.createdOn', {
            date: new Date(table.created_at).toLocaleDateString(i18n.resolvedLanguage),
          })}
          className="mt-2 block text-sm focus-visible:outline-window-accent"
        >
          {t('tables.noSessions')}
        </Tooltip>
      </div>
    </li>
  )
}
