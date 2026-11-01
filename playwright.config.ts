import { defineConfig, devices } from '@playwright/test'

// E2E tests. API tests have their own config (playwright.api.config.ts) because they
// do not need the local preview server started below.
const isCI = Boolean(process.env.CI)

// When set, E2E tests run against an already published site (smoke test) instead of a local preview.
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL
const previewURL = 'http://localhost:4173'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'pt-BR',
        baseURL: externalBaseURL ?? previewURL,
      },
    },
  ],
  webServer: externalBaseURL
    ? undefined
    : {
        command: 'npm run preview -- --port 4173 --strictPort',
        url: previewURL,
        reuseExistingServer: !isCI,
        timeout: 60_000,
      },
})
