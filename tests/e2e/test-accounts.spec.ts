import { expect, test } from './fixtures'

const publishedSite = process.env.PLAYWRIGHT_BASE_URL
const production = publishedSite === 'https://rollstead.com.br'
const testLogin = /^Entrar como/

test.describe('Test accounts', () => {
  test('enter with one click and find the scenario ready', async ({ page, tablesPage }) => {
    test.skip(Boolean(publishedSite), 'Runs against the local build, with the seeded accounts')

    await page.goto('/entrar')
    await page.getByRole('button', { name: 'Entrar como Ana (Mestre)' }).click()

    await expect(tablesPage.title).toBeVisible()
    await expect(tablesPage.row('A Mina Perdida')).toBeVisible()
    await expect(tablesPage.row('Mesa cheia')).toBeVisible()
    await expect(tablesPage.moreButton(1)).toHaveText('+1')
  })

  test('a player of the scenario sees the table as a player', async ({ page, tablePage }) => {
    test.skip(Boolean(publishedSite), 'Runs against the local build, with the seeded accounts')

    await page.goto('/entrar')
    await page.getByRole('button', { name: 'Entrar como Bia (Jogador)' }).click()
    await page.getByRole('link', { name: 'A Mina Perdida' }).click()

    await expect(tablePage.leaveOpenButton).toBeVisible()
    await expect(tablePage.manageTitle).toHaveCount(0)
  })

  test('do not exist in production', { tag: '@smoke' }, async ({ page, request }) => {
    test.skip(!production, 'Only the production site proves this')

    await page.goto('/')
    await page.getByRole('link', { name: 'Entrar' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Entrar' })).toBeVisible()
    await expect(page.getByRole('button', { name: testLogin })).toHaveCount(0)

    const response = await request.post(
      'https://tfvnmafqramhmmbhmsvb.supabase.co/auth/v1/token?grant_type=password',
      {
        headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY ?? '' },
        data: { email: 'ana@teste.rollstead.com.br', password: 'rollstead-teste' },
      },
    )
    expect(response.status()).toBe(400)
  })
})
