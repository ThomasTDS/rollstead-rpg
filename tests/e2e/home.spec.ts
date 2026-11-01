import { expect, test } from './fixtures'

test.describe('Home', () => {
  test('shows the Rollstead title', { tag: '@smoke' }, async ({ homePage, page }) => {
    await homePage.goto()

    await expect(page).toHaveTitle('Rollstead')
    await expect(homePage.title).toBeVisible()
  })
})
