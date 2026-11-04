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
  readonly renameInput: Locator
  readonly renameButton: Locator
  readonly deleteOpenButton: Locator
  readonly deleteConfirmInput: Locator
  readonly deleteButton: Locator
  readonly removeConfirmButton: Locator
  readonly leaveOpenButton: Locator
  readonly leaveConfirmButton: Locator
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
    this.renameInput = page.getByLabel('Nome da mesa', { exact: true })
    this.renameButton = page.getByRole('button', { name: 'Renomear' })
    this.deleteOpenButton = page.getByRole('button', { name: 'Excluir mesa' })
    this.deleteConfirmInput = page.getByLabel(/para confirmar$/)
    this.deleteButton = page.getByRole('button', { name: 'Excluir definitivamente' })
    this.removeConfirmButton = page.getByRole('button', { name: 'Remover da mesa' })
    this.leaveOpenButton = page.getByRole('button', { name: 'Sair da mesa' })
    this.leaveConfirmButton = page.getByRole('button', { name: 'Confirmar saída' })
  }

  title(name: string) {
    return this.page.getByRole('heading', { level: 1, name })
  }

  /** Goes through the removal of a player, confirmation included. */
  async removeMember(name: string) {
    await this.removeButton(name).click()
    await this.removeConfirmButton.click()
  }

  removeButton(name: string) {
    return this.page.getByRole('button', { name: `Remover ${name}` })
  }

  member(name: string) {
    return this.page.getByRole('listitem').filter({ hasText: name })
  }

  async rename(name: string) {
    await this.renameInput.fill(name)
    await this.renameButton.click()
  }

  async deleteTable(name: string) {
    await this.deleteOpenButton.click()
    await this.deleteConfirmInput.fill(name)
    await this.deleteButton.click()
  }

  /** Generates the invite and returns its path, read from the one time it is shown. */
  async generateInvite() {
    await this.generateButton.click()
    await this.linkInput.waitFor()
    return new URL(await this.linkInput.inputValue()).pathname
  }
}
