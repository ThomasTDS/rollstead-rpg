import { test as base } from '@playwright/test'
import { resolveSupabaseConfig } from '../support/local-supabase'
import { DisplayNamePage } from './pages/display-name.page'
import { HomePage } from './pages/home.page'
import { LoginPage } from './pages/login.page'
import { TablesPage } from './pages/tables.page'

interface PageFixtures {
  homePage: HomePage
  loginPage: LoginPage
  displayNamePage: DisplayNamePage
  tablesPage: TablesPage
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
  mailpitUrl: [
    // eslint-disable-next-line no-empty-pattern -- Playwright requires an object pattern here
    async ({}, use) => {
      await use(resolveSupabaseConfig().mailpitUrl)
    },
    { scope: 'worker' },
  ],
})

export { expect } from '@playwright/test'
