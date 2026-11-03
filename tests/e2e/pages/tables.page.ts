import type { Locator, Page } from '@playwright/test'

export class TablesPage {
  readonly page: Page
  readonly title: Locator
  readonly signOutButton: Locator

  constructor(page: Page) {
    this.page = page
    this.title = page.getByRole('heading', { level: 1, name: 'Minhas mesas' })
    this.signOutButton = page.getByRole('button', { name: 'Sair' })
  }

  async goto() {
    await this.page.goto('/mesas')
  }

  greeting(name: string) {
    return this.page.getByText(`Olá, ${name}!`, { exact: true })
  }
}
