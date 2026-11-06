import { defineConfig, devices } from '@playwright/test'

// Screen captures for theme reviews and, later, the help center tutorials (NT-102).
// Run with `npm run screens`, after `npm run build` and with the seeded local database.
const previewURL = 'http://localhost:4173'

export default defineConfig({
  testDir: './tests/screens',
  outputDir: './test-results/screens',
  // One at a time: every run walks the same seeded table and renews its invite
  workers: 1,
  reporter: 'list',
  timeout: 180_000,
  use: {
    baseURL: previewURL,
    locale: 'pt-BR',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: previewURL,
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
