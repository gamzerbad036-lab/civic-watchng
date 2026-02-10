"use client"

import { useEffect, useRef, useState } from "react"
import type { Camera } from "@/lib/types"
import {
  cameraDetections,
  getCameraDetectionSummary,
  getVehicleTrackByCrossId,
  getVehicleSightingsForCamera,
  getFaceTrackRecord,
} from "@/lib/detection-engine"
import type { DetectedObject, VehicleTrackingRecord } from "@/lib/detection-engine"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import {
  X,
  Eye,
  EyeOff,
  ScanFace,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sun,
  Contrast,
  Focus,
  Shield,
  Activity,
  Box,
  Fingerprint,
  Crosshair,
  Car,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  Search,
  Target,
} from "lucide-react"

const cameraImageMap: Record<string, string> = {
  "cam-001": "/cameras/cam-001.jpg",
  "cam-002": "/cameras/cam-002.jpg",
  "cam-003": "/cameras/cam-003.jpg",
  "cam-004": "/cameras/cam-004.jpg",
  "cam-005": "/cameras/cam-005.jpg",
  "cam-006": "/cameras/cam-006.jpg",
  "cam-007": "/cameras/cam-001.jpg",
  "cam-008": "/cameras/cam-008.jpg",
  "cam-009": "/cameras/cam-009.jpg",
  "cam-010": "/cameras/cam-010.jpg",
  "cam-011": "/cameras/cam-011.jpg",
  "cam-012": "/cameras/cam-012.jpg",
}

