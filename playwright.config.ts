import { defineConfig, devices } from '@playwright/test'

const isCI = Boolean(process.env.CI)

// When set, E2E tests run against an already published site (smoke test) instead of a local preview.
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL
const previewURL = 'http://localhost:4173'

export default defineConfig({
  testDir: './tests',
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
      name: 'api',
      testDir: './tests/api',
    },
    {
      name: 'chromium',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
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
