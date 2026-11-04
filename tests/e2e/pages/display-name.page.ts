import type { Locator, Page } from '@playwright/test'

export class DisplayNamePage {
  readonly title: Locator
  readonly nameInput: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.title = page.getByRole('heading', { level: 1, name: 'Como quer ser chamado?' })
    this.nameInput = page.getByLabel('Nome de exibição')
    this.saveButton = page.getByRole('button', { name: 'Salvar' })
  }

  async save(name: string) {
    await this.nameInput.fill(name)
    await this.saveButton.click()
  }
}
