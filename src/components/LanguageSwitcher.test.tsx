import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('LanguageSwitcher', () => {
  it('switches the interface language', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByText('A sessão acaba. A história fica.')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Idioma'), 'English')

    expect(await screen.findByText('Play the session. Keep the story.')).toBeInTheDocument()
    expect(screen.getByLabelText('Language')).toHaveValue('en')
  })
})
