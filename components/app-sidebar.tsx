"use client"

import React from "react"

import { cn } from "@/lib/utils"
import type { AccessMode } from "@/lib/types"
import type { ActiveView } from "@/components/app-shell"
import { useAuth } from "@/components/auth-provider"
import {
  Shield,
  LayoutDashboard,
  Search,
  FileText,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
  Lock,
  Radio,
  LogOut,
  UserCircle,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems: { id: ActiveView; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "investigation", label: "Investigation", icon: Search },
  { id: "audit", label: "Audit Logs", icon: FileText },
  { id: "compliance", label: "Compliance", icon: ShieldCheck },
]

const modeConfig: Record<AccessMode, { label: string; icon: React.ElementType; color: string }> = {
  monitoring: { label: "Monitoring", icon: Eye, color: "text-emerald-400" },
  investigation: { label: "Investigation", icon: Search, color: "text-sky-400" },
  "authorized-reveal": { label: "Auth. Reveal", icon: Lock, color: "text-amber-400" },
  audit: { label: "Audit", icon: FileText, color: "text-slate-400" },
  emergency: { label: "Emergency", icon: AlertTriangle, color: "text-red-400" },
}

interface AppSidebarProps {
  accessMode: AccessMode
  onAccessModeChange: (mode: AccessMode) => void
  activeView: ActiveView
  onViewChange: (view: ActiveView) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function AppSidebar({
  accessMode,
  activeView,
  onViewChange,
  collapsed,
  onToggleCollapse,
}: AppSidebarProps) {
  const { user, logout } = useAuth()
  const currentMode = modeConfig[accessMode]
  const ModeIcon = currentMode.icon

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-border bg-card transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">CivicWatch</span>
              <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">NG</span>
            </div>
          )}
        </div>

        {/* Access Mode Indicator */}
        <div className={cn("border-b border-border px-4 py-3", collapsed && "px-2")}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-center">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-md bg-secondary", currentMode.color)}>
                    <ModeIcon className="h-4 w-4" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">{currentMode.label} Mode</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-2">
              <Radio className={cn("h-3 w-3 animate-pulse", currentMode.color)} />
              <span className={cn("text-xs font-medium", currentMode.color)}>
                {currentMode.label} Mode
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id

              const button = (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              )

              if (collapsed) {
                return (
                  <li key={item.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>{button}</TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                )
              }

              return <li key={item.id}>{button}</li>
            })}
          </ul>
        </nav>

        {/* User Profile & System Status */}
        <div className="border-t border-border px-2 py-3">
          {/* User info */}
          {user && !collapsed && (
            <div className="mb-3 rounded-md bg-secondary px-3 py-2">
              <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4 shrink-0 text-primary" />
                <div className="flex-1 truncate">
                  <p className="truncate text-xs font-medium text-foreground">{user.displayName}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{user.role}</p>
                </div>
              </div>
            </div>
          )}
          {user && collapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="mb-3 flex items-center justify-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
                    <UserCircle className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs font-medium">{user.displayName}</p>
                <p className="text-[10px] text-muted-foreground">{user.role}</p>
              </TooltipContent>
            </Tooltip>
          )}

          {!collapsed && (
            <div className="mb-3 rounded-md bg-secondary px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-muted-foreground">System Secure</span>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                AES-256 Encryption Active
              </p>
            </div>
          )}

          {/* Logout button */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={logout}
                  className="flex w-full items-center justify-center rounded-md py-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Sign Out</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          )}

          {/* Collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="mt-1 flex w-full items-center justify-center rounded-md py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
