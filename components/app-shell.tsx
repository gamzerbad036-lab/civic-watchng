"use client"

import { useState, useEffect } from "react"
import { AuthProvider, useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { AppSidebar } from "@/components/app-sidebar"
import { Dashboard } from "@/components/dashboard"
import { InvestigationPanel } from "@/components/investigation-panel"
import { AuditLogPanel } from "@/components/audit-log-panel"
import { CompliancePanel } from "@/components/compliance-panel"
import { SectorPanel } from "@/components/sector-panel"
import { CheckCircle2, X } from "lucide-react"
import type { AccessMode } from "@/lib/types"

export type ActiveView = "dashboard" | "sectors" | "investigation" | "audit" | "compliance"

function AuthenticatedApp() {
  const { user } = useAuth()
  const [accessMode, setAccessMode] = useState<AccessMode>("monitoring")
  const [activeView, setActiveView] = useState<ActiveView>("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showWelcome])

  return (
    <div className="relative flex h-screen overflow-hidden">
      <AppSidebar
        accessMode={accessMode}
        onAccessModeChange={setAccessMode}
        activeView={activeView}
        onViewChange={setActiveView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="flex-1 overflow-auto">
        {activeView === "dashboard" && <Dashboard accessMode={accessMode} />}
        {activeView === "sectors" && <SectorPanel />}
        {activeView === "investigation" && (
          <InvestigationPanel accessMode={accessMode} onModeChange={setAccessMode} />
        )}
        {activeView === "audit" && <AuditLogPanel />}
        {activeView === "compliance" && <CompliancePanel />}
      </main>

      {/* Login success confirmation banner */}
      {showWelcome && user && (
        <div className="animate-in slide-in-from-top fade-in duration-300 absolute left-1/2 top-4 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-card px-4 py-3 shadow-lg shadow-primary/5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Login successful
              </p>
              <p className="text-xs text-muted-foreground">
                Welcome back, {user.displayName}. Clearance: {user.clearance}
              </p>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="ml-4 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AppContent() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return <AuthenticatedApp />
}

export function AppShell() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
