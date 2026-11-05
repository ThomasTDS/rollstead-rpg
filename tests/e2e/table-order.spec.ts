import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'
import type { TablePage } from './pages/table.page'
import type { TablesPage } from './pages/tables.page'

/** Creates the tables, in order, and comes back to the list. */
async function createTables(tablesPage: TablesPage, tablePage: TablePage, ...names: string[]) {
  for (const name of names) {
    await tablesPage.createTable(name)
    await expect(tablePage.title(name)).toBeVisible()
    await tablePage.backLink.click()
  }
}

/** The keyboard sensor starts listening just after the pick up, so a first press can be lost. */
async function moveDown(page: Page, announcement: Locator, expected: string) {
  await expect(async () => {
    await page.keyboard.press('ArrowDown')
    await expect(announcement).toHaveText(expected, { timeout: 500 })
  }).toPass()
}

const savedOrder = (page: Page) => page.waitForResponse('**/rpc/reorder_my_tables')

test.describe('Table order', () => {
  test('the keyboard reorders the list, and the order survives elsewhere', async ({
    signUp,
    tablesPage,
    tablePage,
    browser,
    page,
  }) => {
    await signUp(page, 'Ana')
    await createTables(tablesPage, tablePage, 'Primeira', 'Segunda', 'Terceira')
    await expect(tablesPage.tableLinks).toHaveText(['Terceira', 'Segunda', 'Primeira'])

    await tablesPage.handle('Terceira').focus()
    const announcement = page.getByRole('status').filter({ hasText: 'Terceira' })
    await page.keyboard.press('Space')
    await expect(announcement).toHaveText('Terceira selecionada.')
    await moveDown(page, announcement, 'Terceira sobre a posição 2.')
    await moveDown(page, announcement, 'Terceira sobre a posição 3.')
    const saved = savedOrder(page)
    await page.keyboard.press('Space')
    await saved
    await expect(announcement).toHaveText('Terceira movida para a posição 3.')
    await expect(tablesPage.tableLinks).toHaveText(['Segunda', 'Primeira', 'Terceira'])

    await page.reload()
    await expect(tablesPage.tableLinks).toHaveText(['Segunda', 'Primeira', 'Terceira'])

    await tablesPage.createTable('Nova')
    await expect(tablePage.title('Nova')).toBeVisible()
    await tablePage.backLink.click()
    await expect(tablesPage.tableLinks.first()).toHaveText('Nova')

    const otherBrowser = await browser.newContext({
      locale: 'pt-BR',
      storageState: await page.context().storageState(),
    })
    const otherPage = await otherBrowser.newPage()
    await otherPage.goto('/mesas')
    await expect(otherPage.getByRole('link', { name: 'Segunda' })).toBeVisible()
    await otherBrowser.close()
  })

  test('the mouse drags a table by the handle', async ({ signUp, tablesPage, tablePage, page }) => {
    await signUp(page, 'Ana')
    await createTables(tablesPage, tablePage, 'Primeira', 'Segunda')

    await tablesPage.handle('Segunda').hover()
    await page.mouse.down()
    const target = await tablesPage.handle('Primeira').boundingBox()
    if (!target) throw new Error('nothing to measure')
    await page.mouse.move(target.x + 4, target.y + target.height + 60, { steps: 12 })
    const saved = savedOrder(page)
    await page.mouse.up()
    await saved

    await expect(tablesPage.tableLinks).toHaveText(['Primeira', 'Segunda'])
    await page.reload()
    await expect(tablesPage.tableLinks).toHaveText(['Primeira', 'Segunda'])
  })

  test('Esc cancels the move', async ({ signUp, tablesPage, tablePage, page }) => {
    await signUp(page, 'Ana')
    await createTables(tablesPage, tablePage, 'Primeira', 'Segunda')

    const announcement = page.getByRole('status').filter({ hasText: 'Segunda' })
    await tablesPage.handle('Segunda').focus()
    await page.keyboard.press('Space')
    await expect(announcement).toHaveText('Segunda selecionada.')
    await moveDown(page, announcement, 'Segunda sobre a posição 2.')
    await page.keyboard.press('Escape')

    await expect(announcement).toHaveText('Movimento de Segunda cancelado.')
    await expect(tablesPage.tableLinks).toHaveText(['Segunda', 'Primeira'])
  })

  test('a failure to save puts the list back and says so', async ({
    signUp,
    tablesPage,
    tablePage,
    page,
  }) => {
    await signUp(page, 'Ana')
    await createTables(tablesPage, tablePage, 'Primeira', 'Segunda')
    await page.route('**/rpc/reorder_my_tables', (route) => route.abort())
    const announcement = page.getByRole('status').filter({ hasText: 'Segunda' })

    await tablesPage.handle('Segunda').focus()
    await page.keyboard.press('Space')
    await expect(announcement).toHaveText('Segunda selecionada.')
    await moveDown(page, announcement, 'Segunda sobre a posição 2.')
    await page.keyboard.press('Space')

    await expect(page.getByRole('alert').filter({ hasText: 'Algo deu errado' })).toBeVisible()
    await expect(tablesPage.tableLinks).toHaveText(['Segunda', 'Primeira'])
  })
})
