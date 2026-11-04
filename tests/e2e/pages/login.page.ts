import type { Locator, Page } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly sendButton: Locator
  readonly codeInput: Locator
  readonly confirmButton: Locator
  readonly alert: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel('E-mail')
    this.sendButton = page.getByRole('button', { name: 'Enviar' })
    this.codeInput = page.getByLabel('Código de 6 dígitos')
    this.confirmButton = page.getByRole('button', { name: 'Confirmar' })
    this.alert = page.getByRole('alert')
  }

  async goto() {
    await this.page.goto('/entrar')
  }

  async requestCode(email: string) {
    await this.emailInput.fill(email)
    await this.sendButton.click()
  }

  async submitCode(code: string) {
    await this.codeInput.fill(code)
    await this.confirmButton.click()
  }
}
