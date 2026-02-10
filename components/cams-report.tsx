"use client"

import { useState } from "react"
import type { Camera, CameraActivity } from "@/lib/types"
import { cameras, incidents, cameraActivities } from "@/lib/mock-data"
import { copyReportToClipboard, generateShareableLink } from "@/lib/report-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Download,
  Copy,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  FileJson,
  Share2,
  Filter,
  Mail,
  Link as LinkIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CamsReportProps {
  onClose?: () => void
}

export function CamsReport({ onClose }: CamsReportProps) {
  const [selectedZone, setSelectedZone] = useState<string>("all")
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json")
  const [copied, setCopied] = useState(false)

  const zones = Array.from(new Set(cameras.map((c) => c.zone)))
  const filteredCameras =
    selectedZone === "all"
      ? cameras
      : cameras.filter((c) => c.zone === selectedZone)

  // Generate report data
  const generateReportData = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      reportedBy: "madeena.umar@civicwatch.ng",
      facility: "CivicWatch NG - Main Facility",
      period: "2026-02-06 (24 hours)",
      summary: {
        totalCameras: cameras.length,
        onlineCameras: cameras.filter((c) => c.status === "online").length,
        totalActivity: cameras.reduce(
          (sum, c) => sum + (cameraActivities[c.id]?.length || 0),
          0
        ),
        totalIncidents: incidents.length,
        criticalAlerts: incidents.filter((i) => i.severity === "critical").length,
      },
      cameras: filteredCameras.map((camera) => {
        const cameraIncidents = incidents.filter((i) => i.cameraId === camera.id)
        const activity = cameraActivities[camera.id] || []
        const activityByType = Object.entries(
          activity.reduce(
            (acc, a) => {
              acc[a.type] = (acc[a.type] || 0) + 1
              return acc
            },
            {} as Record<string, number>
          )
        )

        return {
          id: camera.id,
          name: camera.name,
          location: camera.location,
          zone: camera.zone,
          status: camera.status,
          coordinates: { lat: camera.lat, lng: camera.lng },
          activity: {
            totalEvents: activity.length,
            breakdown: Object.fromEntries(activityByType),
            highestConfidenceDetection: activity.length
              ? Math.max(...activity.map((a) => a.confidence))
              : 0,
            averageConfidence:
              activity.length > 0
                ? Math.round(activity.reduce((s, a) => s + a.confidence, 0) / activity.length)
                : 0,
            peakHour: activity.length
              ? "14:00-15:00"
              : "N/A",
            totalPersonDetections: activity.filter(
              (a) => a.type === "person_entry" || a.type === "person_exit"
            ).length,
            totalVehicleDetections: activity.filter((a) => a.type === "vehicle").length,
            totalAnomalies: activity.filter((a) => a.type === "anomaly").length,
          },
          incidents: cameraIncidents.map((inc) => ({
            id: inc.id,
            type: inc.type,
            severity: inc.severity,
            description: inc.description,
            timestamp: inc.timestamp,
            status: inc.status,
          })),
          recentActivity: activity.slice(0, 10).map((act) => ({
            timestamp: act.timestamp,
            type: act.type,
            description: act.description,
            confidence: act.confidence,
            personCount: act.personCount,
            faceMatches: act.faceMatches,
          })),
        }
      }),
    }
    return report
  }

  const reportData = generateReportData()

  // Export functions
  const exportAsJSON = () => {
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `cams-report-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportAsCSV = () => {
    let csv = "CAMS Activity Report\n"
    csv += `Generated: ${new Date().toISOString()}\n`
    csv += `Reported By: ${reportData.reportedBy}\n\n`

    csv += "SUMMARY\n"
    csv += `Total Cameras,${reportData.summary.totalCameras}\n`
    csv += `Online Cameras,${reportData.summary.onlineCameras}\n`
    csv += `Total Activity Events,${reportData.summary.totalActivity}\n`
    csv += `Total Incidents,${reportData.summary.totalIncidents}\n`
    csv += `Critical Alerts,${reportData.summary.criticalAlerts}\n\n`

    csv += "CAMERA-BY-CAMERA BREAKDOWN\n"
    csv += "Camera ID,Name,Location,Zone,Status,Total Events,Person Detections,Vehicle Detections,Incidents,Avg Confidence\n"

    reportData.cameras.forEach((cam) => {
      csv += `${cam.id},"${cam.name}","${cam.location}",${cam.zone},${cam.status},${cam.activity.totalEvents},${cam.activity.totalPersonDetections},${cam.activity.totalVehicleDetections},${cam.incidents.length},${cam.activity.averageConfidence}%\n`
    })

    const dataBlob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `cams-report-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(reportData, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activityTypeColors: Record<string, string> = {
    person_entry: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    person_exit: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    vehicle: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    package: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    anomaly: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    system_event: "bg-green-500/10 text-green-400 border-green-500/20",
    intrusion: "bg-red-500/10 text-red-400 border-red-500/20",
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">CAMs Activity Report</h1>
        <p className="text-sm text-muted-foreground">
          Comprehensive surveillance activity across all camera locations and entrances
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger className="w-32 h-9 text-xs">
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              {zones.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={exportAsJSON}
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
          >
            <FileJson className="h-3.5 w-3.5" />
            JSON Export
          </Button>
          <Button
            onClick={exportAsCSV}
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
          >
            <Download className="h-3.5 w-3.5" />
            CSV Export
          </Button>
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied" : "Copy JSON"}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Share Report</DialogTitle>
                <DialogDescription>
                  Choose how to share this CAMs activity report
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => {
                    const link = generateShareableLink(reportData)
                    navigator.clipboard.writeText(link)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  variant="outline"
                  className="gap-2 justify-start"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  <div className="flex flex-col items-start">
                    <span>Copy Shareable Link</span>
                    <span className="text-[10px] text-muted-foreground">
                      {copied ? "Copied to clipboard" : "URL-encoded report"}
                    </span>
                  </div>
                </Button>
                <Button
                  onClick={() => {
                    copyReportToClipboard("email", reportData)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  variant="outline"
                  className="gap-2 justify-start"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <div className="flex flex-col items-start">
                    <span>Copy for Email</span>
                    <span className="text-[10px] text-muted-foreground">
                      {copied ? "Copied to clipboard" : "Formatted email body"}
                    </span>
                  </div>
                </Button>
                <Button
                  onClick={() => {
                    copyReportToClipboard("json", reportData)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  variant="outline"
                  className="gap-2 justify-start"
                >
                  <FileJson className="h-3.5 w-3.5" />
                  <div className="flex flex-col items-start">
                    <span>Copy as JSON</span>
                    <span className="text-[10px] text-muted-foreground">
                      {copied ? "Copied to clipboard" : "Full JSON format"}
                    </span>
                  </div>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">Total Cameras</p>
          <p className="mt-1 text-lg font-bold text-foreground">
            {reportData.summary.totalCameras}
          </p>
          <p className="mt-0.5 text-[10px] text-emerald-400">
            {reportData.summary.onlineCameras} online
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">Activity Events</p>
          <p className="mt-1 text-lg font-bold text-foreground">
            {reportData.summary.totalActivity}
          </p>
          <p className="mt-0.5 text-[10px] text-cyan-400">Last 24 hours</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">Total Incidents</p>
          <p className="mt-1 text-lg font-bold text-foreground">
            {reportData.summary.totalIncidents}
          </p>
          <p className="mt-0.5 text-[10px] text-amber-400">
            {reportData.summary.criticalAlerts} critical
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-xs text-muted-foreground">Report Date</p>
          <p className="mt-1 text-[10px] font-bold text-foreground">
            {new Date().toLocaleDateString()}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Per-Camera Reports */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          Camera-by-Camera Activity Breakdown
        </h2>

        <div className="flex flex-col gap-4">
          {reportData.cameras.map((cam) => (
            <div
              key={cam.id}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              {/* Camera Header */}
              <div className="border-b border-border bg-secondary/50 px-4 py-3 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{cam.name}</h3>
                    <Badge variant="outline" className="text-[10px]">
                      {cam.id}
                    </Badge>
                    <Badge
                      variant={cam.status === "online" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {cam.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {cam.location} • {cam.zone}
                  </p>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-2 gap-2 px-4 py-3 sm:grid-cols-5">
                <div className="rounded bg-secondary/50 p-2">
                  <p className="text-[10px] text-muted-foreground">Total Events</p>
                  <p className="text-sm font-bold text-foreground">
                    {cam.activity.totalEvents}
                  </p>
                </div>
                <div className="rounded bg-secondary/50 p-2">
                  <p className="text-[10px] text-muted-foreground">Persons</p>
                  <p className="text-sm font-bold text-blue-400">
                    {cam.activity.totalPersonDetections}
                  </p>
                </div>
                <div className="rounded bg-secondary/50 p-2">
                  <p className="text-[10px] text-muted-foreground">Vehicles</p>
                  <p className="text-sm font-bold text-orange-400">
                    {cam.activity.totalVehicleDetections}
                  </p>
                </div>
                <div className="rounded bg-secondary/50 p-2">
                  <p className="text-[10px] text-muted-foreground">Anomalies</p>
                  <p className="text-sm font-bold text-amber-400">
                    {cam.activity.totalAnomalies}
                  </p>
                </div>
                <div className="rounded bg-secondary/50 p-2">
                  <p className="text-[10px] text-muted-foreground">Confidence</p>
                  <p className="text-sm font-bold text-emerald-400">
                    {cam.activity.averageConfidence}%
                  </p>
                </div>
              </div>

              {/* Recent Activity */}
              {cam.recentActivity.length > 0 && (
                <div className="border-t border-border px-4 py-3">
                  <p className="text-xs font-semibold text-foreground mb-2">
                    Recent Activity ({cam.recentActivity.length})
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {cam.recentActivity.slice(0, 5).map((act, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-[11px]"
                      >
                        <Badge
                          variant="outline"
                          className={`${activityTypeColors[act.type] || "bg-secondary/50"} whitespace-nowrap`}
                        >
                          {act.type.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-muted-foreground flex-1">
                          {act.description}
                        </span>
                        <span className="text-muted-foreground whitespace-nowrap">
                          {new Date(act.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Incidents */}
              {cam.incidents.length > 0 && (
                <div className="border-t border-border px-4 py-3 bg-red-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                    <p className="text-xs font-semibold text-foreground">
                      Incidents ({cam.incidents.length})
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {cam.incidents.map((inc, idx) => (
                      <div key={idx} className="text-[10px]">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              inc.severity === "critical"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-[9px]"
                          >
                            {inc.severity}
                          </Badge>
                          <span className="text-muted-foreground">
                            {inc.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-lg border border-border bg-card px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Report generated by Madeena Umar on {new Date().toLocaleString()} •{" "}
          <span className="text-primary">Encrypted & Compliant</span>
        </p>
      </div>
    </div>
  )
}
