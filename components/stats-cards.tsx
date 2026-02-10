"use client"

import { cn } from "@/lib/utils"
import { cameras, incidents, auditLogs } from "@/lib/mock-data"
import { vehicleTrackingRecords } from "@/lib/detection-engine"
import { Video, AlertTriangle, ShieldCheck, FileText, Car } from "lucide-react"

const stats = [
  {
    label: "Active Cameras",
    value: cameras.filter((c) => c.status === "online").length,
    total: cameras.length,
    icon: Video,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    label: "Active Incidents",
    value: incidents.filter((i) => i.status === "active").length,
    total: incidents.length,
    icon: AlertTriangle,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    label: "Tracked Vehicles",
    value: vehicleTrackingRecords.length,
    total: null,
    icon: Car,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
  {
    label: "Privacy Score",
    value: "98%",
    total: null,
    icon: ShieldCheck,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    label: "Audit Actions",
    value: auditLogs.length,
    total: null,
    icon: FileText,
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
          >
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", stat.bgColor)}>
              <Icon className={cn("h-5 w-5", stat.color)} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {stat.value}
                {stat.total !== null && (
                  <span className="text-sm font-normal text-muted-foreground">/{stat.total}</span>
                )}
              </p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
