import { useId, useRef, type ToggleEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Portrait, type ParticipantRole } from '../components/Portrait'
import { Tooltip } from '../components/Tooltip'
import { placeFloating } from '../lib/floating'

const MAX_PORTRAITS = 6

export interface Participant {
  display_name: string
  role: ParticipantRole
}

/** The people at a table. list_my_tables already brings them in display order. */
export function TableParticipants({ participants }: { participants: Participant[] }) {
  const { t } = useTranslation()
  const visible = participants.slice(0, MAX_PORTRAITS)
  const others = participants.slice(MAX_PORTRAITS)

  return (
    <ul aria-label={t('tables.participants')} className="mt-2 flex flex-wrap items-center gap-2">
      {visible.map(({ display_name: name, role }, index) => (
        // Names can repeat and the list carries no ids: the order is the identity here
        <li key={`${String(index)}-${name}`} className="flex">
          <Tooltip
            label={t(`tables.portrait.${role}`, { name })}
            text={role === 'master' ? t('tables.masterName', { name }) : name}
            className="rounded-full focus-visible:outline-window-accent"
          >
            <Portrait role={role} />
          </Tooltip>
        </li>
      ))}
      {others.length > 0 && (
        <li className="flex">
          <OtherParticipants participants={others} />
        </li>
      )}
    </ul>
  )
}

function OtherParticipants({ participants }: { participants: Participant[] }) {
  const { t } = useTranslation()
  const id = useId()
  const button = useRef<HTMLButtonElement>(null)

  // The toggle event runs after the popover opens: it stays invisible until it is in place
  function toggled(event: ToggleEvent<HTMLDivElement>) {
    if (!button.current) return
    const popover = event.currentTarget
    if (event.newState === 'open') {
      placeFloating(button.current, popover)
      popover.style.visibility = 'visible'
    } else {
      popover.style.visibility = ''
      button.current.focus()
    }
  }

  return (
    <>
      <button
        ref={button}
        type="button"
        popoverTarget={id}
        aria-label={t('tables.moreParticipants', { count: participants.length })}
        className="size-10 rounded-full border-3 border-portrait-player font-bold focus-visible:outline-window-accent"
      >
        +{participants.length}
      </button>
      <div
        id={id}
        popover="auto"
        onToggle={toggled}
        className="invisible absolute m-0 w-max max-w-64 rounded border-2 border-window-border bg-window p-3 text-window-foreground"
      >
        <ul className="space-y-2">
          {participants.map(({ display_name: name, role }, index) => (
            <li key={`${String(index)}-${name}`} className="flex items-center gap-2">
              <Portrait role={role} />
              <span className="break-words">{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
