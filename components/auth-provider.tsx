"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

interface AuthUser {
  username: string
  role: string
  displayName: string
  clearance: string
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (username: string, password: string) => { success: boolean; error?: string }
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

// Predefined credentials stored internally
// Default: username "admin" / password "civicwatch2025"
const CREDENTIALS = {
  username: "admin",
  password: "civicwatch2025",
  profile: {
    username: "admin",
    role: "System Administrator",
    displayName: "Madeena Umar",
    clearance: "Level 5 - Top Secret",
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  const login = useCallback((username: string, password: string) => {
    // Validate against predefined credentials
    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
      setUser(CREDENTIALS.profile)
      return { success: true }
    }
    return { success: false, error: "Invalid credentials. Access denied." }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
