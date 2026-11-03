import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { expect } from '@playwright/test'
import { z } from 'zod'

const statusSchema = z.object({
  API_URL: z.url(),
  ANON_KEY: z.string().min(1),
  MAILPIT_URL: z.url(),
})

export interface SupabaseConfig {
  url: string
  anonKey: string
  mailpitUrl: string
}

/**
 * Reads the running local Supabase (`supabase status`). Only the public anon key is
 * ever used by the tests: signing in goes through the real email flow.
 */
export function resolveSupabaseConfig(): SupabaseConfig {
  const output = execSync('npx supabase status -o json', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  const status = statusSchema.parse(JSON.parse(output))
  return { url: status.API_URL, anonKey: status.ANON_KEY, mailpitUrl: status.MAILPIT_URL }
}

/** A brand-new address, so each test starts as a first-time user. */
export function uniqueEmail() {
  return `player-${randomUUID()}@example.com`
}

const searchSchema = z.object({ messages: z.array(z.object({ ID: z.string() })) })
const messageSchema = z.object({ HTML: z.string() })

export interface LoginEmail {
  code: string
  link: string
}

/** Waits for the login email in the local inbox and reads its code and link. */
export async function readLoginEmail(mailpitUrl: string, email: string): Promise<LoginEmail> {
  const search = `${mailpitUrl}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`
  let messageId: string | undefined

  await expect(async () => {
    const response = await fetch(search)
    const { messages } = searchSchema.parse(await response.json())
    messageId = messages[0]?.ID
    expect(messageId).toBeDefined()
  }).toPass({ timeout: 10_000 })

  const response = await fetch(`${mailpitUrl}/api/v1/message/${String(messageId)}`)
  const { HTML: html } = messageSchema.parse(await response.json())
  const code = /<strong>(\d{6})<\/strong>/.exec(html)?.[1]
  const link = /href="([^"]+)"/.exec(html)?.[1]?.replaceAll('&amp;', '&')
  if (!code || !link) throw new Error(`Login email without code or link: ${html}`)

  return { code, link }
}

/** Ages every pending login of an account past the expiry, as if an hour had gone by. */
export function expireLogin(email: string) {
  const sql = `update auth.users
    set confirmation_sent_at = now() - interval '2 hours',
        recovery_sent_at = now() - interval '2 hours'
    where email = '${email}'`
  execSync(`npx supabase db query --local "${sql.replaceAll('\n', ' ')}"`, { encoding: 'utf8' })
}
