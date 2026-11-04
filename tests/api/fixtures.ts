import { test as base, type APIRequestContext, type PlaywrightWorkerArgs } from '@playwright/test'
import { z } from 'zod'
import {
  readLoginEmail,
  resolveSupabaseConfig,
  uniqueEmail,
  type SupabaseConfig,
} from '../support/local-supabase'

const verifySchema = z.object({
  access_token: z.string().min(1),
  user: z.object({ id: z.uuid() }),
})

export interface SignedInUser {
  id: string
  api: APIRequestContext
}

interface ApiFixtures {
  anonApi: APIRequestContext
  authApi: APIRequestContext
  /** Creates a new account through the real email flow and returns its API client. */
  signIn: () => Promise<SignedInUser>
  /** Same as signIn, with the display name already chosen. */
  signInAs: (displayName: string) => Promise<SignedInUser>
}

interface ApiWorkerFixtures {
  supabaseConfig: SupabaseConfig
}

function newContext(
  playwright: PlaywrightWorkerArgs['playwright'],
  { url, anonKey }: SupabaseConfig,
  path: string,
  token = anonKey,
) {
  return playwright.request.newContext({
    baseURL: `${url}/${path}/`,
    extraHTTPHeaders: { apikey: anonKey, Authorization: `Bearer ${token}` },
  })
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
    const context = await newContext(playwright, supabaseConfig, 'rest/v1')
    await use(context)
    await context.dispose()
  },

  authApi: async ({ playwright, supabaseConfig }, use) => {
    const context = await newContext(playwright, supabaseConfig, 'auth/v1')
    await use(context)
    await context.dispose()
  },

  signIn: async ({ playwright, supabaseConfig, authApi }, use) => {
    const contexts: APIRequestContext[] = []

    await use(async () => {
      const email = uniqueEmail()
      await authApi.post('otp', { data: { email } })
      const { code } = await readLoginEmail(supabaseConfig.mailpitUrl, email)
      const response = await authApi.post('verify', { data: { type: 'email', email, token: code } })
      const { access_token: token, user } = verifySchema.parse(await response.json())

      const api = await newContext(playwright, supabaseConfig, 'rest/v1', token)
      contexts.push(api)
      return { id: user.id, api }
    })

    await Promise.all(contexts.map((context) => context.dispose()))
  },

  signInAs: async ({ signIn }, use) => {
    await use(async (displayName) => {
      const user = await signIn()
      await user.api.post('profiles', { data: { id: user.id, display_name: displayName } })
      return user
    })
  },
})

export { expect } from '@playwright/test'
