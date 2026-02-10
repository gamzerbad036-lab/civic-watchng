"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { cn } from "@/lib/utils"
import type { AccessMode } from "@/lib/types"
import { cameras, revealRequests as initialRequests, incidents } from "@/lib/mock-data"
import { CameraFeed } from "@/components/camera-feed"
import { CamsReport } from "@/components/cams-report"
import { VehicleTrackingPanel } from "@/components/vehicle-tracking-panel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  Lock,
  Eye,
  EyeOff,
  Clock,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileSearch,
  Fingerprint,
  ScanFace,
  Activity,
  TrendingUp,
  BarChart3,
  Users,
  Bell,
  BellRing,
  Radio,
  MapPin,
  Crosshair,
  Timer,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  Target,
  ScanLine,
  Car,
} from "lucide-react"

interface InvestigationPanelProps {
  accessMode: AccessMode
  onModeChange: (mode: AccessMode) => void
}

const statusConfig = {
  pending: { label: "Pending", color: "border-amber-500/30 bg-amber-500/10 text-amber-400", icon: Clock },
  approved: { label: "Approved", color: "border-sky-500/30 bg-sky-500/10 text-sky-400", icon: CheckCircle2 },
  active: { label: "Active", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400", icon: Eye },
  expired: { label: "Expired", color: "border-muted-foreground/30 bg-muted/50 text-muted-foreground", icon: XCircle },
  denied: { label: "Denied", color: "border-red-500/30 bg-red-500/10 text-red-400", icon: XCircle },
}

// Simulated real-time alerts
interface LiveAlert {
  id: string
  type: "face-match" | "anomaly" | "perimeter" | "tracking" | "system"
  severity: "info" | "warning" | "critical"
  message: string
  camera: string
  timestamp: Date
  acknowledged: boolean
}

const alertTypeConfig = {
  "face-match": { icon: ScanFace, label: "Face Match", color: "text-red-400" },
  anomaly: { icon: Activity, label: "Anomaly", color: "text-amber-400" },
  perimeter: { icon: ShieldAlert, label: "Perimeter", color: "text-orange-400" },
  tracking: { icon: Crosshair, label: "Tracking", color: "text-sky-400" },
  system: { icon: Zap, label: "System", color: "text-muted-foreground" },
}

const alertSeverityStyles = {
  info: "border-sky-500/20 bg-sky-500/5",
  warning: "border-amber-500/20 bg-amber-500/5",
  critical: "border-red-500/20 bg-red-500/5 animate-pulse",
}

// Analytics data
const hourlyDetections = [12, 18, 8, 24, 32, 28, 15, 22, 37, 29, 19, 25, 31, 42, 38, 26, 20, 35, 28, 14, 22, 17, 11, 9]
const zoneActivity = [
  { zone: "Zone A", persons: 142, vehicles: 38, alerts: 3, trend: "up" as const },
  { zone: "Zone B", persons: 98, vehicles: 12, alerts: 2, trend: "down" as const },
  { zone: "Zone C", persons: 67, vehicles: 5, alerts: 5, trend: "up" as const },
  { zone: "Zone D", persons: 45, vehicles: 8, alerts: 1, trend: "flat" as const },
]

const faceMatchResults = [
  { id: "fm-001", matchScore: 96.4, camera: "Main Gate A", time: "14:23:05", status: "confirmed" as const },
  { id: "fm-002", matchScore: 87.2, camera: "Lobby Central", time: "13:45:12", status: "pending" as const },
  { id: "fm-003", matchScore: 72.1, camera: "Parking Lot B", time: "12:30:44", status: "rejected" as const },
  { id: "fm-004", matchScore: 91.8, camera: "Loading Bay", time: "11:15:30", status: "confirmed" as const },
]

function useSimulatedAlerts() {
  const [alerts, setAlerts] = useState<LiveAlert[]>([
    {
      id: "alert-001",
      type: "perimeter",
      severity: "critical",
      message: "Unauthorized movement detected near south perimeter fence",
      camera: "Perimeter South",
      timestamp: new Date(Date.now() - 120000),
      acknowledged: false,
    },
    {
      id: "alert-002",
      type: "face-match",
      severity: "warning",
      message: "Potential face match (87.2%) at Lobby Central - pending verification",
      camera: "Lobby Central",
      timestamp: new Date(Date.now() - 300000),
      acknowledged: false,
    },
    {
      id: "alert-003",
      type: "anomaly",
      severity: "warning",
      message: "Unusual activity pattern detected in Server Room",
      camera: "Server Room",
      timestamp: new Date(Date.now() - 600000),
      acknowledged: true,
    },
    {
      id: "alert-004",
      type: "tracking",
      severity: "info",
      message: "Object tracking initiated - suspect vehicle entering Zone A",
      camera: "Main Gate A",
      timestamp: new Date(Date.now() - 900000),
      acknowledged: true,
    },
  ])

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a))
  }, [])

  // Simulate new alerts arriving
  useEffect(() => {
    const newAlertTypes: LiveAlert["type"][] = ["face-match", "anomaly", "perimeter", "tracking", "system"]
    const newAlertMessages: Record<string, string[]> = {
      "face-match": ["New face match candidate detected", "Face recognition confidence threshold exceeded"],
      anomaly: ["Behavioral anomaly flagged by AI analysis", "Unusual crowd formation detected"],
      perimeter: ["Motion sensor triggered at perimeter boundary", "Fence vibration alert activated"],
      tracking: ["Multi-camera handoff completed for tracked subject", "Object re-identified after occlusion"],
      system: ["Camera auto-calibration completed", "Network latency spike on camera feed"],
    }
    const cameraNames = cameras.map(c => c.name)

    const interval = setInterval(() => {
      const type = newAlertTypes[Math.floor(Math.random() * newAlertTypes.length)]
      const msgs = newAlertMessages[type]
      const newAlert: LiveAlert = {
        id: `alert-${Date.now()}`,
        type,
        severity: type === "perimeter" ? "critical" : type === "face-match" ? "warning" : "info",
        message: msgs[Math.floor(Math.random() * msgs.length)],
        camera: cameraNames[Math.floor(Math.random() * cameraNames.length)],
        timestamp: new Date(),
        acknowledged: false,
      }
      setAlerts(prev => [newAlert, ...prev].slice(0, 20))
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  return { alerts, acknowledgeAlert }
}

function AnalyticsMiniChart({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data)
  const barWidth = 100 / data.length
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height: `${height}px` }}>
      {data.map((val, i) => {
        const barH = (val / max) * (height - 4)
        return (
          <rect
            key={i}
            x={i * barWidth + 0.5}
            y={height - barH - 2}
            width={Math.max(barWidth - 1, 1)}
            height={barH}
            rx={1}
            fill={color}
            opacity={0.7 + (i / data.length) * 0.3}
          />
        )
      })}
    </svg>
  )
}

