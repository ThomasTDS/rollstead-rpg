import type { Locator, Page } from '@playwright/test'

export class TablePage {
  readonly notFound: Locator
  readonly backLink: Locator
  readonly manageTitle: Locator
  readonly generateButton: Locator
  readonly regenerateButton: Locator
  readonly revokeButton: Locator
  readonly copyButton: Locator
  readonly linkInput: Locator
  readonly activeMessage: Locator
  private readonly page: Page

  constructor(page: Page) {
    this.page = page
    this.notFound = page.getByRole('heading', { level: 1, name: 'Mesa não encontrada' })
    this.backLink = page.getByRole('link', { name: 'Voltar para Minhas mesas' })
    this.manageTitle = page.getByRole('heading', { level: 2, name: 'Gerenciar mesa' })
    this.generateButton = page.getByRole('button', { name: 'Gerar link de convite' })
    this.regenerateButton = page.getByRole('button', { name: 'Gerar novo link' })
    this.revokeButton = page.getByRole('button', { name: 'Revogar link' })
    this.copyButton = page.getByRole('button', { name: 'Copiar link' })
    this.linkInput = page.getByLabel('Link de convite')
    this.activeMessage = page.getByText(/link de convite ativo até/)
  }

  title(name: string) {
    return this.page.getByRole('heading', { level: 1, name })
  }

  /** Generates the invite and returns its path, read from the one time it is shown. */
  async generateInvite() {
    await this.generateButton.click()
    await this.linkInput.waitFor()
    return new URL(await this.linkInput.inputValue()).pathname
  }
}
