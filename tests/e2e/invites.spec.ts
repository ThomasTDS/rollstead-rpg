import type { Browser, Page } from '@playwright/test'
import { readLoginEmail, uniqueEmail } from '../support/local-supabase'
import { expect, test } from './fixtures'
import { DisplayNamePage } from './pages/display-name.page'
import { InvitePage } from './pages/invite.page'
import { LoginPage } from './pages/login.page'
import { TablePage } from './pages/table.page'
import { TablesPage } from './pages/tables.page'

async function newPlayerPage(browser: Browser) {
  const context = await browser.newContext({ locale: 'pt-BR' })
  return context.newPage()
}

test.describe('Invites', () => {
  test('a visitor signs up through the link and joins as a player', async ({
    signUp,
    tablesPage,
    tablePage,
    mailpitUrl,
    browser,
    page,
  }) => {
    await signUp(page, 'Ana')
    await tablesPage.createTable('A Mina Perdida')
    await expect(tablePage.manageTitle).toBeVisible()
    const invitePath = await tablePage.generateInvite()

    const playerPage: Page = await newPlayerPage(browser)
    await playerPage.goto(invitePath)
    await expect(playerPage).toHaveURL(/\/entrar\?next=/)

    const email = uniqueEmail()
    const login = new LoginPage(playerPage)
    await login.requestCode(email)
    const { code } = await readLoginEmail(mailpitUrl, email)
    await login.submitCode(code)
    await new DisplayNamePage(playerPage).save('Bia')

    const invite = new InvitePage(playerPage)
    await expect(invite.intro('A Mina Perdida')).toBeVisible()
    await invite.joinButton.click()

    const playerTable = new TablePage(playerPage)
    await expect(playerTable.title('A Mina Perdida')).toBeVisible()
    await expect(playerTable.manageTitle).toHaveCount(0)

    await playerTable.backLink.click()
    await expect(new TablesPage(playerPage).row('A Mina Perdida')).toContainText('Jogador')
    await playerPage.context().close()
  })

  test('the emailed link brings a visitor back to the invite', async ({
    signUp,
    tablesPage,
    tablePage,
    mailpitUrl,
    browser,
    page,
  }) => {
    await signUp(page, 'Ana')
    await tablesPage.createTable('A Mina Perdida')
    await expect(tablePage.manageTitle).toBeVisible()
    const invitePath = await tablePage.generateInvite()

    const playerPage = await newPlayerPage(browser)
    await playerPage.goto(invitePath)
    const email = uniqueEmail()
    await new LoginPage(playerPage).requestCode(email)
    const { link } = await readLoginEmail(mailpitUrl, email)
    await playerPage.goto(link)
    await new DisplayNamePage(playerPage).save('Bia')

    await expect(new InvitePage(playerPage).intro('A Mina Perdida')).toBeVisible()
    await playerPage.context().close()
  })

  test('the master copies the link, and it is not shown again', async ({
    signUp,
    tablesPage,
    tablePage,
    context,
    page,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await signUp(page, 'Ana')
    await tablesPage.createTable('A Mina Perdida')
    await expect(tablePage.manageTitle).toBeVisible()

    await tablePage.generateButton.click()
    const link = await tablePage.linkInput.inputValue()
    await tablePage.copyButton.click()
    await expect(page.getByRole('button', { name: 'Copiado!' })).toBeVisible()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(link)

    await page.reload()
    await expect(tablePage.activeMessage).toBeVisible()
    await expect(tablePage.linkInput).toHaveCount(0)
  })

  test('a revoked link is refused', async ({ signUp, tablesPage, tablePage, browser, page }) => {
    await signUp(page, 'Ana')
    await tablesPage.createTable('A Mina Perdida')
    await expect(tablePage.manageTitle).toBeVisible()
    const invitePath = await tablePage.generateInvite()
    await tablePage.revokeButton.click()
    await expect(tablePage.generateButton).toBeVisible()

    const playerPage = await newPlayerPage(browser)
    await signUp(playerPage, 'Bia')
    await playerPage.goto(invitePath)

    await expect(new InvitePage(playerPage).invalidTitle).toBeVisible()
    await playerPage.context().close()
  })

  test('the master opening the link lands on the table', async ({
    signUp,
    tablesPage,
    tablePage,
    page,
  }) => {
    await signUp(page, 'Ana')
    await tablesPage.createTable('A Mina Perdida')
    await expect(tablePage.manageTitle).toBeVisible()
    const invitePath = await tablePage.generateInvite()

    await page.goto(invitePath)

    await expect(tablePage.title('A Mina Perdida')).toBeVisible()
    await expect(tablePage.manageTitle).toBeVisible()
  })
})
