export type AuthErrorKey =
  | 'auth.errors.invalidCode'
  | 'auth.errors.tooManyRequests'
  | 'auth.errors.invalidEmail'
  | 'errors.generic'

/** Translation key for a Supabase Auth error code. */
export function authErrorKey(code: string | undefined): AuthErrorKey {
  switch (code) {
    case 'otp_expired':
      return 'auth.errors.invalidCode'
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'auth.errors.tooManyRequests'
    case 'email_address_invalid':
    case 'validation_failed':
      return 'auth.errors.invalidEmail'
    default:
      return 'errors.generic'
  }
}
