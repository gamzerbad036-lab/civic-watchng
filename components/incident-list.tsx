"use client"

import { cn } from "@/lib/utils"
import { incidents } from "@/lib/mock-data"
import { getSectorById } from "@/lib/sector-data"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Activity, ShieldAlert, Monitor } from "lucide-react"

const severityStyles = {
  low: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  critical: "border-red-500/30 bg-red-500/10 text-red-400",
}

const typeIcons = {
  motion: Activity,
  anomaly: AlertTriangle,
  intrusion: ShieldAlert,
  system: Monitor,
}

const statusDot = {
  active: "bg-red-400 animate-pulse",
  acknowledged: "bg-amber-400",
  resolved: "bg-emerald-400",
}

export function IncidentList() {
  return (
    <div className="flex flex-col gap-2">
      {incidents.map((incident) => {
        const Icon = typeIcons[incident.type]
        const time = new Date(incident.timestamp)
        return (
          <div
            key={incident.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border border-border bg-secondary/50 p-3 transition-colors hover:bg-secondary"
            )}
          >
            <div className={cn(
              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
              incident.severity === "critical" ? "bg-red-500/10 text-red-400" :
              incident.severity === "high" ? "bg-orange-500/10 text-orange-400" :
              incident.severity === "medium" ? "bg-amber-500/10 text-amber-400" :
              "bg-sky-500/10 text-sky-400"
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground truncate">{incident.description}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={cn("px-1.5 py-0 text-[10px]", severityStyles[incident.severity])}>
                  {incident.severity.toUpperCase()}
                </Badge>
                {incident.sector && (
                  <Badge 
                    variant="outline" 
                    className="px-1.5 py-0 text-[10px]"
                    style={{ 
                      backgroundColor: `${getSectorById(incident.sector)?.color || '#6b7280'}15`,
                      borderColor: `${getSectorById(incident.sector)?.color || '#6b7280'}40`,
                      color: getSectorById(incident.sector)?.color || '#6b7280'
                    }}
                  >
                    {getSectorById(incident.sector)?.shortName}
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground">{incident.cameraName}</span>
                <span className="text-[10px] text-muted-foreground">
                  {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <div className="flex items-center gap-1 ml-auto">
                  <div className={cn("h-1.5 w-1.5 rounded-full", statusDot[incident.status])} />
                  <span className="text-[10px] text-muted-foreground capitalize">{incident.status}</span>
                </div>
              </div>
              {incident.sectorProtocol && (
                <p className="mt-1.5 text-[10px] text-muted-foreground/70 italic">
                  Protocol: {incident.sectorProtocol}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
