import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

// Read by Cloudflare Workers static assets, which applies it to every response.
const HEADERS_FILE = '_headers'

/**
 * Security headers of the site. The only outside origin is the Supabase project of the
 * build (production, staging or local), so the content policy allows nothing else.
 */
export function securityHeaders(supabaseUrl: string): Record<string, string> {
  const api = new URL(supabaseUrl)
  const realtime = `${api.protocol === 'https:' ? 'wss:' : 'ws:'}//${api.host}`
  const contentPolicy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self' ${api.origin} ${realtime}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ')

  return {
    'Content-Security-Policy': contentPolicy,
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    // Invite links carry their token in the path: never send it to another site
    'Referrer-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
  }
}

function toHeadersFile(headers: Record<string, string>): string {
  const lines = Object.entries(headers).map(([name, value]) => `  ${name}: ${value}`)
  return ['/*', ...lines, ''].join('\n')
}

function parseHeadersFile(text: string): Record<string, string> {
  const headers: Record<string, string> = {}
  for (const line of text.split('\n')) {
    const match = /^\s+([^:]+):\s*(.+)$/.exec(line)
    if (match?.[1] && match[2]) headers[match[1]] = match[2]
  }
  return headers
}

/**
 * Writes dist/_headers at build time, and makes `vite preview` send the same headers,
 * so the E2E tests run under the policy that production gets.
 */
export function securityHeadersPlugin(): Plugin {
  let supabaseUrl: string | undefined
  let outDir = 'dist'

  return {
    name: 'rollstead-security-headers',
    configResolved(config) {
      supabaseUrl = (config.env as Record<string, string | undefined>).VITE_SUPABASE_URL
      outDir = resolve(config.root, config.build.outDir)
    },
    generateBundle() {
      if (!supabaseUrl)
        throw new Error('VITE_SUPABASE_URL is required to build the security headers')
      this.emitFile({
        type: 'asset',
        fileName: HEADERS_FILE,
        source: toHeadersFile(securityHeaders(supabaseUrl)),
      })
    },
    configurePreviewServer(server) {
      const headers = parseHeadersFile(readFileSync(resolve(outDir, HEADERS_FILE), 'utf8'))
      server.middlewares.use((_request, response, next) => {
        for (const [name, value] of Object.entries(headers)) response.setHeader(name, value)
        next()
      })
    },
  }
}
