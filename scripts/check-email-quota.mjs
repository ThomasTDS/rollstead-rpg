// Fails when the Resend daily quota passes the limit, so GitHub warns the owner by email.
// Resend reports the quota only on a real send, so this sends one email to its test
// address. That spends 1 of the daily quota.
const DEFAULT_LIMIT = 70

const apiKey = process.env.RESEND_API_KEY
if (!apiKey) {
  console.error('RESEND_API_KEY is missing.')
  process.exit(1)
}

const limit = Number(process.env.EMAIL_QUOTA_LIMIT ?? DEFAULT_LIMIT)

const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'User-Agent': 'rollstead-quota-check',
  },
  body: JSON.stringify({
    from: 'Rollstead <entrar@rollstead.com.br>',
    to: 'delivered@resend.dev',
    subject: 'Quota check',
    text: 'Daily quota check.',
  }),
})

const quota = response.headers.get('x-resend-daily-quota')

if (!response.ok || quota === null) {
  console.error(`Could not read the quota: HTTP ${String(response.status)}.`)
  process.exit(1)
}

console.log(`Used today: ${quota} (limit ${String(limit)}).`)

if (Number(quota) > limit) {
  console.error('The daily email quota is close to running out.')
  process.exit(1)
}
