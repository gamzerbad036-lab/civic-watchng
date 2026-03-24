"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { securitySectors, sectorRequirements, getSectorById } from "@/lib/sector-data"
import { cameras, incidents } from "@/lib/mock-data"
import type { SecuritySector, SecuritySectorInfo, SectorRequirement } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  Plane,
  Car,
  Building2,
  Package,
  Scale,
  Eye,
  Lock,
  ChevronRight,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Target,
  Users,
  MapPin,
} from "lucide-react"

const sectorIcons: Record<string, React.ElementType> = {
  Shield,
  Plane,
  Car,
  Building2,
  Package,
  Scale,
  Eye,
  Lock,
}

function getSectorIcon(iconName: string): React.ElementType {
  return sectorIcons[iconName] || Shield
}

function getStatusBadge(status: SectorRequirement["status"]) {
  const config = {
    "implemented": { label: "Implemented", variant: "default" as const, className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    "in-progress": { label: "In Progress", variant: "secondary" as const, className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    "planned": { label: "Planned", variant: "outline" as const, className: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
    "under-review": { label: "Under Review", variant: "outline" as const, className: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  }
  return config[status]
}

function getPriorityBadge(priority: SectorRequirement["priority"]) {
  const config = {
    "critical": { label: "Critical", className: "bg-red-500/10 text-red-400 border-red-500/20" },
    "high": { label: "High", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
    "medium": { label: "Medium", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    "low": { label: "Low", className: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  }
  return config[priority]
}

interface SectorCardProps {
  sector: SecuritySectorInfo
  isSelected: boolean
  onClick: () => void
}

function SectorCard({ sector, isSelected, onClick }: SectorCardProps) {
  const Icon = getSectorIcon(sector.icon)
  const sectorCameras = cameras.filter(c => c.sector === sector.id)
  const sectorIncidents = incidents.filter(i => i.sector === sector.id)
  const activeIncidents = sectorIncidents.filter(i => i.status === "active")
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-primary/50 hover:bg-secondary/50"
      )}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${sector.color}20` }}
      >
        <Icon className="h-5 w-5" style={{ color: sector.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{sector.shortName}</p>
          <ChevronRight className={cn("h-3 w-3 text-muted-foreground transition-transform", isSelected && "rotate-90")} />
        </div>
        <p className="text-[10px] text-muted-foreground truncate">{sector.name}</p>
        <div className="mt-1.5 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Camera className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">{sectorCameras.length}</span>
          </div>
          {activeIncidents.length > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-amber-400" />
              <span className="text-[10px] text-amber-400">{activeIncidents.length}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

interface SectorDetailProps {
  sector: SecuritySectorInfo
}

function SectorDetail({ sector }: SectorDetailProps) {
  const Icon = getSectorIcon(sector.icon)
  const requirements = sectorRequirements.filter(r => r.sectorId === sector.id)
  const implementedCount = requirements.filter(r => r.status === "implemented").length
  const progressPercent = requirements.length > 0 ? Math.round((implementedCount / requirements.length) * 100) : 0
  
  const sectorCameras = cameras.filter(c => c.sector === sector.id)
  const sectorIncidents = incidents.filter(i => i.sector === sector.id)
  
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${sector.color}20` }}
        >
          <Icon className="h-7 w-7" style={{ color: sector.color }} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground">{sector.name}</h3>
          <p className="text-xs text-muted-foreground">{sector.shortName} - {sector.jurisdiction}</p>
        </div>
      </div>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">{sector.description}</p>
      
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-secondary/50 p-3">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" />
            <span className="text-lg font-bold text-foreground">{sectorCameras.length}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Deployed Cameras</p>
        </div>
        <div className="rounded-lg border border-border bg-secondary/50 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span className="text-lg font-bold text-foreground">{sectorIncidents.length}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Total Incidents</p>
        </div>
        <div className="rounded-lg border border-border bg-secondary/50 p-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-sky-400" />
            <span className="text-lg font-bold text-foreground">{requirements.length}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Requirements</p>
        </div>
      </div>
      
      {/* Requirements Progress */}
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-foreground">Requirements Implementation</span>
          <span className="text-xs text-muted-foreground">{implementedCount}/{requirements.length}</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
        <p className="text-[10px] text-muted-foreground mt-1.5">{progressPercent}% of sector requirements implemented</p>
      </div>
      
      {/* Tabs for detailed info */}
      <Tabs defaultValue="protocols" className="flex flex-col">
        <TabsList className="w-fit bg-secondary border border-border">
          <TabsTrigger value="protocols" className="text-xs data-[state=active]:bg-primary/10">Protocols</TabsTrigger>
          <TabsTrigger value="challenges" className="text-xs data-[state=active]:bg-primary/10">Challenges</TabsTrigger>
          <TabsTrigger value="requirements" className="text-xs data-[state=active]:bg-primary/10">Requirements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="protocols" className="mt-3">
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              <div className="mb-3">
                <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-2">
                  <Target className="h-3.5 w-3.5 text-primary" /> Primary Focus Areas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {sector.primaryFocus.map((focus, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] bg-secondary/50">
                      {focus}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-primary" /> Security Protocols
                </p>
                <ul className="space-y-1.5">
                  {sector.securityProtocols.map((protocol, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400 mt-0.5" />
                      {protocol}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="challenges" className="mt-3">
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> Operational Challenges
                </p>
                <ul className="space-y-1.5">
                  {sector.operationalChallenges.map((challenge, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 shrink-0 text-amber-400 mt-0.5" />
                      {challenge}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-sky-400" /> Integration Points
                </p>
                <ul className="space-y-1.5">
                  {sector.integrationPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0 text-sky-400 mt-0.5" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="requirements" className="mt-3">
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {requirements.map((req) => {
                const statusBadge = getStatusBadge(req.status)
                const priorityBadge = getPriorityBadge(req.priority)
                return (
                  <div key={req.id} className="rounded-lg border border-border bg-secondary/30 p-3">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <Badge variant="outline" className={cn("text-[9px]", priorityBadge.className)}>
                        {priorityBadge.label}
                      </Badge>
                      <Badge variant="outline" className={cn("text-[9px]", statusBadge.className)}>
                        {statusBadge.label}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium text-foreground mb-1">{req.requirement}</p>
                    <p className="text-[10px] text-muted-foreground">{req.rationale}</p>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function SectorPanel() {
  const [selectedSector, setSelectedSector] = useState<SecuritySector>("npf")
  const currentSector = getSectorById(selectedSector)
  
  // Calculate overall stats
  const totalRequirements = sectorRequirements.length
  const implementedRequirements = sectorRequirements.filter(r => r.status === "implemented").length
  
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Security Sector Simulation</h1>
        <p className="text-sm text-muted-foreground">
          Multi-agency requirement elicitation across Nigerian security sectors
        </p>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{securitySectors.length}</p>
                <p className="text-[10px] text-muted-foreground">Security Sectors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Camera className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{cameras.length}</p>
                <p className="text-[10px] text-muted-foreground">Deployed Cameras</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
                <FileText className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{totalRequirements}</p>
                <p className="text-[10px] text-muted-foreground">Total Requirements</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <CheckCircle2 className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{Math.round((implementedRequirements / totalRequirements) * 100)}%</p>
                <p className="text-[10px] text-muted-foreground">Implementation Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sector List */}
        <Card className="border-border bg-card lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Nigerian Security Agencies</CardTitle>
            <CardDescription className="text-xs">
              Select a sector to view protocols, challenges, and requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-2">
                {securitySectors.map((sector) => (
                  <SectorCard
                    key={sector.id}
                    sector={sector}
                    isSelected={selectedSector === sector.id}
                    onClick={() => setSelectedSector(sector.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        
        {/* Sector Detail */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Sector Details & Requirements</CardTitle>
            <CardDescription className="text-xs">
              Comprehensive view of sector-specific security protocols and elicited requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentSector && <SectorDetail sector={currentSector} />}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
