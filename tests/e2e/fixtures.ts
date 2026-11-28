import { test as base, type Page } from '@playwright/test'
import { readLoginEmail, resolveSupabaseConfig, uniqueEmail } from '../support/local-supabase'
import { DisplayNamePage } from './pages/display-name.page'
import { HomePage } from './pages/home.page'
import { LoginPage } from './pages/login.page'
import { TablePage } from './pages/table.page'
import { TablesPage } from './pages/tables.page'

interface PageFixtures {
  homePage: HomePage
  loginPage: LoginPage
  displayNamePage: DisplayNamePage
  tablesPage: TablesPage
  tablePage: TablePage
  /** Creates a new account on the given page, through the real email flow. */
  signUp: (page: Page, displayName: string) => Promise<void>
  /** Fails any test whose page broke the content security policy. */
  contentPolicyGuard: undefined
}

interface WorkerFixtures {
  mailpitUrl: string
}

export const test = base.extend<PageFixtures, WorkerFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page))
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },
  displayNamePage: async ({ page }, use) => {
    await use(new DisplayNamePage(page))
  },
  tablesPage: async ({ page }, use) => {
    await use(new TablesPage(page))
  },
  tablePage: async ({ page }, use) => {
    await use(new TablePage(page))
  },
  signUp: async ({ mailpitUrl }, use) => {
    await use(async (page, displayName) => {
      const email = uniqueEmail()
      const loginPage = new LoginPage(page)
      await loginPage.goto()
      await loginPage.requestCode(email)
      const { code } = await readLoginEmail(mailpitUrl, email)
      await loginPage.submitCode(code)
      await new DisplayNamePage(page).save(displayName)
      await new TablesPage(page).title.waitFor()
    })
  },
  contentPolicyGuard: [
    async ({ page }, use) => {
      // Chromium reports every blocked script, style or request as a console error
      const violations: string[] = []
      page.on('console', (message) => {
        if (message.type() === 'error' && message.text().includes('Content Security Policy')) {
          violations.push(message.text())
        }
      })
      await use(undefined)
      base.expect(violations, 'content security policy violations').toEqual([])
    },
    { auto: true },
  ],
  mailpitUrl: [
    // eslint-disable-next-line no-empty-pattern -- Playwright requires an object pattern here
    async ({}, use) => {
      await use(resolveSupabaseConfig().mailpitUrl)
    },
    { scope: 'worker' },
  ],
})

export { expect } from '@playwright/test'
