"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  vehicleTrackingRecords,
  cameraDetections,
  getCamerasWithVehicles,
  getCamerasWithoutVehicles,
  getCameraDetectionSummary,
} from "@/lib/detection-engine"
import type { VehicleTrackingRecord } from "@/lib/detection-engine"
import { cameras } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Car,
  Search,
  MapPin,
  Clock,
  ArrowRight,
  AlertTriangle,
  Shield,
  Target,
  Route,
  Eye,
  Crosshair,
  ScanFace,
  Users,
  ZoomIn,
  ChevronRight,
  ChevronDown,
} from "lucide-react"

export function VehicleTrackingPanel() {
  const [searchPlate, setSearchPlate] = useState("")
  const [selectedTrack, setSelectedTrack] = useState<VehicleTrackingRecord | null>(null)
  const [showCameraBreakdown, setShowCameraBreakdown] = useState(false)

  const camerasWithVehicles = getCamerasWithVehicles()
  const camerasWithoutVehicles = getCamerasWithoutVehicles()

  const filteredRecords = searchPlate
    ? vehicleTrackingRecords.filter((r) =>
        r.licensePlate.toLowerCase().includes(searchPlate.toLowerCase()) ||
        r.vehicleModel.toLowerCase().includes(searchPlate.toLowerCase()) ||
        r.vehicleColor.toLowerCase().includes(searchPlate.toLowerCase())
      )
    : vehicleTrackingRecords

  const riskColors = {
    low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    medium: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    high: "border-red-500/30 bg-red-500/10 text-red-400",
  }

  const statusColors = {
    active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    departed: "border-muted-foreground/30 bg-muted/50 text-muted-foreground",
    flagged: "border-red-500/30 bg-red-500/10 text-red-400",
    cleared: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left Panel - Vehicle List and Search */}
      <div className="lg:col-span-1">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Search className="h-4 w-4 text-cyan-400" />
              License Plate Search
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search plate, model, or color..."
                value={searchPlate}
                onChange={(e) => setSearchPlate(e.target.value)}
                className="border-border bg-secondary pl-9 text-xs"
              />
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-cyan-400" />
                <div>
                  <p className="text-lg font-bold text-foreground">{vehicleTrackingRecords.length}</p>
                  <p className="text-[9px] text-muted-foreground">Tracked Vehicles</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {vehicleTrackingRecords.filter((r) => r.status === "flagged").length}
                  </p>
                  <p className="text-[9px] text-muted-foreground">Flagged</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {vehicleTrackingRecords.reduce((sum, r) => sum + r.sightings.length, 0)}
                  </p>
                  <p className="text-[9px] text-muted-foreground">Total Sightings</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="text-lg font-bold text-foreground">{camerasWithVehicles.length}</p>
                  <p className="text-[9px] text-muted-foreground">CAMs w/ Vehicles</p>
                </div>
              </div>
            </div>
          </div>

          {/* Camera Vehicle Coverage */}
          <div className="rounded-lg border border-border bg-card p-4">
            <button
              onClick={() => setShowCameraBreakdown(!showCameraBreakdown)}
              className="flex w-full items-center justify-between"
            >
              <h4 className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Target className="h-3.5 w-3.5 text-cyan-400" />
                Camera Vehicle Coverage
              </h4>
              {showCameraBreakdown ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>

            {showCameraBreakdown && (
              <div className="mt-3 flex flex-col gap-1.5">
                {cameras.filter((c) => c.status !== "offline").map((cam) => {
                  const summary = getCameraDetectionSummary(cam.id)
                  return (
                    <div key={cam.id} className="flex items-center justify-between rounded-md bg-secondary px-2.5 py-1.5">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-2 w-2 rounded-full",
                          summary.hasVehicles ? "bg-cyan-400" : "bg-muted-foreground/40"
                        )} />
                        <span className="text-[10px] text-foreground">{cam.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {summary.vehicles > 0 ? (
                          <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 px-1 py-0 text-[8px] text-cyan-400">
                            {summary.vehicles} vehicles
                          </Badge>
                        ) : (
                          <span className="text-[8px] text-muted-foreground">No vehicles</span>
                        )}
                        {summary.persons > 0 && (
                          <span className="text-[8px] text-muted-foreground">{summary.persons}P</span>
                        )}
                      </div>
                    </div>
                  )
                })}
                <div className="mt-2 rounded-md border border-border bg-secondary/50 p-2">
                  <p className="text-[9px] text-muted-foreground">
                    Cameras without visible vehicles still participate in cross-camera vehicle tracking.
                    Vehicle detection algorithms run system-wide.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle list */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h4 className="text-xs font-semibold text-foreground">All Tracked Vehicles</h4>
            </div>
            <ScrollArea className="h-[250px]">
              <div className="flex flex-col gap-1.5 p-2">
                {filteredRecords.map((record) => (
                  <button
                    key={record.crossCameraId}
                    onClick={() => setSelectedTrack(record)}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-3 py-2.5 text-left transition-colors",
                      selectedTrack?.crossCameraId === record.crossCameraId
                        ? "border-primary/50 bg-primary/10"
                        : record.status === "flagged"
                          ? "border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
                          : "border-border bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    <Car className={cn(
                      "h-4 w-4 shrink-0",
                      record.status === "flagged" ? "text-red-400" : "text-cyan-400"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground truncate">
                        {record.vehicleColor} {record.vehicleModel}
                      </p>
                      <p className="text-[9px] font-mono text-cyan-400">{record.licensePlate}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline" className={cn("px-1 py-0 text-[8px]", riskColors[record.riskLevel])}>
                        {record.riskLevel.toUpperCase()}
                      </Badge>
                      <p className="text-[8px] text-muted-foreground mt-0.5">{record.sightings.length} sightings</p>
                    </div>
                  </button>
                ))}
                {filteredRecords.length === 0 && (
                  <p className="py-6 text-center text-[11px] text-muted-foreground">No vehicles match your search.</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Right Panel - Vehicle Detail and Cross-Camera Trail */}
      <div className="lg:col-span-2">
        {selectedTrack ? (
          <div className="flex flex-col gap-4">
            {/* Vehicle Header Card */}
            <div className={cn(
              "rounded-lg border p-5",
              selectedTrack.status === "flagged"
                ? "border-red-500/30 bg-red-500/5"
                : "border-border bg-card"
            )}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-lg",
                    selectedTrack.status === "flagged" ? "bg-red-500/10" : "bg-cyan-500/10"
                  )}>
                    <Car className={cn(
                      "h-7 w-7",
                      selectedTrack.status === "flagged" ? "text-red-400" : "text-cyan-400"
                    )} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {selectedTrack.vehicleColor} {selectedTrack.vehicleModel}
                    </h2>
                    <p className="text-sm text-muted-foreground">{selectedTrack.vehicleType}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className={cn("text-[10px]", statusColors[selectedTrack.status])}>
                        {selectedTrack.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={cn("text-[10px]", riskColors[selectedTrack.riskLevel])}>
                        Risk: {selectedTrack.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* License Plate Display */}
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-cyan-500/30 bg-card px-4 py-3">
                <ZoomIn className="h-5 w-5 text-cyan-400" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">License Plate (Enhanced)</p>
                  <p className="text-xl font-mono font-bold text-cyan-400 tracking-widest">
                    {selectedTrack.licensePlate}
                  </p>
                </div>
                {selectedTrack.licensePlate !== "UNK-PLATE" ? (
                  <Badge variant="outline" className="ml-auto border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-400">
                    RECOGNIZED
                  </Badge>
                ) : (
                  <Badge variant="outline" className="ml-auto border-red-500/30 bg-red-500/10 text-[10px] text-red-400">
                    UNRECOGNIZED
                  </Badge>
                )}
              </div>

              {selectedTrack.notes && (
                <div className={cn(
                  "mt-3 rounded-md border p-3",
                  selectedTrack.status === "flagged"
                    ? "border-red-500/20 bg-red-500/5"
                    : "border-border bg-secondary/50"
                )}>
                  <p className={cn(
                    "text-[11px]",
                    selectedTrack.status === "flagged" ? "text-red-400 font-medium" : "text-muted-foreground"
                  )}>
                    {selectedTrack.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Cross-Camera Sighting Timeline */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Route className="h-4 w-4 text-primary" />
                Cross-Camera Tracking Trail
                <Badge variant="outline" className="ml-2 border-primary/30 bg-primary/10 px-1.5 py-0 text-[10px] text-primary">
                  {selectedTrack.sightings.length} Sightings
                </Badge>
              </h3>

              <div className="relative">
                <div className="absolute left-5 top-0 h-full w-px bg-border" />
                {selectedTrack.sightings.map((sight, idx) => {
                  const cam = cameras.find((c) => c.id === sight.cameraId)
                  return (
                    <div key={`${sight.cameraId}-${idx}`} className="relative mb-5 flex items-start gap-4 pl-10 last:mb-0">
                      <div className={cn(
                        "absolute left-3 top-2 h-4 w-4 rounded-full border-2 border-card",
                        idx === selectedTrack.sightings.length - 1 ? "bg-primary" : "bg-cyan-400"
                      )} />
                      <div className="flex-1 rounded-lg border border-border bg-secondary/50 p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-primary" />
                              <span className="text-xs font-semibold text-foreground">{sight.cameraName}</span>
                              <Badge variant="outline" className="border-border px-1 py-0 text-[9px] text-muted-foreground">
                                {sight.cameraId.toUpperCase()}
                              </Badge>
                            </div>
                            {cam && (
                              <p className="mt-0.5 text-[10px] text-muted-foreground">{cam.location} - {cam.zone}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[10px] font-mono text-foreground">
                                {new Date(sight.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-[9px] text-muted-foreground">
                              {new Date(sight.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-[11px] text-muted-foreground">{sight.direction}</p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="text-[9px] text-muted-foreground">
                            Confidence: <span className="font-medium text-foreground">{(sight.confidence * 100).toFixed(0)}%</span>
                          </span>
                          <div className="h-1 flex-1 overflow-hidden rounded-full bg-card">
                            <div
                              className="h-full rounded-full bg-cyan-500"
                              style={{ width: `${sight.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      {idx < selectedTrack.sightings.length - 1 && (
                        <ArrowRight className="absolute -bottom-3 left-4.5 h-3 w-3 text-muted-foreground/40" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Vehicle Re-identification Matrix */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Crosshair className="h-4 w-4 text-amber-400" />
                Vehicle Re-Identification Confirmation
              </h3>
              <p className="mb-3 text-[10px] text-muted-foreground">
                The same vehicle has been identified across multiple camera views using license plate recognition,
                visual signature matching, and trajectory analysis.
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {selectedTrack.sightings.map((sight, idx) => (
                  <div key={`reId-${idx}`} className="rounded-md border border-border bg-secondary/50 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-foreground">{sight.cameraName}</span>
                      <span className="text-[9px] font-mono text-cyan-400">{(sight.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="aspect-video rounded bg-card border border-border flex items-center justify-center">
                      <div className="text-center">
                        <Car className="mx-auto h-6 w-6 text-cyan-400/50" />
                        <p className="mt-1 text-[9px] text-muted-foreground">
                          Detection at ({(sight.bbox.x * 100).toFixed(0)}%, {(sight.bbox.y * 100).toFixed(0)}%)
                        </p>
                        <p className="text-[8px] font-mono text-cyan-400">{selectedTrack.licensePlate}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-[9px] text-muted-foreground">{sight.direction}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-card p-12">
            <div className="text-center">
              <Car className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <h3 className="mt-4 text-sm font-semibold text-foreground">Select a Vehicle</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose a tracked vehicle from the list to view its cross-camera tracking trail,
                license plate details, and re-identification matrix.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
