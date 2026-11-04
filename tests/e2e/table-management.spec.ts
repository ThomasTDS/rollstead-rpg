import { expect, test } from './fixtures'
import { InvitePage } from './pages/invite.page'
import { TablePage } from './pages/table.page'
import { TablesPage } from './pages/tables.page'

test.describe('Table names', () => {
  test('a repeated name is refused, ignoring case and spaces', async ({
    signUp,
    tablesPage,
    tablePage,
    page,
  }) => {
    await signUp(page, 'Ana')
    await tablesPage.createTable('DnD')
    await expect(tablePage.title('DnD')).toBeVisible()
    await tablePage.backLink.click()

    await tablesPage.createTable('dnd ')

    await expect(page.getByRole('alert')).toHaveText('Você já tem uma mesa com esse nome.')
  })

  test('the master renames a table, under the same rule', async ({
    signUp,
    tablesPage,
    tablePage,
    page,
  }) => {
    await signUp(page, 'Ana')
    await tablesPage.createTable('DnD')
    await expect(tablePage.title('DnD')).toBeVisible()
    await tablePage.backLink.click()
    await tablesPage.createTable('Outra')
    await expect(tablePage.title('Outra')).toBeVisible()

    await tablePage.rename('dnd')
    await expect(page.getByRole('alert')).toHaveText('Você já tem uma mesa com esse nome.')

    await tablePage.rename('A Mina Perdida')
    await expect(tablePage.title('A Mina Perdida')).toBeVisible()

    await tablePage.backLink.click()
    await expect(tablesPage.row('A Mina Perdida')).toBeVisible()
    await expect(tablesPage.row('Outra')).toHaveCount(0)
  })
})

test.describe('Deleting a table', () => {
  test('asks for the name, is definitive and frees the name', async ({
    signUp,
    tablesPage,
    tablePage,
    page,
  }) => {
    await signUp(page, 'Ana')
    await tablesPage.createTable('A Mina Perdida')
    await expect(tablePage.title('A Mina Perdida')).toBeVisible()

    await tablePage.deleteOpenButton.click()
    await expect(tablePage.deleteButton).toBeDisabled()
    await tablePage.deleteConfirmInput.fill('A Mina')
    await expect(tablePage.deleteButton).toBeDisabled()
    await tablePage.deleteConfirmInput.fill('A Mina Perdida')
    await tablePage.deleteButton.click()

    await expect(tablesPage.title).toBeVisible()
    await expect(tablesPage.emptyMessage).toBeVisible()

    await tablesPage.createTable('A Mina Perdida')
    await expect(tablePage.title('A Mina Perdida')).toBeVisible()
  })

  test('removes the table from the list of the players too', async ({
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

    const playerContext = await browser.newContext({ locale: 'pt-BR' })
    const playerPage = await playerContext.newPage()
    await signUp(playerPage, 'Bia')
    await playerPage.goto(invitePath)
    await new InvitePage(playerPage).joinButton.click()

    const playerTable = new TablePage(playerPage)
    await expect(playerTable.title('A Mina Perdida')).toBeVisible()
    await expect(playerTable.deleteOpenButton).toHaveCount(0)
    await expect(playerTable.renameInput).toHaveCount(0)

    await tablePage.deleteTable('A Mina Perdida')
    await expect(tablesPage.title).toBeVisible()

    await playerPage.goto('/mesas')
    await expect(new TablesPage(playerPage).emptyMessage).toBeVisible()
    await playerPage.goto(tablePath)
    await expect(playerTable.notFound).toBeVisible()
    await playerContext.close()
  })
})
