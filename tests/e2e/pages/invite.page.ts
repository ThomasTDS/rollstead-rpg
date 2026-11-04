import type { Locator, Page } from '@playwright/test'

export class InvitePage {
  readonly joinButton: Locator
  readonly invalidTitle: Locator
  private readonly page: Page

  constructor(page: Page) {
    this.page = page
    this.joinButton = page.getByRole('button', { name: 'Entrar na mesa' })
    this.invalidTitle = page.getByRole('heading', {
      level: 1,
      name: 'Este convite é inválido, expirou ou foi revogado.',
    })
  }

  intro(tableName: string) {
    return this.page.getByText(`Você foi convidado para a mesa ${tableName}.`)
  }
}
