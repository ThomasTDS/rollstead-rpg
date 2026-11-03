import { expireLogin, readLoginEmail, uniqueEmail } from '../support/local-supabase'
import { expect, test } from './fixtures'

test.describe('Email login', () => {
  test('signs in once with the emailed code', async ({ authApi, supabaseConfig }) => {
    const email = uniqueEmail()

    const request = await authApi.post('otp', { data: { email } })
    expect(request.status()).toBe(200)

    const { code } = await readLoginEmail(supabaseConfig.mailpitUrl, email)
    const verify = () => authApi.post('verify', { data: { type: 'email', email, token: code } })

    expect((await verify()).status()).toBe(200)
    expect((await verify()).status()).toBe(403)
  })

  test('rejects a wrong code', async ({ authApi, supabaseConfig }) => {
    const email = uniqueEmail()
    await authApi.post('otp', { data: { email } })
    const { code } = await readLoginEmail(supabaseConfig.mailpitUrl, email)
    const wrongCode = code === '000000' ? '000001' : '000000'

    const response = await authApi.post('verify', {
      data: { type: 'email', email, token: wrongCode },
    })

    expect(response.status()).toBe(403)
  })

  test('rejects an expired code', async ({ authApi, supabaseConfig }) => {
    const email = uniqueEmail()
    await authApi.post('otp', { data: { email } })
    const { code } = await readLoginEmail(supabaseConfig.mailpitUrl, email)

    expireLogin(email)

    const response = await authApi.post('verify', { data: { type: 'email', email, token: code } })
    expect(response.status()).toBe(403)
  })

  test('rejects an invalid email address', async ({ authApi }) => {
    const response = await authApi.post('otp', { data: { email: 'not-an-email' } })

    expect(response.status()).toBe(400)
  })
})
