import { useId, useRef, type PointerEvent, type ReactNode } from 'react'
import { placeFloating } from '../lib/floating'

const LONG_PRESS_MS = 500

interface TooltipProps {
  text: string
  /** Accessible name of the trigger. Without it, the text describes the trigger's content. */
  label?: string
  className?: string
  children: ReactNode
}

/** A button that shows a text on hover, on keyboard focus and on touch and hold. */
export function Tooltip({ text, label, className = '', children }: TooltipProps) {
  const id = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const bubble = useRef<HTMLSpanElement>(null)
  const holdTimer = useRef<number | undefined>(undefined)

  function show() {
    if (!trigger.current || !bubble.current) return
    bubble.current.togglePopover(true)
    placeFloating(trigger.current, bubble.current)
  }

  function hide() {
    window.clearTimeout(holdTimer.current)
    bubble.current?.togglePopover(false)
  }

  function startPress(event: PointerEvent) {
    if (event.pointerType === 'touch') holdTimer.current = window.setTimeout(show, LONG_PRESS_MS)
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-label={label}
        aria-describedby={label ? undefined : id}
        className={`select-none [-webkit-touch-callout:none] ${className}`}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') show()
        }}
        onPointerLeave={hide}
        onPointerDown={startPress}
        onPointerUp={(event) => {
          if (event.pointerType === 'touch') hide()
        }}
        onPointerCancel={hide}
        onContextMenu={(event) => {
          event.preventDefault()
        }}
        onFocus={(event) => {
          if (event.target.matches(':focus-visible')) show()
        }}
        onBlur={hide}
      >
        {children}
      </button>
      <span
        ref={bubble}
        id={id}
        role="tooltip"
        popover="manual"
        className="absolute m-0 w-max max-w-64 rounded border-2 border-window-border bg-window px-2 py-1 text-sm text-window-foreground"
      >
        {text}
      </span>
    </>
  )
}
