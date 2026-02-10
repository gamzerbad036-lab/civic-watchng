"use client"

import { useState } from "react"
import type { AccessMode } from "@/lib/types"
import { cameras } from "@/lib/mock-data"
import { CameraFeed } from "@/components/camera-feed"
import { CameraMap } from "@/components/camera-map"
import { IncidentList } from "@/components/incident-list"
import { StatsCards } from "@/components/stats-cards"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Grid3X3, Map, Bell } from "lucide-react"

interface DashboardProps {
  accessMode: AccessMode
}

export function Dashboard({ accessMode }: DashboardProps) {
  const [zoneFilter, setZoneFilter] = useState<string>("all")

  const filteredCameras = zoneFilter === "all"
    ? cameras
    : cameras.filter((c) => c.zone === zoneFilter)

  const zones = Array.from(new Set(cameras.map((c) => c.zone)))

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Surveillance Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Real-time monitoring with privacy protection enabled
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">Privacy Shield Active</span>
          </div>
          <Select value={zoneFilter} onValueChange={setZoneFilter}>
            <SelectTrigger className="w-32 h-9 text-xs bg-card">
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              {zones.map((zone) => (
                <SelectItem key={zone} value={zone}>{zone}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Main Content */}
      <Tabs defaultValue="feeds" className="flex flex-col gap-4">
        <TabsList className="w-fit bg-card border border-border">
          <TabsTrigger value="feeds" className="gap-2 text-xs data-[state=active]:bg-secondary">
            <Grid3X3 className="h-3.5 w-3.5" /> Camera Feeds
          </TabsTrigger>
          <TabsTrigger value="map" className="gap-2 text-xs data-[state=active]:bg-secondary">
            <Map className="h-3.5 w-3.5" /> Map View
          </TabsTrigger>
          <TabsTrigger value="incidents" className="gap-2 text-xs data-[state=active]:bg-secondary">
            <Bell className="h-3.5 w-3.5" /> Incidents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feeds" className="mt-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCameras.map((camera) => (
              <CameraFeed
                key={camera.id}
                camera={camera}
                masked={accessMode !== "authorized-reveal"}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="map" className="mt-0">
          <div className="h-[500px] rounded-lg">
            <CameraMap />
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="mt-0">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Recent Incidents</h3>
              <span className="text-xs text-muted-foreground">Last 24 hours</span>
            </div>
            <IncidentList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
