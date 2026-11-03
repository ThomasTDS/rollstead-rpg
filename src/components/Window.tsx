import type { ReactNode } from 'react'

/** The JRPG menu window every screen is built on. */
export function Window({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border-4 border-window-border bg-window p-8 text-window-foreground">
      {children}
    </div>
  )
}
