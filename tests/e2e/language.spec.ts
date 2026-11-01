import { expect, test } from './fixtures'

test.describe('Language', () => {
  test('starts in Portuguese for a pt-BR browser', async ({ homePage, page }) => {
    await homePage.goto()

    await expect(homePage.tagline).toHaveText('A sessão acaba. A história fica.')
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  })

  test('keeps the manually chosen language after a reload', async ({ homePage, page }) => {
    await homePage.goto()
    await homePage.selectLanguage('English')

    await expect(homePage.tagline).toHaveText('Play the session. Keep the story.')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')

    await page.reload()

    await expect(homePage.tagline).toHaveText('Play the session. Keep the story.')
    await expect(homePage.languageSelect).toHaveValue('en')
  })

  test.describe('with a Spanish browser', () => {
    test.use({ locale: 'es-MX' })

    test('detects Spanish', async ({ homePage }) => {
      await homePage.goto()

      await expect(homePage.tagline).toHaveText('La sesión se acaba. La historia se queda.')
    })
  })

  test.describe('with an unsupported browser language', () => {
    test.use({ locale: 'fr-FR' })

    test('falls back to Portuguese', async ({ homePage }) => {
      await homePage.goto()

      await expect(homePage.tagline).toHaveText('A sessão acaba. A história fica.')
    })
  })
})
