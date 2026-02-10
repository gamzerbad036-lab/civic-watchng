"use client"

import { cn } from "@/lib/utils"
import { cameras } from "@/lib/mock-data"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const statusColors = {
  online: "bg-emerald-500 shadow-emerald-500/50",
  offline: "bg-red-500 shadow-red-500/50",
  maintenance: "bg-amber-500 shadow-amber-500/50",
}

export function CameraMap() {
  // Normalize camera positions to a relative grid
  const lats = cameras.map((c) => c.lat)
  const lngs = cameras.map((c) => c.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const latRange = maxLat - minLat || 1
  const lngRange = maxLng - minLng || 1

  return (
    <TooltipProvider delayDuration={0}>
      <div className="relative h-full w-full overflow-hidden rounded-lg border border-border bg-secondary/30">
        {/* Grid lines */}
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          {/* Horizontal grid lines */}
          {[...Array(8)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={`${(i + 1) * 12.5}%`}
              x2="100%"
              y2={`${(i + 1) * 12.5}%`}
              stroke="hsl(222, 30%, 14%)"
              strokeWidth="0.5"
            />
          ))}
          {/* Vertical grid lines */}
          {[...Array(8)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={`${(i + 1) * 12.5}%`}
              y1="0"
              x2={`${(i + 1) * 12.5}%`}
              y2="100%"
              stroke="hsl(222, 30%, 14%)"
              strokeWidth="0.5"
            />
          ))}
        </svg>

        {/* Zone labels */}
        <div className="absolute top-3 left-3 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">Zone A</div>
        <div className="absolute top-3 right-3 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">Zone B</div>
        <div className="absolute bottom-3 left-3 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">Zone C</div>
        <div className="absolute bottom-3 right-3 text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">Zone D</div>

        {/* Camera markers */}
        {cameras.map((camera) => {
          const x = ((camera.lng - minLng) / lngRange) * 70 + 15
          const y = 85 - ((camera.lat - minLat) / latRange) * 70

          return (
            <Tooltip key={camera.id}>
              <TooltipTrigger asChild>
                <button
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  aria-label={`Camera ${camera.name} - ${camera.status}`}
                >
                  <div className="relative">
                    {camera.status === "online" && (
                      <div className="absolute inset-0 -m-1 animate-ping rounded-full bg-emerald-500/30" />
                    )}
                    <div className={cn("h-3 w-3 rounded-full shadow-lg", statusColors[camera.status])} />
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-card border-border">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-foreground">{camera.name}</span>
                  <span className="text-[10px] text-muted-foreground">{camera.location} | {camera.zone}</span>
                  <span className={cn(
                    "text-[10px] font-medium capitalize",
                    camera.status === "online" ? "text-emerald-400" :
                    camera.status === "offline" ? "text-red-400" : "text-amber-400"
                  )}>
                    {camera.status}
                  </span>
                </div>
              </TooltipContent>
            </Tooltip>
          )
        })}

        {/* Legend */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-4 rounded-md bg-card/80 px-3 py-1.5 backdrop-blur-sm border border-border">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-muted-foreground">Online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-[10px] text-muted-foreground">Maintenance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-[10px] text-muted-foreground">Offline</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
