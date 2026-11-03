import type { ButtonHTMLAttributes } from 'react'

export const primaryButtonClass =
  'inline-block rounded bg-window-accent px-4 py-2 font-bold text-window focus-visible:outline-window-accent disabled:opacity-60'

/** Main action of a Window. */
export function Button({ type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={`mt-6 ${primaryButtonClass}`} {...props} />
}

/** Secondary action of a Window, shown as a link. */
export function TextButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="mt-4 block text-window-accent underline focus-visible:outline-window-accent"
      {...props}
    />
  )
}
