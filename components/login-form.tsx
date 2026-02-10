"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Shield, Eye, EyeOff, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoginForm() {
  const { login } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const update = () => {
      setCurrentTime(
        new Date().toLocaleString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      )
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate network authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1200))

    const result = login(username, password)

    if (result.success) {
      setShowSuccess(true)
      // Brief delay to show success message before transitioning
      await new Promise((resolve) => setTimeout(resolve, 1500))
    } else {
      setError(result.error || "Authentication failed.")
      setIsLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center animate-in fade-in duration-500">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Authentication Successful</h2>
          <p className="text-sm text-muted-foreground">
            Welcome, Madeena Umar. Initializing secure session...
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0.2s" }} />
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-xs font-medium text-muted-foreground font-mono">
            SECURE PORTAL
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">{currentTime}</span>
      </header>

      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Logo & Title */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <Shield className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-semibold text-foreground">CivicWatch NG</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Authorized Personnel Only
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">Secure Authentication</h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Username field */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="username" className="text-xs font-medium text-muted-foreground">
                  Username
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setError("")
                    }}
                    placeholder="Enter username"
                    autoComplete="username"
                    required
                    className={cn(
                      "h-10 w-full rounded-md border bg-secondary pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                      "transition-colors",
                      error ? "border-destructive" : "border-border"
                    )}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError("")
                    }}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                    className={cn(
                      "h-10 w-full rounded-md border bg-secondary pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
                      "transition-colors",
                      error ? "border-destructive" : "border-border"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading || !username || !password}
                className={cn(
                  "flex h-10 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground",
                  "transition-all hover:bg-primary/90",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Credentials hint */}
            <div className="mt-4 rounded-md bg-secondary px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Default Credentials
              </p>
              <div className="mt-1.5 flex flex-col gap-0.5">
                <p className="text-xs text-foreground font-mono">
                  Username: <span className="text-primary">admin</span>
                </p>
                <p className="text-xs text-foreground font-mono">
                  Password: <span className="text-primary">civicwatch2025</span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-[10px] text-muted-foreground">
              Unauthorized access is strictly prohibited and may be subject to prosecution.
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              All sessions are logged and monitored.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom status */}
      <footer className="flex items-center justify-between border-t border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-[10px] text-muted-foreground">AES-256 Encrypted</span>
        </div>
        <span className="text-[10px] text-muted-foreground">v3.2.1</span>
      </footer>
    </div>
  )
}
