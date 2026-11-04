import type { Session } from '@supabase/supabase-js'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { AuthContext, type AuthState } from './auth-context'

interface Profile {
  userId: string
  displayName: string | null
  failed: boolean
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionKnown, setSessionKnown] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const userId = session?.user.id

  useEffect(() => {
    // Fires right away with the stored session, or with the one in a magic link
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setSessionKnown(true)
    })
    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!userId) return
    let active = true
    void supabase
      .from('profiles')
      .select('display_name')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (active) {
          setProfile({ userId, displayName: data?.display_name ?? null, failed: Boolean(error) })
        }
      })
    return () => {
      active = false
    }
  }, [userId])

  const currentProfile = profile?.userId === userId ? profile : null

  const value = useMemo<AuthState>(
    () => ({
      loading: !sessionKnown || (userId !== undefined && currentProfile === null),
      session,
      displayName: currentProfile?.displayName ?? null,
      profileFailed: currentProfile?.failed ?? false,
      setDisplayName: (displayName) => {
        if (userId) setProfile({ userId, displayName, failed: false })
      },
    }),
    [sessionKnown, session, userId, currentProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
