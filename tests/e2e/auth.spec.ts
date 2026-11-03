import { readLoginEmail, uniqueEmail } from '../support/local-supabase'
import { expect, test } from './fixtures'

test.describe('Login', () => {
  test('a first-time user signs in with the code and picks a name', async ({
    loginPage,
    displayNamePage,
    tablesPage,
    mailpitUrl,
    page,
  }) => {
    const email = uniqueEmail()
    await loginPage.goto()
    await loginPage.requestCode(email)
    const { code } = await readLoginEmail(mailpitUrl, email)
    await loginPage.submitCode(code)

    await expect(displayNamePage.title).toBeVisible()
    await displayNamePage.save('Ana')

    await expect(tablesPage.title).toBeVisible()
    await expect(tablesPage.greeting('Ana')).toBeVisible()
    await expect(page.getByText(email)).toHaveCount(0)
  })

  test('the session survives a reload and ends on sign out', async ({
    loginPage,
    displayNamePage,
    tablesPage,
    mailpitUrl,
    page,
  }) => {
    const email = uniqueEmail()
    await loginPage.goto()
    await loginPage.requestCode(email)
    const { code } = await readLoginEmail(mailpitUrl, email)
    await loginPage.submitCode(code)
    await displayNamePage.save('Bia')

    await page.reload()
    await expect(tablesPage.greeting('Bia')).toBeVisible()

    await tablesPage.signOutButton.click()
    await expect(loginPage.emailInput).toBeVisible()

    await tablesPage.goto()
    await expect(page).toHaveURL('/entrar')
  })

  test('the emailed link signs in', async ({ loginPage, displayNamePage, mailpitUrl, page }) => {
    const email = uniqueEmail()
    await loginPage.goto()
    await loginPage.requestCode(email)
    const { link } = await readLoginEmail(mailpitUrl, email)

    await page.goto(link)

    await expect(displayNamePage.title).toBeVisible()
  })

  test('a link used twice is refused with a clear message', async ({
    loginPage,
    displayNamePage,
    mailpitUrl,
    browser,
    page,
  }) => {
    const email = uniqueEmail()
    await loginPage.goto()
    await loginPage.requestCode(email)
    const { link } = await readLoginEmail(mailpitUrl, email)
    await page.goto(link)
    await expect(displayNamePage.title).toBeVisible()

    const otherContext = await browser.newContext({ locale: 'pt-BR' })
    const otherPage = await otherContext.newPage()
    await otherPage.goto(link)

    await expect(otherPage.getByRole('alert')).toHaveText(
      'Este link é inválido, expirou ou já foi usado. Peça um novo.',
    )
    await otherContext.close()
  })

  test('a wrong code shows an error', async ({ loginPage, mailpitUrl }) => {
    const email = uniqueEmail()
    await loginPage.goto()
    await loginPage.requestCode(email)
    const { code } = await readLoginEmail(mailpitUrl, email)

    await loginPage.submitCode(code === '000000' ? '000001' : '000000')

    await expect(loginPage.alert).toHaveText('Código inválido ou expirado.')
  })

  test('an invalid email does not advance', async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.requestCode('not-an-email')

    await expect(loginPage.codeInput).toHaveCount(0)
  })

  test('a name with HTML is shown as plain text', async ({
    loginPage,
    displayNamePage,
    tablesPage,
    mailpitUrl,
    page,
  }) => {
    const name = '<img src=x onerror=alert(1)>'
    const email = uniqueEmail()
    await loginPage.goto()
    await loginPage.requestCode(email)
    const { code } = await readLoginEmail(mailpitUrl, email)
    await loginPage.submitCode(code)
    await displayNamePage.save(name)

    await expect(tablesPage.greeting(name)).toBeVisible()
    await expect(page.locator('main img')).toHaveCount(0)
  })
})
