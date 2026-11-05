import type { Locator, Page } from '@playwright/test'

export class TablesPage {
  readonly page: Page
  readonly title: Locator
  readonly signOutButton: Locator
  readonly emptyMessage: Locator
  readonly nameInput: Locator
  readonly createButton: Locator

  constructor(page: Page) {
    this.page = page
    this.title = page.getByRole('heading', { level: 1, name: 'Minhas mesas' })
    this.signOutButton = page.getByRole('button', { name: 'Sair' })
    this.emptyMessage = page.getByText('Crie sua primeira mesa.')
    this.nameInput = page.getByLabel('Nome da nova mesa')
    this.createButton = page.getByRole('button', { name: 'Criar mesa' })
  }

  async goto() {
    await this.page.goto('/mesas')
  }

  greeting(name: string) {
    return this.page.getByText(`Olá, ${name}!`, { exact: true })
  }

  async createTable(name: string) {
    await this.nameInput.fill(name)
    await this.createButton.click()
  }

  portrait(label: string) {
    return this.page.getByRole('button', { name: label, exact: true })
  }

  moreButton(count: number) {
    return this.page.getByRole('button', { name: `Mais ${String(count)} participante` })
  }

  tooltip(text: string) {
    return this.page.getByRole('tooltip').filter({ hasText: text })
  }

  /** The list row of a table, with its name and the user's role. */
  row(name: string) {
    return this.page.getByRole('listitem').filter({ hasText: name })
  }
}
