import { expect, test } from './fixtures'
import { TablePage } from './pages/table.page'

test.describe('Tables', () => {
  test('a new user creates the first table and sees it listed as master', async ({
    signUp,
    tablesPage,
    tablePage,
    page,
  }) => {
    await signUp(page, 'Ana')
    await expect(tablesPage.emptyMessage).toBeVisible()

    await tablesPage.createTable('A Mina Perdida')
    await expect(tablePage.title('A Mina Perdida')).toBeVisible()

    await tablePage.backLink.click()
    await expect(tablesPage.row('A Mina Perdida')).toContainText('Mestre')
    await expect(tablesPage.emptyMessage).toHaveCount(0)

    await page.reload()
    await expect(tablesPage.row('A Mina Perdida')).toBeVisible()
  })

  test('a table name with HTML is shown as plain text', async ({
    signUp,
    tablesPage,
    tablePage,
    page,
  }) => {
    const name = '<img src=x onerror=alert(1)>'
    await signUp(page, 'Ana')

    await tablesPage.createTable(name)

    await expect(tablePage.title(name)).toBeVisible()
    await expect(page.locator('main img')).toHaveCount(0)
  })

  test('a blank table name shows an error', async ({ signUp, tablesPage, page }) => {
    await signUp(page, 'Ana')

    await tablesPage.createTable('   ')

    await expect(page.getByRole('alert')).toHaveText('O nome precisa ter entre 1 e 60 caracteres.')
  })

  test('someone outside the table sees "not found"', async ({
    signUp,
    tablesPage,
    tablePage,
    browser,
    page,
  }) => {
    await signUp(page, 'Ana')
    await tablesPage.createTable('Mesa secreta')
    await expect(tablePage.title('Mesa secreta')).toBeVisible()

    const otherContext = await browser.newContext({ locale: 'pt-BR' })
    const otherPage = await otherContext.newPage()
    await signUp(otherPage, 'Bia')
    await otherPage.goto(new URL(page.url()).pathname)

    await expect(new TablePage(otherPage).notFound).toBeVisible()
    await expect(otherPage.getByText('Mesa secreta')).toHaveCount(0)
    await otherContext.close()
  })

  test('visitors are sent to the login', async ({ page }) => {
    await page.goto('/mesas/10000000-0000-0000-0000-000000000001')

    await expect(page).toHaveURL('/entrar')
  })
})
