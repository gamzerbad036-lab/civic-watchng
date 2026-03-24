export type AccessMode = "monitoring" | "investigation" | "authorized-reveal" | "audit" | "emergency"

// Security Sectors representing different Nigerian security agencies
export type SecuritySector = 
  | "npf"           // Nigerian Police Force
  | "nis"           // Nigeria Immigration Service  
  | "frsc"          // Federal Road Safety Corps (Transportation Security)
  | "nscdc"         // Nigeria Security and Civil Defence Corps
  | "customs"       // Nigeria Customs Service
  | "efcc"          // Economic and Financial Crimes Commission
  | "dss"           // Department of State Services
  | "correctional"  // Nigerian Correctional Service

export interface SecuritySectorInfo {
  id: SecuritySector
  name: string
  shortName: string
  description: string
  jurisdiction: string
  primaryFocus: string[]
  securityProtocols: string[]
  operationalChallenges: string[]
  integrationPoints: string[]
  color: string
  icon: string // Lucide icon name
}

export interface SectorRequirement {
  id: string
  sectorId: SecuritySector
  category: "surveillance" | "identification" | "tracking" | "reporting" | "compliance" | "interoperability"
  priority: "critical" | "high" | "medium" | "low"
  requirement: string
  rationale: string
  status: "implemented" | "in-progress" | "planned" | "under-review"
}

export interface Camera {
  id: string
  name: string
  location: string
  status: "online" | "offline" | "maintenance"
  lat: number
  lng: number
  zone: string
  sector?: SecuritySector
  sectorDeployment?: string // Specific deployment context within sector
}

export interface CameraActivity {
  id: string
  cameraId: string
  timestamp: string
  type: "person_entry" | "person_exit" | "vehicle" | "package" | "anomaly" | "system_event"
  description: string
  confidence: number // 0-100
  personCount?: number
  faceMatches?: string[]
  zone?: string
}

export interface Incident {
  id: string
  type: "motion" | "anomaly" | "intrusion" | "system"
  severity: "low" | "medium" | "high" | "critical"
  cameraId: string
  cameraName: string
  description: string
  timestamp: string
  status: "active" | "acknowledged" | "resolved"
  sector?: SecuritySector
  sectorProtocol?: string // Relevant sector protocol triggered
}

export interface AuditLogEntry {
  id: string
  action: string
  user: string
  mode: AccessMode
  details: string
  timestamp: string
  caseId?: string
  ipAddress: string
  result: "success" | "denied" | "expired"
}

export interface RevealRequest {
  id: string
  cameraId: string
  cameraName: string
  reason: string
  caseId: string
  duration: number // minutes
  status: "pending" | "approved" | "active" | "expired" | "denied"
  requestedAt: string
  expiresAt?: string
  requestedBy: string
}

export interface CameraReport {
  camera: Camera
  totalActivity: number
  activeDetections: number
  incidents: Incident[]
  activity: CameraActivity[]
  dailyPeakTime: string
  averagePersonsPerHour: number
  lastIncident?: Incident
}
