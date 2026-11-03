import type { Session } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

export interface AuthState {
  /** True until the session, and the profile of a signed-in user, are known. */
  loading: boolean
  session: Session | null
  /** Null for a user who has not chosen a display name yet. */
  displayName: string | null
  profileFailed: boolean
  setDisplayName: (displayName: string) => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth must be used inside AuthProvider')
  return auth
}
