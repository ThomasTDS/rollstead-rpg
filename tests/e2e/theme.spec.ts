import type { Locator, Page } from '@playwright/test'
import { expect, test } from './fixtures'

/** Computed page colors, as the browser resolves the theme tokens. */
function pageColors(page: Page) {
  return page.evaluate(() => {
    const style = getComputedStyle(document.body)
    return { background: style.backgroundColor, text: style.color }
  })
}

test.describe('Theme', () => {
  test('follows the system light or dark preference', async ({ homePage, page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await homePage.goto()
    await expect(homePage.title).toBeVisible()
    const light = await pageColors(page)

    await page.emulateMedia({ colorScheme: 'dark' })
    const dark = await pageColors(page)

    expect(dark.background).not.toBe(light.background)
    expect(dark.text).not.toBe(light.text)
  })

  test('can be forced with data-theme on <html>', async ({ homePage, page }) => {
    await page.emulateMedia({ colorScheme: 'light' })
    await homePage.goto()
    await expect(homePage.title).toBeVisible()
    const light = await pageColors(page)

    await page.locator('html').evaluate((html) => {
      html.dataset.theme = 'dark'
    })
    const forcedDark = await pageColors(page)

    await page.emulateMedia({ colorScheme: 'dark' })
    expect(forcedDark).toEqual(await pageColors(page))
    expect(forcedDark.background).not.toBe(light.background)
  })

  test('keeps the keyboard focus visible on links inside the window', async ({
    page,
    tablesPage,
  }) => {
    // Window links are gold on deep blue: the page's accent ring would be too faint there
    const ringMatchesText = (link: Locator) =>
      link.evaluate((element) => {
        const style = getComputedStyle(element)
        return style.outlineColor === style.color
      })

    await page.emulateMedia({ colorScheme: 'light' })
    await page.goto('/entrar')
    await page.getByRole('button', { name: 'Entrar como Ana (Mestre)' }).click()
    await expect(tablesPage.title).toBeVisible()

    const tableLink = page.getByRole('link', { name: 'A Mina Perdida' })
    await page.keyboard.press('Tab')
    await tableLink.focus()
    expect(await ringMatchesText(tableLink)).toBe(true)

    await tableLink.press('Enter')
    const backLink = page.getByRole('link', { name: 'Voltar para Minhas mesas' })
    await backLink.focus()
    expect(await ringMatchesText(backLink)).toBe(true)
  })
})
