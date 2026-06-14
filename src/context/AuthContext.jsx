import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null)
  const [session,   setSession]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    // If Supabase isn't configured, skip all auth calls — app runs in guest-only mode
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch((err) => {
        console.error('[lumi] getSession error:', err)
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    if (!supabaseConfigured) {
      setAuthError('Sign-in is not available — Supabase is not configured.')
      return
    }
    setAuthError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/studio` },
    })
    if (error) {
      console.error('[lumi] Google sign-in error:', error.message)
      setAuthError(error.message)
    }
  }

  const signOut = async () => {
    if (!supabaseConfigured) return
    setAuthError(null)
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('[lumi] Sign-out error:', error.message)
      setAuthError(error.message)
    }
  }

  return (
    <AuthContext.Provider value={{
      user, session, loading, authError,
      signInWithGoogle, signOut,
      isAuthAvailable: supabaseConfigured,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
