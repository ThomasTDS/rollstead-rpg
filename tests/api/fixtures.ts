import { execSync } from 'node:child_process'
import { test as base, type APIRequestContext } from '@playwright/test'
import { z } from 'zod'

const localStatusSchema = z.object({
  API_URL: z.url(),
  ANON_KEY: z.string().min(1),
})

interface SupabaseConfig {
  url: string
  anonKey: string
}

/**
 * Uses SUPABASE_URL and SUPABASE_ANON_KEY when set; otherwise reads them from the
 * running local Supabase (`supabase status`). Only the public anon key is ever used here.
 */
function resolveSupabaseConfig(): SupabaseConfig {
  const { SUPABASE_URL: url, SUPABASE_ANON_KEY: anonKey } = process.env
  if (url && anonKey) return { url, anonKey }

  const output = execSync('npx supabase status -o json', { encoding: 'utf8' })
  const status = localStatusSchema.parse(JSON.parse(output))
  return { url: status.API_URL, anonKey: status.ANON_KEY }
}

interface ApiFixtures {
  anonApi: APIRequestContext
}

interface ApiWorkerFixtures {
  supabaseConfig: SupabaseConfig
}

export const test = base.extend<ApiFixtures, ApiWorkerFixtures>({
  supabaseConfig: [
    // eslint-disable-next-line no-empty-pattern -- Playwright requires an object pattern here
    async ({}, use) => {
      await use(resolveSupabaseConfig())
    },
    { scope: 'worker' },
  ],

  anonApi: async ({ playwright, supabaseConfig }, use) => {
    const context = await playwright.request.newContext({
      baseURL: `${supabaseConfig.url}/rest/v1/`,
      extraHTTPHeaders: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${supabaseConfig.anonKey}`,
      },
    })
    await use(context)
    await context.dispose()
  },
})

export { expect } from '@playwright/test'