export function InvestigationPanel({ accessMode, onModeChange }: InvestigationPanelProps) {
  const [selectedCamera, setSelectedCamera] = useState<string>("")
  const [reason, setReason] = useState("")
  const [caseId, setCaseId] = useState("")
  const [duration, setDuration] = useState("15")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [revealRequests, setRevealRequests] = useState(initialRequests)
  const [mfaCode, setMfaCode] = useState("")
  const [step, setStep] = useState<"form" | "mfa" | "confirmed">("form")
  const [activeTab, setActiveTab] = useState("overview")
  const { alerts, acknowledgeAlert } = useSimulatedAlerts()

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length

  const handleSubmitRequest = () => {
    if (!selectedCamera || !reason || !caseId) return
    setStep("mfa")
  }

  const handleVerifyMfa = () => {
    if (mfaCode.length < 6) return

    const cam = cameras.find((c) => c.id === selectedCamera)
    const newRequest = {
      id: `rev-${String(revealRequests.length + 1).padStart(3, "0")}`,
      cameraId: selectedCamera,
      cameraName: cam?.name || selectedCamera,
      reason,
      caseId,
      duration: Number.parseInt(duration),
      status: "active" as const,
      requestedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + Number.parseInt(duration) * 60 * 1000).toISOString(),
      requestedBy: "madeena.umar@civicwatch.ng",
    }

    setRevealRequests([newRequest, ...revealRequests])
    onModeChange("authorized-reveal")
    setStep("confirmed")

    setTimeout(() => {
      setDialogOpen(false)
      setStep("form")
      setSelectedCamera("")
      setReason("")
      setCaseId("")
      setMfaCode("")
      setDuration("15")
    }, 2000)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Investigation Center</h1>
          <p className="text-sm text-muted-foreground">
            Advanced surveillance investigation tools, real-time tracking, and analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Alert indicator */}
          {unacknowledgedCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
              <BellRing className="h-4 w-4 animate-pulse text-red-400" />
              <span className="text-xs font-medium text-red-400">{unacknowledgedCount} active</span>
            </div>
          )}
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setStep("form"); setMfaCode("") } }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Lock className="h-4 w-4" />
                New Reveal Request
              </Button>
            </DialogTrigger>
            <DialogContent className="gap-0 border-border bg-card sm:max-w-lg">
              {step === "form" && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                      <ShieldAlert className="h-5 w-5 text-amber-400" />
                      Request Identity Reveal
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      This action is logged, time-bound, and requires MFA verification. All reveals are subject to audit review.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 py-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-medium text-foreground">Camera Feed</Label>
                      <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                        <SelectTrigger className="border-border bg-secondary">
                          <SelectValue placeholder="Select camera" />
                        </SelectTrigger>
                        <SelectContent>
                          {cameras.filter((c) => c.status === "online").map((cam) => (
                            <SelectItem key={cam.id} value={cam.id}>
                              {cam.name} ({cam.location})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-medium text-foreground">Case ID</Label>
                      <Input placeholder="CW-2026-XXXX" value={caseId} onChange={(e) => setCaseId(e.target.value)} className="border-border bg-secondary font-mono text-sm" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-medium text-foreground">Justification</Label>
                      <Textarea placeholder="Provide detailed reason for identity reveal..." value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-[80px] border-border bg-secondary text-sm" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-xs font-medium text-foreground">Duration</Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="border-border bg-secondary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSubmitRequest} disabled={!selectedCamera || !reason || !caseId} className="gap-2 bg-amber-600 text-white hover:bg-amber-700">
                      <Lock className="h-4 w-4" /> Proceed to MFA Verification
                    </Button>
                  </DialogFooter>
                </>
              )}

              {step === "mfa" && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                      <Lock className="h-5 w-5 text-amber-400" />
                      MFA Verification Required
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Enter your 6-digit verification code to authorize this identity reveal.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
                      <Lock className="h-8 w-8 text-amber-400" />
                    </div>
                    <Input
                      placeholder="000000"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="mx-auto max-w-[200px] border-border bg-secondary text-center font-mono text-2xl tracking-[0.5em]"
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground">Hint: Enter any 6 digits for demo</p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setStep("form")} className="border-border text-foreground">Back</Button>
                    <Button onClick={handleVerifyMfa} disabled={mfaCode.length < 6} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                      <CheckCircle2 className="h-4 w-4" /> Verify & Authorize
                    </Button>
                  </DialogFooter>
                </>
              )}

              {step === "confirmed" && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground">Reveal Authorized</h3>
                    <p className="text-sm text-muted-foreground">Identity reveal active for {duration} minutes.</p>
                    <p className="mt-1 text-xs text-muted-foreground">This action has been permanently logged.</p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-4">
        <TabsList className="w-fit border border-border bg-card">
          <TabsTrigger value="overview" className="gap-2 text-xs data-[state=active]:bg-secondary">
            <Search className="h-3.5 w-3.5" /> Investigation
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2 text-xs data-[state=active]:bg-secondary">
            <Bell className="h-3.5 w-3.5" /> Live Alerts
            {unacknowledgedCount > 0 && (
              <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unacknowledgedCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="face-tracking" className="gap-2 text-xs data-[state=active]:bg-secondary">
            <ScanFace className="h-3.5 w-3.5" /> Face Tracking
          </TabsTrigger>
          <TabsTrigger value="vehicle-tracking" className="gap-2 text-xs data-[state=active]:bg-secondary">
            <Car className="h-3.5 w-3.5" /> Vehicle Track
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 text-xs data-[state=active]:bg-secondary">
            <BarChart3 className="h-3.5 w-3.5" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="cams-report" className="gap-2 text-xs data-[state=active]:bg-secondary">
            <FileSearch className="h-3.5 w-3.5" /> CAMs Report
          </TabsTrigger>
        </TabsList>

        {/* === INVESTIGATION TAB === */}
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Camera Preview & Quick Select */}
            <div className="lg:col-span-1">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Feed Preview</h3>
              {selectedCamera ? (
                <CameraFeed
                  camera={cameras.find((c) => c.id === selectedCamera) || cameras[0]}
                  masked={accessMode !== "authorized-reveal"}
                />
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed border-border bg-card">
                  <div className="text-center">
                    <FileSearch className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-xs text-muted-foreground">Select a camera to preview</p>
                  </div>
                </div>
              )}
              <div className="mt-3 flex flex-col gap-1.5">
                {cameras.filter((c) => c.status === "online").slice(0, 5).map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => setSelectedCamera(cam.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2 text-left text-xs transition-colors",
                      selectedCamera === cam.id
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="flex-1 font-medium">{cam.name}</span>
                    <span className="text-[10px]">{cam.location}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reveal Requests */}
            <div className="lg:col-span-2">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Reveal Requests</h3>
              <div className="flex flex-col gap-3">
                {revealRequests.map((req) => {
                  const config = statusConfig[req.status]
                  const StatusIcon = config.icon
                  return (
                    <div key={req.id} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{req.cameraName}</span>
                            <Badge variant="outline" className={cn("gap-1 px-1.5 py-0 text-[10px]", config.color)}>
                              <StatusIcon className="h-2.5 w-2.5" /> {config.label}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{req.reason}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-mono text-xs text-muted-foreground">{req.caseId}</p>
                          <p className="text-[10px] text-muted-foreground">{req.duration} min</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-border pt-3">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(req.requestedAt).toLocaleString()}
                          </span>
                        </div>
                        {req.expiresAt && (
                          <div className="flex items-center gap-1.5">
                            <Timer className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">
                              Expires: {new Date(req.expiresAt).toLocaleString()}
                            </span>
                          </div>
                        )}
                        <span className="ml-auto text-[10px] text-muted-foreground">{req.requestedBy}</span>
                      </div>
                      {req.status === "active" && (
                        <div className="mt-3">
                          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                            <div className="h-full w-2/3 rounded-full bg-emerald-500 transition-all" />
                          </div>
                          <p className="mt-1 text-[10px] text-emerald-400">Time remaining in reveal window</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* === LIVE ALERTS TAB === */}
        <TabsContent value="alerts" className="mt-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Alert stats */}
            <div className="lg:col-span-1">
              <div className="flex flex-col gap-3">
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500/10">
                      <BellRing className="h-4 w-4 text-red-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{unacknowledgedCount}</p>
                      <p className="text-[10px] text-muted-foreground">Unacknowledged</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{alerts.filter(a => a.severity === "critical").length}</p>
                      <p className="text-[10px] text-muted-foreground">Critical Alerts</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{alerts.length}</p>
                      <p className="text-[10px] text-muted-foreground">Total (24h)</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="mb-2 text-[11px] font-medium text-foreground">Alert Types</p>
                  {Object.entries(alertTypeConfig).map(([type, config]) => {
                    const Icon = config.icon
                    const count = alerts.filter(a => a.type === type).length
                    return (
                      <div key={type} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-1.5">
                          <Icon className={cn("h-3 w-3", config.color)} />
                          <span className="text-[10px] text-muted-foreground">{config.label}</span>
                        </div>
                        <span className="text-[10px] font-medium text-foreground">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Alert feed */}
            <div className="lg:col-span-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Real-Time Alert Feed</h3>
                <div className="flex items-center gap-1.5">
                  <Radio className="h-3 w-3 animate-pulse text-red-400" />
                  <span className="text-[10px] text-red-400">Live</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {alerts.map((alert) => {
                  const typeConf = alertTypeConfig[alert.type]
                  const TypeIcon = typeConf.icon
                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                        alert.acknowledged ? "border-border bg-card" : alertSeverityStyles[alert.severity]
                      )}
                    >
                      <div className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                        alert.severity === "critical" ? "bg-red-500/10" : alert.severity === "warning" ? "bg-amber-500/10" : "bg-sky-500/10"
                      )}>
                        <TypeIcon className={cn("h-4 w-4", typeConf.color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">{typeConf.label}</span>
                          <Badge variant="outline" className={cn(
                            "px-1 py-0 text-[9px]",
                            alert.severity === "critical" ? "border-red-500/30 text-red-400" :
                            alert.severity === "warning" ? "border-amber-500/30 text-amber-400" :
                            "border-sky-500/30 text-sky-400"
                          )}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          {!alert.acknowledged && (
                            <span className="h-2 w-2 rounded-full bg-red-400" />
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{alert.message}</p>
                        <div className="mt-1.5 flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">{alert.camera}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {alert.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </span>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="shrink-0 text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* === FACE TRACKING TAB === */}
        <TabsContent value="face-tracking" className="mt-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Face tracking controls */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ScanFace className="h-4 w-4 text-red-400" />
                  Face Recognition Engine
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="rounded-md bg-secondary p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground">Engine Status</span>
                      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-400">Active</Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Model Version</span>
                      <span className="text-[10px] font-mono text-foreground">v4.2.1-prod</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Accuracy</span>
                      <span className="text-[10px] font-mono text-foreground">97.8%</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-foreground">Multi-Camera Tracking</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-foreground">Cross-Zone Matching</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-foreground">Auto-Alert on Match</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-foreground">Liveness Detection</Label>
                      <Switch />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-xs text-foreground">Match Confidence Threshold</Label>
                    <div className="flex items-center gap-2">
                      <Progress value={80} className="flex-1" />
                      <span className="text-xs font-mono text-foreground">80%</span>
                    </div>
                  </div>

                  <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                      <p className="text-[10px] text-muted-foreground">
                        Face tracking requires authorized investigation mode. All matches are logged and subject to privacy review.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Face match results */}
            <div className="lg:col-span-2">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Face Match Results</h3>
              <div className="flex flex-col gap-3">
                {faceMatchResults.map((match) => (
                  <div key={match.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center gap-4">
                      {/* Face placeholder */}
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <ScanFace className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">Match {match.id.toUpperCase()}</span>
                          <Badge variant="outline" className={cn(
                            "px-1.5 py-0 text-[10px]",
                            match.status === "confirmed" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" :
                            match.status === "pending" ? "border-amber-500/30 bg-amber-500/10 text-amber-400" :
                            "border-red-500/30 bg-red-500/10 text-red-400"
                          )}>
                            {match.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground">Confidence: <span className={cn("font-semibold", match.matchScore >= 90 ? "text-emerald-400" : match.matchScore >= 80 ? "text-amber-400" : "text-red-400")}>{match.matchScore}%</span></span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground">{match.camera}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground">{match.time}</span>
                          </div>
                        </div>
                        {/* Confidence bar */}
                        <div className="mt-2">
                          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                match.matchScore >= 90 ? "bg-emerald-500" : match.matchScore >= 80 ? "bg-amber-500" : "bg-red-500"
                              )}
                              style={{ width: `${match.matchScore}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <Button size="sm" variant="outline" className="h-7 gap-1 border-border text-[10px] text-muted-foreground bg-transparent">
                          <ScanLine className="h-3 w-3" /> Review
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 gap-1 border-border text-[10px] text-muted-foreground bg-transparent">
                          <Crosshair className="h-3 w-3" /> Track
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cross-camera tracking timeline */}
              <div className="mt-6 rounded-lg border border-border bg-card p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Crosshair className="h-4 w-4 text-sky-400" />
                  Cross-Camera Tracking Timeline
                </h4>
                <div className="relative">
                  <div className="absolute left-4 top-0 h-full w-px bg-border" />
                  {[
                    { time: "14:23:05", camera: "Main Gate A", event: "Initial detection - subject entered facility", type: "entry" },
                    { time: "14:24:30", camera: "Lobby Central", event: "Camera handoff - subject crossed lobby", type: "tracking" },
                    { time: "14:26:15", camera: "Corridor L2", event: "Direction change - moved toward restricted area", type: "warning" },
                    { time: "14:28:44", camera: "Server Room", event: "Alert triggered - entered restricted zone", type: "alert" },
                  ].map((entry, i) => (
                    <div key={i} className="relative mb-4 flex items-start gap-4 pl-8 last:mb-0">
                      <div className={cn(
                        "absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 border-card",
                        entry.type === "alert" ? "bg-red-400" :
                        entry.type === "warning" ? "bg-amber-400" :
                        entry.type === "entry" ? "bg-primary" : "bg-sky-400"
                      )} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-foreground">{entry.time}</span>
                          <Badge variant="outline" className="border-border px-1 py-0 text-[9px] text-muted-foreground">{entry.camera}</Badge>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{entry.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* === VEHICLE TRACKING TAB === */}
        <TabsContent value="vehicle-tracking" className="mt-0">
          <VehicleTrackingPanel />
        </TabsContent>

        {/* === ANALYTICS TAB === */}
        <TabsContent value="analytics" className="mt-0">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            {/* Summary stats row */}
            {[
              { label: "Total Detections (24h)", value: "1,247", change: "+12%", up: true, icon: Users, color: "text-primary", bg: "bg-primary/10" },
              { label: "Active Tracks", value: "23", change: "+3", up: true, icon: Crosshair, color: "text-sky-400", bg: "bg-sky-500/10" },
              { label: "Face Matches", value: "8", change: "-2", up: false, icon: ScanFace, color: "text-amber-400", bg: "bg-amber-500/10" },
              { label: "Avg Response Time", value: "2.4s", change: "-0.3s", up: true, icon: Zap, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", stat.bg)}>
                      <Icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                    <div className="flex items-center gap-1">
                      {stat.up ? <ArrowUpRight className="h-3 w-3 text-emerald-400" /> : <ArrowDownRight className="h-3 w-3 text-red-400" />}
                      <span className={cn("text-[10px] font-medium", stat.up ? "text-emerald-400" : "text-red-400")}>{stat.change}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Hourly detections chart */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h4 className="mb-1 text-sm font-semibold text-foreground">Hourly Detections</h4>
              <p className="mb-3 text-[10px] text-muted-foreground">Person and object detections over the last 24 hours</p>
              <AnalyticsMiniChart data={hourlyDetections} color="hsl(160, 84%, 39%)" height={80} />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">00:00</span>
                <span className="text-[10px] text-muted-foreground">06:00</span>
                <span className="text-[10px] text-muted-foreground">12:00</span>
                <span className="text-[10px] text-muted-foreground">18:00</span>
                <span className="text-[10px] text-muted-foreground">23:00</span>
              </div>
            </div>

            {/* Zone breakdown */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h4 className="mb-1 text-sm font-semibold text-foreground">Zone Activity Breakdown</h4>
              <p className="mb-3 text-[10px] text-muted-foreground">Detection counts by zone in the last 24 hours</p>
              <div className="flex flex-col gap-3">
                {zoneActivity.map((zone) => {
                  const totalPossible = 200
                  return (
                    <div key={zone.zone}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">{zone.zone}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-muted-foreground">
                            <Users className="mr-0.5 inline h-3 w-3" /> {zone.persons}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            <AlertTriangle className="mr-0.5 inline h-3 w-3" /> {zone.alerts}
                          </span>
                          {zone.trend === "up" && <ArrowUpRight className="h-3 w-3 text-emerald-400" />}
                          {zone.trend === "down" && <ArrowDownRight className="h-3 w-3 text-red-400" />}
                          {zone.trend === "flat" && <Minus className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${(zone.persons / totalPossible) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Detection types breakdown */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h4 className="mb-1 text-sm font-semibold text-foreground">Detection Classification</h4>
              <p className="mb-3 text-[10px] text-muted-foreground">Object type distribution</p>
              <div className="flex flex-col gap-2.5">
                {[
                  { type: "Persons", count: 352, pct: 68, color: "bg-primary" },
                  { type: "Vehicles", count: 63, pct: 12, color: "bg-sky-500" },
                  { type: "Unidentified Objects", count: 48, pct: 9, color: "bg-amber-500" },
                  { type: "Animals", count: 31, pct: 6, color: "bg-emerald-600" },
                  { type: "False Positives", count: 26, pct: 5, color: "bg-muted-foreground" },
                ].map((item) => (
                  <div key={item.type} className="flex items-center gap-3">
                    <div className={cn("h-2.5 w-2.5 shrink-0 rounded-full", item.color)} />
                    <span className="flex-1 text-[11px] text-muted-foreground">{item.type}</span>
                    <span className="text-[11px] font-medium text-foreground">{item.count}</span>
                    <span className="w-8 text-right text-[10px] text-muted-foreground">{item.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System performance */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h4 className="mb-1 text-sm font-semibold text-foreground">System Performance</h4>
              <p className="mb-3 text-[10px] text-muted-foreground">AI and infrastructure metrics</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: "AI Processing Latency", value: "84ms", pct: 16 },
                  { label: "Camera Network Uptime", value: "99.7%", pct: 99.7 },
                  { label: "Storage Utilization", value: "67%", pct: 67 },
                  { label: "Model Inference Rate", value: "142 fps", pct: 71 },
                  { label: "Alert Response Time", value: "1.2s", pct: 88 },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">{metric.label}</span>
                      <span className="text-[11px] font-medium text-foreground">{metric.value}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          metric.pct > 90 ? "bg-emerald-500" : metric.pct > 60 ? "bg-primary" : "bg-amber-500"
                        )}
                        style={{ width: `${metric.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* === CAMS REPORT TAB === */}
        <TabsContent value="cams-report" className="mt-0">
          <CamsReport />
        </TabsContent>
      </Tabs>

      {/* Privacy Warning Banner */}
      <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
        <div>
          <p className="text-xs font-medium text-amber-400">Privacy Safeguard Notice</p>
          <p className="text-[11px] text-muted-foreground">
            All investigation actions including identity reveals, face tracking, and object tracking are permanently logged,
            time-bound, and subject to audit review. Unauthorized or unjustified use may result in system access revocation.
          </p>
        </div>
      </div>
    </div>
  )
}
