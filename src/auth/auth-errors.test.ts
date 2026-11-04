import { describe, expect, it } from 'vitest'
import { authErrorKey } from './auth-errors'

describe('authErrorKey', () => {
  it.each([
    ['otp_expired', 'auth.errors.invalidCode'],
    ['over_email_send_rate_limit', 'auth.errors.tooManyRequests'],
    ['over_request_rate_limit', 'auth.errors.tooManyRequests'],
    ['email_address_invalid', 'auth.errors.invalidEmail'],
    ['validation_failed', 'auth.errors.invalidEmail'],
  ])('maps %s', (code, key) => {
    expect(authErrorKey(code)).toBe(key)
  })

  it.each(['unexpected_failure', undefined])('falls back to a generic message for %s', (code) => {
    expect(authErrorKey(code)).toBe('errors.generic')
  })
})
