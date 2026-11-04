import type { Locator, Page } from '@playwright/test'

export class TablePage {
  readonly notFound: Locator
  readonly backLink: Locator
  private readonly page: Page

  constructor(page: Page) {
    this.page = page
    this.notFound = page.getByRole('heading', { level: 1, name: 'Mesa não encontrada' })
    this.backLink = page.getByRole('link', { name: 'Voltar para Minhas mesas' })
  }

  title(name: string) {
    return this.page.getByRole('heading', { level: 1, name })
  }
}
