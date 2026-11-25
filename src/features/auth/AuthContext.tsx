import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface UserProfile {
  id: string
  name: string
  email: string
  ageGroup: 'under-18' | 'adult' | 'older-adult'
  preferredLanguage: 'en' | 'hi'
  medicalNotes: string
}

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  dbConfigured: boolean
  refreshUser: () => Promise<void>
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (payload: {
    name: string
    email: string
    password: string
    ageGroup: UserProfile['ageGroup']
    preferredLanguage: UserProfile['preferredLanguage']
  }) => Promise<{ ok: boolean; error?: string }>
  updateProfile: (payload: {
    name: string
    ageGroup: UserProfile['ageGroup']
    preferredLanguage: UserProfile['preferredLanguage']
    medicalNotes: string
  }) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [dbConfigured, setDbConfigured] = useState(true)

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth', { credentials: 'include' })
      if (res.status === 503) {
        setDbConfigured(false)
        setUser(null)
        return
      }
      if (!res.ok) {
        setUser(null)
        return
      }
      const data = (await res.json()) as {
        authenticated: boolean
        user: UserProfile | null
      }
      setDbConfigured(true)
      setUser(data.authenticated ? data.user : null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshUser()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'login', email, password }),
    })
    const data = (await res.json()) as {
      user?: UserProfile
      error?: string
      message?: string
    }
    if (res.status === 503) {
      setDbConfigured(false)
      return { ok: false, error: data.message ?? 'Database not configured.' }
    }
    if (!res.ok || !data.user) {
      return { ok: false, error: data.error ?? 'Sign in failed.' }
    }
    setUser(data.user)
    return { ok: true }
  }

  const register = async (payload: {
    name: string
    email: string
    password: string
    ageGroup: UserProfile['ageGroup']
    preferredLanguage: UserProfile['preferredLanguage']
  }) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'register', ...payload }),
    })
    const data = (await res.json()) as {
      user?: UserProfile
      error?: string
      message?: string
    }
    if (res.status === 503) {
      setDbConfigured(false)
      return { ok: false, error: data.message ?? 'Database not configured.' }
    }
    if (!res.ok || !data.user) {
      return { ok: false, error: data.error ?? 'Registration failed.' }
    }
    setUser(data.user)
    return { ok: true }
  }

  const updateProfile = async (payload: {
    name: string
    ageGroup: UserProfile['ageGroup']
    preferredLanguage: UserProfile['preferredLanguage']
    medicalNotes: string
  }) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'update-profile', ...payload }),
    })
    const data = (await res.json()) as { user?: UserProfile; error?: string }
    if (!res.ok || !data.user) {
      return { ok: false, error: data.error ?? 'Profile update failed.' }
    }
    setUser(data.user)
    return { ok: true }
  }

  const logout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'logout' }),
    })
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        dbConfigured,
        refreshUser,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
