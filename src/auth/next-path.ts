const DEFAULT_PATH = '/mesas'

/**
 * Where to go after signing in. The value comes from the URL, so anything that is
 * not a path inside this site is ignored: a crafted link could otherwise send the
 * person to another site right after login.
 */
export function safeNextPath(next: string | null): string {
  if (!next?.startsWith('/') || next.startsWith('//') || next.includes('\\')) return DEFAULT_PATH
  return next
}
