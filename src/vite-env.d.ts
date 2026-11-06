/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  /** 'true' shows the one click test login. Never set in the production build. */
  readonly VITE_TEST_LOGIN?: string
}
