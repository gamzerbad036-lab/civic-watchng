export type AccessMode = "monitoring" | "investigation" | "authorized-reveal" | "audit" | "emergency"

export interface Camera {
  id: string
  name: string
  location: string
  status: "online" | "offline" | "maintenance"
  lat: number
  lng: number
  zone: string
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
