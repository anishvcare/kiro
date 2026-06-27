import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types'
import { authService } from '../services/auth.service'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (token) {
      authService
        .getUser()
        .then((userData) => {
          setUser(userData)
        })
        .catch(() => {
          localStorage.removeItem('auth_token')
          setToken(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [token])

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('auth_token', newToken)
    setToken(newToken)
    setUser(userData)
  }

  const logout = () => {
    authService.logout().catch(() => {})
    localStorage.removeItem('auth_token')
    setToken(null)
    setUser(null)
    // Clear PWA API cache to prevent data leaks between users
    if ('caches' in window) {
      caches.delete('api-cache').catch(() => {})
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
