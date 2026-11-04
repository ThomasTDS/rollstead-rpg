import type { Browser, Page } from '@playwright/test'
import { expect, test } from './fixtures'
import { InvitePage } from './pages/invite.page'
import { TablePage } from './pages/table.page'
import { TablesPage } from './pages/tables.page'

type SignUp = (page: Page, displayName: string) => Promise<void>

/** Opens a second browser with a new account, already sitting at the table. */
async function seatPlayer(browser: Browser, signUp: SignUp, invitePath: string) {
  const context = await browser.newContext({ locale: 'pt-BR' })
  const page = await context.newPage()
  await signUp(page, 'Bia')
  await page.goto(invitePath)
  await new InvitePage(page).joinButton.click()
  return { context, page, table: new TablePage(page), list: new TablesPage(page) }
}

test.describe('Table members', () => {
  test('the master removes a player, who can return with a valid invite', async ({
    signUp,
    tablesPage,
    tablePage,
    browser,
    page,
  }) => {
    await signUp(page, 'Ana')
    await tablesPage.createTable('A Mina Perdida')
    await expect(tablePage.manageTitle).toBeVisible()
    const tablePath = new URL(page.url()).pathname
    const invitePath = await tablePage.generateInvite()
    const player = await seatPlayer(browser, signUp, invitePath)
    await expect(player.table.title('A Mina Perdida')).toBeVisible()

    await page.reload()
    await expect(tablePage.member('Bia')).toBeVisible()
    await expect(tablePage.removeButton('Ana')).toHaveCount(0)

    await tablePage.removeMember('Bia')
    await expect(tablePage.member('Bia')).toHaveCount(0)

    await player.page.goto('/mesas')
    await expect(player.list.emptyMessage).toBeVisible()
    await player.page.goto(tablePath)
    await expect(player.table.notFound).toBeVisible()

    await player.page.goto(invitePath)
    await new InvitePage(player.page).joinButton.click()
    await expect(player.table.title('A Mina Perdida')).toBeVisible()
    await player.context.close()
  })

  test('a player leaves on their own, and the master has no such option', async ({
    signUp,
    tablesPage,
    tablePage,
    browser,
    page,
  }) => {
    await signUp(page, 'Ana')
    await tablesPage.createTable('A Mina Perdida')
    await expect(tablePage.manageTitle).toBeVisible()
    await expect(tablePage.leaveOpenButton).toHaveCount(0)
    const invitePath = await tablePage.generateInvite()
    const player = await seatPlayer(browser, signUp, invitePath)

    await expect(player.table.manageTitle).toHaveCount(0)
    await player.table.leaveOpenButton.click()
    await player.table.leaveConfirmButton.click()

    await expect(player.list.emptyMessage).toBeVisible()
    await page.reload()
    await expect(tablePage.member('Ana')).toBeVisible()
    await expect(tablePage.member('Bia')).toHaveCount(0)
    await player.context.close()
  })

  test('a page left open after the removal shows that the table is gone', async ({
    signUp,
    tablesPage,
    tablePage,
    browser,
    page,
  }) => {
    await signUp(page, 'Ana')
    await tablesPage.createTable('A Mina Perdida')
    await expect(tablePage.manageTitle).toBeVisible()
    const invitePath = await tablePage.generateInvite()
    const player = await seatPlayer(browser, signUp, invitePath)
    await expect(player.table.leaveOpenButton).toBeVisible()

    await page.reload()
    await tablePage.removeMember('Bia')
    await expect(tablePage.member('Bia')).toHaveCount(0)

    await player.table.leaveOpenButton.click()
    await player.table.leaveConfirmButton.click()

    await expect(player.table.notFound).toBeVisible()
    await player.context.close()
  })
})
