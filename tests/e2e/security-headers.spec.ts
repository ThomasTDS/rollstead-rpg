import { expect, test } from './fixtures'

test.describe('Security headers', () => {
  test('are sent with the site', { tag: '@smoke' }, async ({ request }) => {
    const response = await request.get('/')
    const headers = response.headers()

    expect(response.status()).toBe(200)
    const contentPolicy = headers['content-security-policy'] ?? ''
    expect(contentPolicy).toContain("script-src 'self'")
    expect(contentPolicy).toContain("frame-ancestors 'none'")
    expect(contentPolicy).toMatch(/connect-src 'self' https?:\/\/\S+ wss?:\/\/\S+/)
    expect(headers['strict-transport-security']).toContain('max-age=31536000')
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['referrer-policy']).toBe('same-origin')
  })
})
