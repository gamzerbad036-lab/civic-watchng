"use client"

import { useEffect, useRef, useState } from "react"
import type { Camera } from "@/lib/types"
import { cameraDetections, getCameraDetectionSummary } from "@/lib/detection-engine"
import type { DetectedObject } from "@/lib/detection-engine"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CameraDetailModal } from "@/components/camera-detail-modal"
import { Eye, EyeOff, Maximize2, Activity, Car, Users } from "lucide-react"

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

interface CameraFeedProps {
  camera: Camera
  masked?: boolean
  className?: string
}

function drawDetectionBox(
  ctx: CanvasRenderingContext2D,
  det: DetectedObject,
  width: number,
  height: number,
  frameCount: number
) {
  const bx = det.bbox.x * width
  const by = det.bbox.y * height
  const bw = det.bbox.w * width
  const bh = det.bbox.h * height

  // Corner bracket style bounding box
  const cornerLen = Math.min(8, bw * 0.2, bh * 0.2)
  ctx.strokeStyle = det.color
  ctx.lineWidth = 1.5

  // Top-left
  ctx.beginPath()
  ctx.moveTo(bx, by + cornerLen)
  ctx.lineTo(bx, by)
  ctx.lineTo(bx + cornerLen, by)
  ctx.stroke()
  // Top-right
  ctx.beginPath()
  ctx.moveTo(bx + bw - cornerLen, by)
  ctx.lineTo(bx + bw, by)
  ctx.lineTo(bx + bw, by + cornerLen)
  ctx.stroke()
  // Bottom-left
  ctx.beginPath()
  ctx.moveTo(bx, by + bh - cornerLen)
  ctx.lineTo(bx, by + bh)
  ctx.lineTo(bx + cornerLen, by + bh)
  ctx.stroke()
  // Bottom-right
  ctx.beginPath()
  ctx.moveTo(bx + bw - cornerLen, by + bh)
  ctx.lineTo(bx + bw, by + bh)
  ctx.lineTo(bx + bw, by + bh - cornerLen)
  ctx.stroke()

  // Dashed perimeter
  ctx.setLineDash([2, 2])
  ctx.strokeStyle = `${det.color}50`
  ctx.lineWidth = 0.5
  ctx.strokeRect(bx, by, bw, bh)
  ctx.setLineDash([])

  // Label
  const labelText = `${det.label} ${(det.confidence * 100).toFixed(0)}%`
  ctx.font = "bold 7px monospace"
  const labelWidth = ctx.measureText(labelText).width + 6
  ctx.fillStyle = `${det.color}CC`
  ctx.fillRect(bx, by - 10, labelWidth, 10)
  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 6px monospace"
  ctx.textAlign = "left"
  ctx.fillText(labelText, bx + 3, by - 2.5)

  // Face blur + tracking reticle for persons
  if (det.type === "person" && det.faceVisible) {
    const faceX = bx + bw / 2
    const faceY = by + bh * 0.15
    const faceR = Math.min(8, bw * 0.18)

    // Pixelated face blur effect
    const blurSize = Math.max(2, Math.floor(faceR * 2.2))
    const blurX = Math.floor(faceX - blurSize / 2)
    const blurY = Math.floor(faceY - blurSize / 2)
    const safeBlurX = Math.max(0, Math.min(blurX, width - blurSize))
    const safeBlurY = Math.max(0, Math.min(blurY, height - blurSize))
    const safeBlurW = Math.min(blurSize, width - safeBlurX)
    const safeBlurH = Math.min(blurSize, height - safeBlurY)

    if (safeBlurW > 0 && safeBlurH > 0) {
      try {
        const faceData = ctx.getImageData(safeBlurX, safeBlurY, safeBlurW, safeBlurH)
        const pixelSize = Math.max(2, Math.floor(blurSize / 3))
        for (let py = 0; py < safeBlurH; py += pixelSize) {
          for (let px = 0; px < safeBlurW; px += pixelSize) {
            const i = (py * safeBlurW + px) * 4
            const r = faceData.data[i] || 0
            const g = faceData.data[i + 1] || 0
            const b = faceData.data[i + 2] || 0
            for (let dy = 0; dy < pixelSize && py + dy < safeBlurH; dy++) {
              for (let dx = 0; dx < pixelSize && px + dx < safeBlurW; dx++) {
                const j = ((py + dy) * safeBlurW + (px + dx)) * 4
                faceData.data[j] = r
                faceData.data[j + 1] = g
                faceData.data[j + 2] = b
              }
            }
          }
        }
        ctx.putImageData(faceData, safeBlurX, safeBlurY)
      } catch (_e) {
        // Fallback: draw a solid blur rectangle
        ctx.fillStyle = "rgba(30, 40, 50, 0.85)"
        ctx.fillRect(safeBlurX, safeBlurY, safeBlurW, safeBlurH)
      }
    }

    // Blur boundary ring
    ctx.strokeStyle = "#22d3ee"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(faceX, faceY, faceR, 0, Math.PI * 2)
    ctx.stroke()

    // Small crosshair lines
    const cLen = 3
    ctx.beginPath()
    ctx.moveTo(faceX - faceR - cLen, faceY)
    ctx.lineTo(faceX - faceR + 2, faceY)
    ctx.moveTo(faceX + faceR - 2, faceY)
    ctx.lineTo(faceX + faceR + cLen, faceY)
    ctx.moveTo(faceX, faceY - faceR - cLen)
    ctx.lineTo(faceX, faceY - faceR + 2)
    ctx.moveTo(faceX, faceY + faceR - 2)
    ctx.lineTo(faceX, faceY + faceR + cLen)
    ctx.stroke()

    // Face ID label with MASKED indicator
    if (det.faceId) {
      ctx.fillStyle = "#22d3eeCC"
      const idText = `${det.faceId} [MASKED]`
      ctx.font = "bold 5px monospace"
      const idWidth = ctx.measureText(idText).width + 4
      ctx.fillRect(faceX + faceR + 2, faceY - 4, idWidth, 8)
      ctx.fillStyle = "#fff"
      ctx.fillText(idText, faceX + faceR + 4, faceY + 2)
    }
  }

  // Vehicle license plate indicator
  if (det.type === "vehicle" && det.licensePlate) {
    const plateX = bx + bw * 0.5
    const plateY = by + bh - 4
    const plateText = det.licensePlate
    ctx.font = "bold 6px monospace"
    const plateWidth = ctx.measureText(plateText).width + 6
    ctx.fillStyle = "#06b6d4CC"
    ctx.fillRect(plateX - plateWidth / 2, plateY - 4, plateWidth, 9)
    ctx.fillStyle = "#fff"
    ctx.textAlign = "center"
    ctx.fillText(plateText, plateX, plateY + 3)
    ctx.textAlign = "left"
  }

  // Tracking pulse for tracked objects
  if (det.tracked && frameCount % 40 < 25) {
    ctx.strokeStyle = `${det.color}40`
    ctx.lineWidth = 0.5
    const pulse = (frameCount % 40) / 25
    ctx.beginPath()
    ctx.arc(bx + bw / 2, by + bh / 2, Math.max(bw, bh) * 0.5 * (1 + pulse * 0.3), 0, Math.PI * 2)
    ctx.stroke()
  }
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  camera: Camera,
  masked: boolean,
  frameCount: number,
  bgImage: HTMLImageElement | null,
  detections: DetectedObject[]
) {
  ctx.clearRect(0, 0, width, height)

  if (bgImage) {
    ctx.drawImage(bgImage, 0, 0, width, height)
    ctx.fillStyle = "rgba(16, 185, 129, 0.03)"
    ctx.fillRect(0, 0, width, height)
  } else {
    ctx.fillStyle = "#0d1117"
    ctx.fillRect(0, 0, width, height)
  }

  // Film grain
  if (frameCount % 3 === 0) {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 16) {
      const noise = (Math.random() - 0.5) * 10
      data[i] = Math.min(255, Math.max(0, data[i] + noise))
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
    }
    ctx.putImageData(imageData, 0, 0)
  }

  // Scan line sweep
  const scanY = (frameCount * 1.5) % height
  ctx.fillStyle = "rgba(16, 185, 129, 0.04)"
  ctx.fillRect(0, scanY, width, 1)

  // CRT scan lines
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
  for (let y = 0; y < height; y += 3) {
    ctx.fillRect(0, y, width, 1)
  }

  // Draw all detections for this camera - NO face blurring
  for (const det of detections) {
    drawDetectionBox(ctx, det, width, height, frameCount)
  }

  // Bottom timestamp bar
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
  ctx.fillRect(0, height - 20, width, 20)
  ctx.fillStyle = "#10b981"
  ctx.font = "bold 8px monospace"
  ctx.textAlign = "left"
  const now = new Date()
  const ts = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
  ctx.fillText(`${ts}  ${camera.name.toUpperCase()}`, 5, height - 6)

  // REC indicator
  if (frameCount % 60 < 40) {
    ctx.fillStyle = "#ef4444"
    ctx.beginPath()
    ctx.arc(width - 10, height - 10, 3, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = "#ef4444"
  ctx.font = "bold 7px monospace"
  ctx.textAlign = "right"
  ctx.fillText("REC", width - 17, height - 6)

  // Vignette
  const gradient = ctx.createRadialGradient(width / 2, height / 2, width * 0.3, width / 2, height / 2, width * 0.7)
  gradient.addColorStop(0, "rgba(0,0,0,0)")
  gradient.addColorStop(1, "rgba(0,0,0,0.25)")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

export function CameraFeed({ camera, masked = true, className }: CameraFeedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [expandedOpen, setExpandedOpen] = useState(false)

  const detections = cameraDetections[camera.id] || []
  const summary = getCameraDetectionSummary(camera.id)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      imageRef.current = img
      setImageLoaded(true)
    }
    img.src = cameraImageMap[camera.id] || cameraImageMap["cam-001"]
  }, [camera.id])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let lastTime = 0
    const fps = 12

    function animate(timestamp: number) {
      const delta = timestamp - lastTime
      if (delta > 1000 / fps) {
        lastTime = timestamp
        frameRef.current++
        if (ctx && canvas) {
          drawOverlay(ctx, canvas.width, canvas.height, camera, masked, frameRef.current, imageRef.current, detections)
        }
      }
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [camera, masked, imageLoaded, detections])

  const statusColors = {
    online: "bg-emerald-500",
    offline: "bg-red-500",
    maintenance: "bg-amber-500",
  }

  return (
    <div className={cn("group relative overflow-hidden rounded-lg border border-border bg-card", className)}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-3 py-2">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", statusColors[camera.status])} />
          <span className="text-xs font-medium text-white">{camera.id.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {summary.flaggedObjects > 0 && (
            <Badge variant="outline" className="gap-1 border-red-500/30 bg-red-500/10 px-1.5 py-0 text-[10px] text-red-400">
              ALERT
            </Badge>
          )}
          {masked ? (
            <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0 text-[10px] text-emerald-400">
              <EyeOff className="h-2.5 w-2.5" /> Masked
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 border-amber-500/30 bg-amber-500/10 px-1.5 py-0 text-[10px] text-amber-400">
              <Eye className="h-2.5 w-2.5" /> Revealed
            </Badge>
          )}
        </div>
      </div>

      {/* Canvas Feed */}
      {camera.status === "offline" ? (
        <div className="flex aspect-video items-center justify-center bg-card">
          <div className="text-center">
            <EyeOff className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-xs text-muted-foreground">Feed Offline</p>
          </div>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          width={384}
          height={216}
          className="aspect-video w-full"
        />
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
        <button
          onClick={() => setExpandedOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-secondary/90 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          aria-label="Expand feed"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Expand
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-3 py-1.5">
        <span className="text-[11px] text-muted-foreground">{camera.location}</span>
        <div className="flex items-center gap-1.5">
          {summary.persons > 0 && (
            <div className="flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5">
              <Users className="h-2.5 w-2.5 text-blue-400" />
              <span className="text-[9px] font-medium text-muted-foreground">{summary.persons}</span>
            </div>
          )}
          {summary.vehicles > 0 && (
            <div className="flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5">
              <Car className="h-2.5 w-2.5 text-cyan-400" />
              <span className="text-[9px] font-medium text-muted-foreground">{summary.vehicles}</span>
            </div>
          )}
          {!summary.hasVehicles && summary.vehicles === 0 && (
            <div className="flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5">
              <Activity className="h-2.5 w-2.5 text-primary" />
              <span className="text-[9px] font-medium text-muted-foreground">{summary.total} obj</span>
            </div>
          )}
          <span className="text-[10px] font-medium text-muted-foreground">{camera.zone}</span>
        </div>
      </div>

      <CameraDetailModal
        camera={camera}
        masked={masked}
        open={expandedOpen}
        onOpenChange={setExpandedOpen}
      />
    </div>
  )
}
