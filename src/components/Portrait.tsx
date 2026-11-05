export type ParticipantRole = 'master' | 'player'

/** Round portrait, gold for the master and silver for players. Generic until NT-78. */
export function Portrait({ role }: { role: ParticipantRole }) {
  const outline = role === 'master' ? 'border-portrait-master' : 'border-portrait-player'
  return (
    <span
      className={`inline-flex size-10 items-center justify-center rounded-full border-3 ${outline}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-7 fill-current">
        <circle cx="12" cy="8" r="4.5" />
        <path d="M3 22c0-5 4-8.5 9-8.5s9 3.5 9 8.5z" />
      </svg>
    </span>
  )
}