interface CameraDetailModalProps {
  camera: Camera
  masked: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

function drawDetectionBoxExpanded(
  ctx: CanvasRenderingContext2D,
  det: DetectedObject,
  width: number,
  height: number,
  frameCount: number,
  isSelected: boolean
) {
  const bx = det.bbox.x * width
  const by = det.bbox.y * height
  const bw = det.bbox.w * width
  const bh = det.bbox.h * height

  const cornerLen = Math.min(14, bw * 0.2, bh * 0.2)
  const isAlerted = det.activity?.includes("FLAGGED") || det.activity?.includes("ALERT") || det.activity?.includes("UNAUTHORIZED")
  const boxColor = isSelected ? "#ffffff" : isAlerted ? "#ef4444" : det.color

  ctx.strokeStyle = boxColor
  ctx.lineWidth = isSelected ? 2.5 : 2

  // Corner brackets
  ctx.beginPath()
  ctx.moveTo(bx, by + cornerLen)
  ctx.lineTo(bx, by)
  ctx.lineTo(bx + cornerLen, by)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(bx + bw - cornerLen, by)
  ctx.lineTo(bx + bw, by)
  ctx.lineTo(bx + bw, by + cornerLen)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(bx, by + bh - cornerLen)
  ctx.lineTo(bx, by + bh)
  ctx.lineTo(bx + cornerLen, by + bh)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(bx + bw - cornerLen, by + bh)
  ctx.lineTo(bx + bw, by + bh)
  ctx.lineTo(bx + bw, by + bh - cornerLen)
  ctx.stroke()

  // Dashed perimeter
  ctx.setLineDash([4, 4])
  ctx.strokeStyle = `${boxColor}50`
  ctx.lineWidth = 1
  ctx.strokeRect(bx, by, bw, bh)
  ctx.setLineDash([])

  // Selected fill highlight
  if (isSelected) {
    ctx.fillStyle = `${boxColor}15`
    ctx.fillRect(bx, by, bw, bh)
  }

  // Label
  const labelText = `${det.label} ${(det.confidence * 100).toFixed(0)}%`
  ctx.font = "bold 11px monospace"
  const labelWidth = ctx.measureText(labelText).width + 10
  ctx.fillStyle = `${boxColor}DD`
  ctx.fillRect(bx, by - 18, labelWidth, 16)
  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 10px monospace"
  ctx.textAlign = "left"
  ctx.fillText(labelText, bx + 5, by - 5)

  // Face tracking reticle (NO blurring - just identification)
  if (det.type === "person" && det.faceVisible) {
    const faceX = bx + bw / 2
    const faceY = by + bh * 0.15
    const faceR = Math.min(14, bw * 0.18)

    ctx.strokeStyle = "#22d3ee"
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(faceX, faceY, faceR, 0, Math.PI * 2)
    ctx.stroke()

    // Crosshair lines
    const cLen = 5
    ctx.beginPath()
    ctx.moveTo(faceX - faceR - cLen, faceY)
    ctx.lineTo(faceX - faceR + 3, faceY)
    ctx.moveTo(faceX + faceR - 3, faceY)
    ctx.lineTo(faceX + faceR + cLen, faceY)
    ctx.moveTo(faceX, faceY - faceR - cLen)
    ctx.lineTo(faceX, faceY - faceR + 3)
    ctx.moveTo(faceX, faceY + faceR - 3)
    ctx.lineTo(faceX, faceY + faceR + cLen)
    ctx.stroke()

    // Face ID badge
    if (det.faceId) {
      ctx.fillStyle = "#22d3eeDD"
      const idText = det.faceId
      ctx.font = "bold 9px monospace"
      const idWidth = ctx.measureText(idText).width + 8
      ctx.fillRect(faceX + faceR + 4, faceY - 7, idWidth, 14)
      ctx.fillStyle = "#fff"
      ctx.fillText(idText, faceX + faceR + 8, faceY + 3)
    }

    // Activity label
    if (det.activity) {
      ctx.font = "9px monospace"
      ctx.fillStyle = isAlerted ? "#ef4444CC" : "#94a3b8CC"
      const actText = det.activity
      const actWidth = ctx.measureText(actText).width + 8
      ctx.fillRect(bx, by + bh + 2, actWidth, 13)
      ctx.fillStyle = "#fff"
      ctx.fillText(actText, bx + 4, by + bh + 12)
    }
  }

  // Vehicle license plate indicator with zoom-ready styling
  if (det.type === "vehicle" && det.licensePlate) {
    const plateX = bx + bw * 0.5
    const plateY = by + bh - 6

    // Plate background
    ctx.font = "bold 11px monospace"
    const plateText = det.licensePlate
    const plateWidth = ctx.measureText(plateText).width + 14
    const plateH = 18

    ctx.fillStyle = "#0d1117DD"
    ctx.strokeStyle = "#06b6d4"
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(plateX - plateWidth / 2, plateY - plateH / 2, plateWidth, plateH, 3)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = "#06b6d4"
    ctx.textAlign = "center"
    ctx.fillText(plateText, plateX, plateY + 4)
    ctx.textAlign = "left"

    // Vehicle info line
    if (det.vehicleColor && det.vehicleModel) {
      const infoText = `${det.vehicleColor} ${det.vehicleModel}`
      ctx.font = "8px monospace"
      ctx.fillStyle = "#64748bCC"
      const infoWidth = ctx.measureText(infoText).width + 8
      ctx.fillRect(bx, by + bh + 2, infoWidth, 12)
      ctx.fillStyle = "#cbd5e1"
      ctx.fillText(infoText, bx + 4, by + bh + 11)
    }

    // Cross-camera tracking badge
    if (det.crossCameraId) {
      ctx.fillStyle = "#f59e0bDD"
      const trackText = "CROSS-CAM TRACKED"
      ctx.font = "bold 7px monospace"
      const trackWidth = ctx.measureText(trackText).width + 8
      ctx.fillRect(bx + bw - trackWidth, by - 32, trackWidth, 12)
      ctx.fillStyle = "#fff"
      ctx.fillText(trackText, bx + bw - trackWidth + 4, by - 23)
    }
  }

  // Tracking pulse animation
  if (det.tracked && frameCount % 50 < 30) {
    ctx.strokeStyle = `${boxColor}30`
    ctx.lineWidth = 1
    const pulse = (frameCount % 50) / 30
    ctx.beginPath()
    ctx.arc(bx + bw / 2, by + bh / 2, Math.max(bw, bh) * 0.6 * (1 + pulse * 0.2), 0, Math.PI * 2)
    ctx.stroke()
  }
}

function drawExpandedOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: Camera,
  frameCount: number,
  bgImage: HTMLImageElement | null,
  trackingEnabled: boolean,
  brightness: number,
  contrast: number,
  zoom: number,
  detections: DetectedObject[],
  selectedDetId: string | null
) {
  ctx.clearRect(0, 0, width, height)

  ctx.save()
  const scale = 1 + (zoom - 50) / 100
  ctx.translate(width / 2, height / 2)
  ctx.scale(scale, scale)
  ctx.translate(-width / 2, -height / 2)

  if (bgImage) {
    ctx.filter = `brightness(${brightness / 50}) contrast(${contrast / 50})`
    ctx.drawImage(bgImage, 0, 0, width, height)
    ctx.filter = "none"
    ctx.fillStyle = "rgba(16, 185, 129, 0.02)"
    ctx.fillRect(0, 0, width, height)
  } else {
    ctx.fillStyle = "#0d1117"
    ctx.fillRect(0, 0, width, height)
  }

  // Subtle noise
  if (frameCount % 4 === 0) {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 32) {
      const noise = (Math.random() - 0.5) * 8
      data[i] = Math.min(255, Math.max(0, data[i] + noise))
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
    }
    ctx.putImageData(imageData, 0, 0)
  }

  // Scan lines
  ctx.fillStyle = "rgba(0, 0, 0, 0.04)"
  for (let y = 0; y < height; y += 3) {
    ctx.fillRect(0, y, width, 1)
  }

  const scanY = (frameCount * 2) % height
  ctx.fillStyle = "rgba(16, 185, 129, 0.06)"
  ctx.fillRect(0, scanY, width, 2)

  ctx.restore()

  // Draw all detections on the expanded canvas
  if (trackingEnabled) {
    for (const det of detections) {
      drawDetectionBoxExpanded(ctx, det, width, height, frameCount, selectedDetId === det.id)
    }
  }

  // Grid overlay
  ctx.strokeStyle = "rgba(16, 185, 129, 0.05)"
  ctx.lineWidth = 0.5
  const gridSize = 60
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // Timestamp bar
  ctx.fillStyle = "rgba(0, 0, 0, 0.75)"
  ctx.fillRect(0, height - 28, width, 28)
  ctx.fillStyle = "#10b981"
  ctx.font = "bold 11px monospace"
  ctx.textAlign = "left"
  const now = new Date()
  ctx.fillText(
    `${now.toLocaleDateString()} ${now.toLocaleTimeString()} | ${camera.name.toUpperCase()} | ${camera.location}`,
    8,
    height - 9
  )

  // REC
  if (frameCount % 60 < 40) {
    ctx.fillStyle = "#ef4444"
    ctx.beginPath()
    ctx.arc(width - 16, height - 14, 4, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = "#ef4444"
  ctx.font = "bold 10px monospace"
  ctx.textAlign = "right"
  ctx.fillText("REC", width - 26, height - 9)

  // Detection count overlay
  if (trackingEnabled) {
    const summary = getCameraDetectionSummary(camera.id)
    ctx.fillStyle = "rgba(0, 0, 0, 0.65)"
    ctx.fillRect(width - 160, 8, 152, 72)
    ctx.strokeStyle = "rgba(16, 185, 129, 0.3)"
    ctx.lineWidth = 1
    ctx.strokeRect(width - 160, 8, 152, 72)
    ctx.fillStyle = "#10b981"
    ctx.font = "bold 10px monospace"
    ctx.textAlign = "left"
    ctx.fillText(`OBJECTS: ${summary.total}`, width - 150, 24)
    ctx.fillText(`PERSONS: ${summary.persons}`, width - 150, 38)
    ctx.fillStyle = "#06b6d4"
    ctx.fillText(`VEHICLES: ${summary.vehicles}`, width - 150, 52)
    ctx.fillStyle = summary.trackedFaces > 0 ? "#22d3ee" : "#64748b"
    ctx.fillText(`FACES: ${summary.trackedFaces}`, width - 150, 66)
    if (summary.flaggedObjects > 0) {
      ctx.fillStyle = "#ef4444"
      ctx.fillText(`ALERTS: ${summary.flaggedObjects}`, width - 150, 76)
    }
  }

  // Vignette
  const gradient = ctx.createRadialGradient(width / 2, height / 2, width * 0.35, width / 2, height / 2, width * 0.65)
  gradient.addColorStop(0, "rgba(0,0,0,0)")
  gradient.addColorStop(1, "rgba(0,0,0,0.2)")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

export function CameraDetailModal({ camera, masked, open, onOpenChange }: CameraDetailModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  const [trackingEnabled, setTrackingEnabled] = useState(true)
  const [brightness, setBrightness] = useState(50)
  const [contrastVal, setContrastVal] = useState(50)
  const [zoom, setZoom] = useState(50)
  const [selectedDetId, setSelectedDetId] = useState<string | null>(null)
  const [selectedVehicleTrack, setSelectedVehicleTrack] = useState<VehicleTrackingRecord | null>(null)

  const detections = cameraDetections[camera.id] || []
  const summary = getCameraDetectionSummary(camera.id)
  const vehicleSightings = getVehicleSightingsForCamera(camera.id)

  useEffect(() => {
    if (!open) return
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
    }
    img.src = cameraImageMap[camera.id] || cameraImageMap["cam-001"]
  }, [camera.id, open])

  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let lastTime = 0
    const fps = 14

    function animate(timestamp: number) {
      const delta = timestamp - lastTime
      if (delta > 1000 / fps) {
        lastTime = timestamp
        frameRef.current++
        if (ctx && canvas) {
          drawExpandedOverlay(
            ctx, canvas.width, canvas.height, camera,
            frameRef.current, imageRef.current, trackingEnabled,
            brightness, contrastVal, zoom, detections, selectedDetId
          )
        }
      }
      animationId = requestAnimationFrame(animate)
    }
    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [open, camera, imageLoaded, trackingEnabled, brightness, contrastVal, zoom, detections, selectedDetId])

  const handleSelectDetection = (det: DetectedObject) => {
    setSelectedDetId(det.id === selectedDetId ? null : det.id)
    if (det.type === "vehicle" && det.crossCameraId) {
      const track = getVehicleTrackByCrossId(det.crossCameraId)
      setSelectedVehicleTrack(track || null)
    } else {
      setSelectedVehicleTrack(null)
    }
  }

  const handleZoomToPlate = (det: DetectedObject) => {
    if (det.type === "vehicle") {
      // Zoom in to the vehicle area
      setZoom(85)
      setSelectedDetId(det.id)
      if (det.crossCameraId) {
        const track = getVehicleTrackByCrossId(det.crossCameraId)
        setSelectedVehicleTrack(track || null)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl border-border bg-card p-0 gap-0 [&>button]:hidden">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Crosshair className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">{camera.name} - Advanced View</h2>
                <p className="text-xs text-muted-foreground">{camera.location} | {camera.zone} | {camera.id.toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {summary.flaggedObjects > 0 && (
                <Badge variant="outline" className="gap-1 border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] text-red-400">
                  {summary.flaggedObjects} ALERT
                </Badge>
              )}
              <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                <Activity className="h-3 w-3" /> Live
              </Badge>
              <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col gap-0 lg:flex-row">
            {/* Canvas */}
            <div className="relative flex-1">
              <canvas
                ref={canvasRef}
                width={768}
                height={432}
                className="aspect-video w-full"
              />
            </div>

            {/* Controls Panel */}
            <div className="w-full border-t border-border lg:w-80 lg:border-l lg:border-t-0">
              <Tabs defaultValue="tracking" className="h-full">
                <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-2">
                  <TabsTrigger value="tracking" className="gap-1 text-[11px] data-[state=active]:bg-secondary">
                    <Crosshair className="h-3 w-3" /> Detect
                  </TabsTrigger>
                  <TabsTrigger value="vehicles" className="gap-1 text-[11px] data-[state=active]:bg-secondary">
                    <Car className="h-3 w-3" /> Vehicles
                  </TabsTrigger>
                  <TabsTrigger value="controls" className="gap-1 text-[11px] data-[state=active]:bg-secondary">
                    <Focus className="h-3 w-3" /> Controls
                  </TabsTrigger>
                  <TabsTrigger value="details" className="gap-1 text-[11px] data-[state=active]:bg-secondary">
                    <Shield className="h-3 w-3" /> Info
                  </TabsTrigger>
                </TabsList>

                {/* Detection/Tracking Tab */}
                <TabsContent value="tracking" className="m-0 p-0">
                  <ScrollArea className="h-[380px]">
                    <div className="flex flex-col gap-4 p-3">
                      {/* Toggle */}
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 text-xs text-foreground">
                          <Move className="h-3.5 w-3.5 text-primary" />
                          Object Tracking
                        </Label>
                        <Switch checked={trackingEnabled} onCheckedChange={setTrackingEnabled} />
                      </div>

                      {/* Summary */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 rounded-md bg-secondary px-2.5 py-2">
                          <Users className="h-3.5 w-3.5 text-blue-400" />
                          <div>
                            <p className="text-[11px] font-bold text-foreground">{summary.persons}</p>
                            <p className="text-[9px] text-muted-foreground">Persons</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-md bg-secondary px-2.5 py-2">
                          <Car className="h-3.5 w-3.5 text-cyan-400" />
                          <div>
                            <p className="text-[11px] font-bold text-foreground">{summary.vehicles}</p>
                            <p className="text-[9px] text-muted-foreground">Vehicles</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-md bg-secondary px-2.5 py-2">
                          <ScanFace className="h-3.5 w-3.5 text-cyan-300" />
                          <div>
                            <p className="text-[11px] font-bold text-foreground">{summary.trackedFaces}</p>
                            <p className="text-[9px] text-muted-foreground">Faces</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-md bg-secondary px-2.5 py-2">
                          <Box className="h-3.5 w-3.5 text-muted-foreground" />
                          <div>
                            <p className="text-[11px] font-bold text-foreground">{summary.total}</p>
                            <p className="text-[9px] text-muted-foreground">Total</p>
                          </div>
                        </div>
                      </div>

                      {/* Detection list */}
                      <div>
                        <h4 className="mb-2 text-xs font-semibold text-foreground">Detected Objects</h4>
                        <div className="flex flex-col gap-1.5">
                          {detections.length === 0 ? (
                            <p className="py-4 text-center text-[11px] text-muted-foreground">No objects detected</p>
                          ) : (
                            detections.map((det) => {
                              const isAlerted = det.activity?.includes("FLAGGED") || det.activity?.includes("ALERT") || det.activity?.includes("UNAUTHORIZED")
                              const faceRecord = det.faceId ? getFaceTrackRecord(det.faceId) : null
                              return (
                                <button
                                  key={det.id}
                                  onClick={() => handleSelectDetection(det)}
                                  className={cn(
                                    "flex items-start gap-2 rounded-md border px-2.5 py-2 text-left transition-colors",
                                    selectedDetId === det.id
                                      ? "border-primary/50 bg-primary/10"
                                      : isAlerted
                                        ? "border-red-500/30 bg-red-500/5 hover:bg-red-500/10"
                                        : "border-border bg-secondary hover:bg-secondary/80"
                                  )}
                                >
                                  <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: det.color }} />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-[11px] font-medium text-foreground truncate">{det.label}</p>
                                      <span className="text-[9px] font-mono text-muted-foreground">{(det.confidence * 100).toFixed(0)}%</span>
                                    </div>
                                    <p className="text-[10px] capitalize text-muted-foreground">{det.type}</p>
                                    {det.activity && (
                                      <p className={cn("text-[9px] mt-0.5", isAlerted ? "text-red-400 font-medium" : "text-muted-foreground")}>
                                        {det.activity}
                                      </p>
                                    )}
                                    {det.faceId && (
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <ScanFace className="h-2.5 w-2.5 text-cyan-400" />
                                        <span className="text-[9px] text-cyan-400 font-mono">{det.faceId}</span>
                                        {faceRecord && faceRecord.sightings.length > 1 && (
                                          <span className="text-[8px] text-amber-400">({faceRecord.sightings.length} cams)</span>
                                        )}
                                      </div>
                                    )}
                                    {det.licensePlate && (
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <Car className="h-2.5 w-2.5 text-cyan-400" />
                                        <span className="text-[9px] text-cyan-400 font-mono">{det.licensePlate}</span>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleZoomToPlate(det) }}
                                          className="ml-1 text-[8px] text-amber-400 underline hover:text-amber-300"
                                        >
                                          Zoom
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  {det.tracked && (
                                    <Badge variant="outline" className="shrink-0 border-primary/30 bg-primary/10 px-1 py-0 text-[8px] text-primary">
                                      TRACK
                                    </Badge>
                                  )}
                                </button>
                              )
                            })
                          )}
                        </div>
                      </div>

                      {/* No vehicles note */}
                      {!summary.hasVehicles && (
                        <div className="rounded-md border border-border bg-secondary/50 p-2.5">
                          <div className="flex items-center gap-2">
                            <Car className="h-3.5 w-3.5 text-muted-foreground" />
                            <p className="text-[10px] text-muted-foreground">
                              No vehicles detected in this camera view. Vehicle tracking is active system-wide via cross-camera analysis.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Vehicles Tab - Cross-camera vehicle tracking */}
                <TabsContent value="vehicles" className="m-0 p-0">
                  <ScrollArea className="h-[380px]">
                    <div className="flex flex-col gap-4 p-3">
                      <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5 text-cyan-400" />
                        Vehicle Tracking - Cross-Camera
                      </h4>

                      {/* Vehicles seen in this camera */}
                      {vehicleSightings.length > 0 ? (
                        vehicleSightings.map((record) => (
                          <div
                            key={record.crossCameraId}
                            className={cn(
                              "rounded-md border p-3",
                              record.status === "flagged"
                                ? "border-red-500/30 bg-red-500/5"
                                : "border-border bg-secondary/50"
                            )}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-[11px] font-bold text-foreground">{record.vehicleColor} {record.vehicleModel}</p>
                                <p className="text-[10px] text-muted-foreground">{record.vehicleType}</p>
                              </div>
                              <Badge variant="outline" className={cn(
                                "text-[9px] px-1.5 py-0",
                                record.riskLevel === "high" ? "border-red-500/30 bg-red-500/10 text-red-400" :
                                record.riskLevel === "medium" ? "border-amber-500/30 bg-amber-500/10 text-amber-400" :
                                "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              )}>
                                {record.riskLevel.toUpperCase()}
                              </Badge>
                            </div>

                            {/* License plate */}
                            <div className="flex items-center gap-2 mb-2 rounded bg-card px-2 py-1.5 border border-border">
                              <Search className="h-3 w-3 text-cyan-400" />
                              <span className="text-[11px] font-mono font-bold text-cyan-400">{record.licensePlate}</span>
                              {record.licensePlate !== "UNK-PLATE" && (
                                <Badge variant="outline" className="ml-auto border-emerald-500/30 bg-emerald-500/10 px-1 py-0 text-[8px] text-emerald-400">
                                  RECOGNIZED
                                </Badge>
                              )}
                            </div>

                            {/* Cross-camera sightings timeline */}
                            <div className="flex flex-col gap-1">
                              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Cross-Camera Trail ({record.sightings.length} sightings)
                              </p>
                              {record.sightings.map((sight, idx) => (
                                <div key={`${sight.cameraId}-${idx}`} className="flex items-center gap-2 rounded bg-card/50 px-2 py-1 border border-border/50">
                                  <MapPin className="h-2.5 w-2.5 text-primary shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-medium text-foreground truncate">{sight.cameraName}</p>
                                    <p className="text-[9px] text-muted-foreground truncate">{sight.direction}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-[9px] font-mono text-muted-foreground">
                                      {new Date(sight.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                    <p className="text-[8px] text-muted-foreground">{(sight.confidence * 100).toFixed(0)}%</p>
                                  </div>
                                  {idx < record.sightings.length - 1 && (
                                    <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/30 shrink-0" />
                                  )}
                                </div>
                              ))}
                            </div>

                            {record.notes && (
                              <p className={cn(
                                "mt-2 text-[9px] italic",
                                record.status === "flagged" ? "text-red-400" : "text-muted-foreground"
                              )}>
                                {record.notes}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center">
                          <Car className="mx-auto h-6 w-6 text-muted-foreground/50" />
                          <p className="mt-2 text-[11px] text-muted-foreground">
                            No vehicle sightings recorded for this camera.
                          </p>
                          <p className="text-[10px] text-muted-foreground/70">
                            Vehicle tracking remains active system-wide.
                          </p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Controls Tab */}
                <TabsContent value="controls" className="m-0 p-0">
                  <ScrollArea className="h-[380px]">
                    <div className="flex flex-col gap-5 p-3">
                      <div className="flex flex-col gap-2">
                        <Label className="flex items-center gap-2 text-xs text-foreground">
                          <ZoomIn className="h-3.5 w-3.5 text-muted-foreground" />
                          Digital Zoom (License Plate Recognition)
                        </Label>
                        <div className="flex items-center gap-3">
                          <ZoomOut className="h-3 w-3 text-muted-foreground" />
                          <Slider value={[zoom]} onValueChange={([v]) => setZoom(v)} min={20} max={100} step={1} className="flex-1" />
                          <ZoomIn className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <p className="text-right text-[10px] font-mono text-muted-foreground">{(1 + (zoom - 50) / 100).toFixed(2)}x</p>
                        {zoom > 70 && (
                          <div className="rounded-md border border-cyan-500/20 bg-cyan-500/5 p-2">
                            <p className="text-[10px] text-cyan-400 font-medium">License Plate Enhanced Zoom Active</p>
                            <p className="text-[9px] text-muted-foreground">Plate recognition confidence increases at higher zoom levels.</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="flex items-center gap-2 text-xs text-foreground">
                          <Sun className="h-3.5 w-3.5 text-muted-foreground" />
                          Brightness
                        </Label>
                        <Slider value={[brightness]} onValueChange={([v]) => setBrightness(v)} min={10} max={100} step={1} />
                        <p className="text-right text-[10px] font-mono text-muted-foreground">{brightness}%</p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="flex items-center gap-2 text-xs text-foreground">
                          <Contrast className="h-3.5 w-3.5 text-muted-foreground" />
                          Contrast
                        </Label>
                        <Slider value={[contrastVal]} onValueChange={([v]) => setContrastVal(v)} min={10} max={100} step={1} />
                        <p className="text-right text-[10px] font-mono text-muted-foreground">{contrastVal}%</p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setBrightness(50); setContrastVal(50); setZoom(50) }} className="flex-1 gap-1 border-border bg-transparent text-xs text-muted-foreground">
                          <RotateCw className="h-3 w-3" /> Reset
                        </Button>
                      </div>

                      <div className="rounded-md border border-border bg-secondary/50 p-2.5">
                        <p className="text-[10px] font-medium text-foreground">PTZ Controls</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          Pan/Tilt/Zoom motor controls available for compatible hardware.
                        </p>
                        <div className="mt-2 grid grid-cols-3 gap-1">
                          {["TL","UP","TR","LT","CTR","RT","BL","DN","BR"].map((d) => (
                            <button key={d} className="flex h-7 items-center justify-center rounded bg-secondary text-[9px] font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary">
                              {d === "CTR" ? <Focus className="h-3 w-3" /> : d}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Info Tab */}
                <TabsContent value="details" className="m-0 p-0">
                  <ScrollArea className="h-[380px]">
                    <div className="flex flex-col gap-3 p-3">
                      {[
                        { label: "Camera ID", value: camera.id.toUpperCase() },
                        { label: "Name", value: camera.name },
                        { label: "Location", value: camera.location },
                        { label: "Zone", value: camera.zone },
                        { label: "Status", value: camera.status },
                        { label: "Coordinates", value: `${camera.lat.toFixed(4)}, ${camera.lng.toFixed(4)}` },
                        { label: "Resolution", value: "1920x1080" },
                        { label: "Frame Rate", value: "30 fps" },
                        { label: "Encoding", value: "H.265/HEVC" },
                        { label: "Storage", value: "30 days retention" },
                        { label: "Encryption", value: "AES-256" },
                        { label: "Face Blur", value: "DISABLED (Faces Visible)" },
                        { label: "Vehicle Track", value: "ACTIVE (Cross-Camera)" },
                        { label: "License Plate", value: "ZOOM-ENHANCED" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                          <span className="text-[11px] text-muted-foreground">{label}</span>
                          <span className={cn(
                            "text-[11px] font-medium",
                            value.includes("DISABLED") ? "text-amber-400" :
                            value.includes("ACTIVE") ? "text-emerald-400" :
                            value.includes("ZOOM") ? "text-cyan-400" :
                            "text-foreground"
                          )}>{value}</span>
                        </div>
                      ))}

                      <div className="mt-2 rounded-md border border-primary/20 bg-primary/5 p-2.5">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-[11px] font-medium text-primary">Advanced Tracking Active</p>
                            <p className="text-[10px] text-muted-foreground">Cross-camera vehicle & face tracking enabled. No face blurring applied.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
