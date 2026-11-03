import { useId, type InputHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

/** Labeled text input for forms inside a Window. */
export function Field({ label, ...inputProps }: FieldProps) {
  const inputId = useId()

  return (
    <div className="mt-6">
      <label htmlFor={inputId} className="block font-bold">
        {label}
      </label>
      <input
        id={inputId}
        className="mt-2 w-full rounded border-2 border-window-border bg-background px-3 py-2 text-foreground focus-visible:outline-window-accent"
        {...inputProps}
      />
    </div>
  )
}
