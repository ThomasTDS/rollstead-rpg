import { defineConfig } from '@playwright/test'

// API tests against the local Supabase. No browser and no web server needed.
const isCI = Boolean(process.env.CI)

export default defineConfig({
  testDir: './tests/api',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  projects: [{ name: 'api' }],
})
