import type { Locator, Page } from '@playwright/test'

export class HomePage {
  readonly page: Page
  readonly title: Locator
  readonly tagline: Locator
  readonly languageSelect: Locator

  constructor(page: Page) {
    this.page = page
    this.title = page.getByRole('heading', { level: 1, name: 'Rollstead' })
    this.tagline = page.getByRole('main').getByRole('paragraph').first()
    this.languageSelect = page.getByRole('banner').getByRole('combobox')
  }

  async goto() {
    await this.page.goto('/')
  }

  /** Selects a language by its visible name, e.g. "English". */
  async selectLanguage(name: string) {
    await this.languageSelect.selectOption({ label: name })
  }
}
