"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Server,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Database,
} from "lucide-react"

const complianceChecks = [
  {
    category: "Data Protection",
    icon: Lock,
    items: [
      { name: "AES-256 Encryption (At Rest)", status: "pass", detail: "All stored data encrypted" },
      { name: "TLS 1.3 Encryption (In Transit)", status: "pass", detail: "All connections secured" },
      { name: "Data Minimization", status: "pass", detail: "Non-relevant footage auto-discarded" },
      { name: "Purpose Limitation", status: "pass", detail: "Access requires declared purpose" },
    ],
  },
  {
    category: "Privacy Controls",
    icon: Eye,
    items: [
      { name: "Default Identity Masking", status: "pass", detail: "All feeds masked by default" },
      { name: "No Permanent De-masking", status: "pass", detail: "All reveals are time-bound" },
      { name: "Auto Re-masking", status: "pass", detail: "Expired reveals auto-revert" },
      { name: "License Plate Masking", status: "warning", detail: "Optional - not enabled on all cameras" },
    ],
  },
  {
    category: "Access Control",
    icon: Users,
    items: [
      { name: "Role-Based Access Control", status: "pass", detail: "Unified admin with mode enforcement" },
      { name: "Multi-Factor Authentication", status: "pass", detail: "Required for sensitive operations" },
      { name: "Least-Privilege Enforcement", status: "pass", detail: "Mode-based access restrictions" },
      { name: "No Silent Privilege Escalation", status: "pass", detail: "All mode changes logged" },
    ],
  },
  {
    category: "Audit & Accountability",
    icon: FileText,
    items: [
      { name: "Immutable Audit Logs", status: "pass", detail: "Cryptographically signed, tamper-proof" },
      { name: "Complete Action Logging", status: "pass", detail: "Every access and action recorded" },
      { name: "Automatic Access Expiration", status: "pass", detail: "Time-bound controls enforced" },
      { name: "Justification Workflows", status: "pass", detail: "Case ID & reason required" },
    ],
  },
  {
    category: "Infrastructure Security",
    icon: Server,
    items: [
      { name: "Edge Node Isolation", status: "pass", detail: "Processing nodes operate independently" },
      { name: "No Raw Footage Storage", status: "pass", detail: "Only masked data reaches central" },
      { name: "Fault-Tolerant Architecture", status: "pass", detail: "No single point of failure" },
      { name: "Secure Key Management", status: "pass", detail: "HSM-backed key storage" },
    ],
  },
]

const regulations = [
  {
    name: "NDPR",
    fullName: "Nigeria Data Protection Regulation",
    status: "compliant",
    lastAudit: "2026-01-15",
    score: 96,
  },
  {
    name: "GDPR",
    fullName: "General Data Protection Regulation (Principles)",
    status: "compliant",
    lastAudit: "2026-01-15",
    score: 94,
  },
]

export function CompliancePanel() {
  const totalChecks = complianceChecks.reduce((acc, cat) => acc + cat.items.length, 0)
  const passedChecks = complianceChecks.reduce(
    (acc, cat) => acc + cat.items.filter((i) => i.status === "pass").length,
    0
  )
  const overallScore = Math.round((passedChecks / totalChecks) * 100)

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Compliance & Governance</h1>
        <p className="text-sm text-muted-foreground">
          System-wide compliance status and regulatory alignment overview
        </p>
      </div>

      {/* Overall Score */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-6">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(222, 30%, 14%)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="hsl(160, 84%, 39%)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${overallScore * 2.64} ${264 - overallScore * 2.64}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold text-foreground">{overallScore}%</span>
              <span className="text-[10px] text-muted-foreground">Compliant</span>
            </div>
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">Overall Compliance</p>
          <p className="text-[11px] text-muted-foreground">{passedChecks}/{totalChecks} checks passed</p>
        </div>

        {/* Regulation Cards */}
        {regulations.map((reg) => (
          <div key={reg.name} className="flex flex-col justify-between rounded-lg border border-border bg-card p-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">{reg.name}</h3>
                <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Compliant
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{reg.fullName}</p>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Alignment Score</span>
                <span className="font-medium text-foreground">{reg.score}%</span>
              </div>
              <Progress value={reg.score} className="mt-2 h-2 bg-secondary [&>div]:bg-emerald-500" />
              <div className="mt-3 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  Last Audit: {new Date(reg.lastAudit).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Checks */}
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">Detailed Compliance Checks</h2>
        {complianceChecks.map((category) => {
          const Icon = category.icon
          const categoryPassed = category.items.filter((i) => i.status === "pass").length
          return (
            <div key={category.category} className="rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-foreground">{category.category}</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {categoryPassed}/{category.items.length} checks passed
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "px-2 py-0.5 text-[10px]",
                    categoryPassed === category.items.length
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  )}
                >
                  {categoryPassed === category.items.length ? "All Clear" : "Attention"}
                </Badge>
              </div>
              <div className="divide-y divide-border">
                {category.items.map((item) => (
                  <div key={item.name} className="flex items-center gap-3 px-4 py-2.5">
                    {item.status === "pass" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                    )}
                    <div className="flex-1">
                      <span className="text-xs font-medium text-foreground">{item.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{item.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* System Architecture Info */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Architecture Overview</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-secondary/50 p-3">
            <p className="text-xs font-medium text-foreground">Video Capture Layer</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Secure CCTV ingestion with no local storage or analytics
            </p>
          </div>
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
            <p className="text-xs font-medium text-primary">Edge Processing Layer</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Privacy enforcement, masking, and event detection before central storage
            </p>
          </div>
          <div className="rounded-md border border-border bg-secondary/50 p-3">
            <p className="text-xs font-medium text-foreground">Secure Storage Layer</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              AES-256 encrypted storage with RBAC and immutable audit logs
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
