import type { Camera, Incident, AuditLogEntry, RevealRequest, CameraActivity } from "./types"

// Cameras deployed across multiple Nigerian security sectors
// Each camera simulates deployment in a specific sector context
export const cameras: Camera[] = [
  // Nigerian Police Force (NPF) - Police Command HQ
  { id: "cam-001", name: "Main Gate A", location: "Police Command HQ - North Entrance", status: "online", lat: 9.0579, lng: 7.4951, zone: "Zone A", sector: "npf", sectorDeployment: "Force Headquarters Entry Checkpoint" },
  { id: "cam-002", name: "Parking Lot B", location: "Police Command HQ - Vehicle Bay", status: "online", lat: 9.0585, lng: 7.4960, zone: "Zone A", sector: "npf", sectorDeployment: "Official Vehicle Monitoring Area" },
  
  // Nigeria Immigration Service (NIS) - Airport Terminal
  { id: "cam-003", name: "Immigration Checkpoint", location: "Nnamdi Azikiwe Intl - Arrival Hall", status: "online", lat: 9.0570, lng: 7.4945, zone: "Zone B", sector: "nis", sectorDeployment: "Passport Control & Biometric Verification" },
  { id: "cam-004", name: "Departure Corridor", location: "Nnamdi Azikiwe Intl - Terminal 2", status: "maintenance", lat: 9.0575, lng: 7.4938, zone: "Zone B", sector: "nis", sectorDeployment: "Pre-departure Security Screening" },
  
  // Nigeria Security & Civil Defence Corps (NSCDC) - Pipeline Facility
  { id: "cam-005", name: "Pipeline Junction", location: "NNPC Pipeline - Kaduna Sector", status: "online", lat: 9.0568, lng: 7.4955, zone: "Zone C", sector: "nscdc", sectorDeployment: "Critical Infrastructure Monitoring" },
  { id: "cam-006", name: "Perimeter Fence", location: "NNPC Depot - South Boundary", status: "online", lat: 9.0560, lng: 7.4948, zone: "Zone C", sector: "nscdc", sectorDeployment: "Intrusion Detection Zone" },
  
  // Federal Road Safety Corps (FRSC) - Highway Station
  { id: "cam-007", name: "Highway Checkpoint", location: "Abuja-Kaduna Expressway - Km 45", status: "offline", lat: 9.0582, lng: 7.4935, zone: "Zone D", sector: "frsc", sectorDeployment: "Traffic Monitoring & Speed Detection" },
  { id: "cam-008", name: "Toll Plaza Overview", location: "Kubwa Toll Gate - Outbound", status: "online", lat: 9.0590, lng: 7.4942, zone: "Zone D", sector: "frsc", sectorDeployment: "License Plate Recognition Station" },
  
  // Nigeria Customs Service (NCS) - Cargo Terminal
  { id: "cam-009", name: "Cargo Inspection Bay", location: "Apapa Port - Container Terminal", status: "online", lat: 9.0565, lng: 7.4965, zone: "Zone A", sector: "customs", sectorDeployment: "Import Cargo Examination Area" },
  
  // Economic & Financial Crimes Commission (EFCC) - Operations Center
  { id: "cam-010", name: "Evidence Holding", location: "EFCC Zonal Office - Secure Area", status: "online", lat: 9.0573, lng: 7.4952, zone: "Zone B", sector: "efcc", sectorDeployment: "Asset Recovery & Evidence Storage" },
  
  // Department of State Services (DSS) - Secure Facility
  { id: "cam-011", name: "VIP Compound", location: "DSS Facility - Protected Zone", status: "online", lat: 9.0555, lng: 7.4940, zone: "Zone C", sector: "dss", sectorDeployment: "High-Value Target Protection" },
  
  // Nigerian Correctional Service (NCoS) - Correctional Center
  { id: "cam-012", name: "Exercise Yard", location: "Kuje Correctional Center - Outdoor", status: "online", lat: 9.0562, lng: 7.4930, zone: "Zone D", sector: "correctional", sectorDeployment: "Inmate Movement Monitoring" },
]

// Sector-specific incidents demonstrating unique operational scenarios
export const incidents: Incident[] = [
  // NPF - Police Command
  { id: "inc-001", type: "motion", severity: "low", cameraId: "cam-001", cameraName: "Main Gate A", description: "Unauthorized vehicle approach to Police HQ gate - identity verification in progress", timestamp: "2026-02-06T14:23:00Z", status: "active", sector: "npf", sectorProtocol: "NPF-SEC-101: Facility Access Control" },
  
  // NSCDC - Pipeline Security
  { id: "inc-002", type: "anomaly", severity: "high", cameraId: "cam-005", cameraName: "Pipeline Junction", description: "Suspicious activity detected near pipeline valve - potential vandalism attempt", timestamp: "2026-02-06T13:45:00Z", status: "active", sector: "nscdc", sectorProtocol: "NSCDC-CIP-003: Critical Infrastructure Protection" },
  
  // NSCDC - Perimeter Breach
  { id: "inc-003", type: "intrusion", severity: "critical", cameraId: "cam-006", cameraName: "Perimeter Fence", description: "Perimeter breach at NNPC depot fence - rapid response team dispatched", timestamp: "2026-02-06T12:30:00Z", status: "acknowledged", sector: "nscdc", sectorProtocol: "NSCDC-INT-001: Intrusion Response Protocol" },
  
  // FRSC - Highway Monitoring
  { id: "inc-004", type: "system", severity: "medium", cameraId: "cam-007", cameraName: "Highway Checkpoint", description: "Camera feed interruption on Abuja-Kaduna highway - maintenance crew en route", timestamp: "2026-02-06T11:15:00Z", status: "active", sector: "frsc", sectorProtocol: "FRSC-OPS-205: Equipment Maintenance Alert" },
  
  // Customs - Cargo Monitoring
  { id: "inc-005", type: "motion", severity: "low", cameraId: "cam-009", cameraName: "Cargo Inspection Bay", description: "Scheduled container shipment arrived at Apapa port - manifest verification in progress", timestamp: "2026-02-06T10:00:00Z", status: "resolved", sector: "customs", sectorProtocol: "NCS-IMP-012: Import Cargo Processing" },
  
  // NIS - Immigration Alert
  { id: "inc-006", type: "anomaly", severity: "medium", cameraId: "cam-003", cameraName: "Immigration Checkpoint", description: "Watchlist match flagged at airport immigration - traveler detained for verification", timestamp: "2026-02-06T09:30:00Z", status: "acknowledged", sector: "nis", sectorProtocol: "NIS-BDR-007: Watchlist Screening Protocol" },
  
  // EFCC - Financial Crime Investigation
  { id: "inc-007", type: "anomaly", severity: "high", cameraId: "cam-010", cameraName: "Evidence Holding", description: "Suspect vehicle linked to money laundering case detected in vicinity", timestamp: "2026-02-06T08:15:00Z", status: "active", sector: "efcc", sectorProtocol: "EFCC-INV-015: Suspect Tracking Protocol" },
  
  // DSS - VIP Protection
  { id: "inc-008", type: "motion", severity: "critical", cameraId: "cam-011", cameraName: "VIP Compound", description: "Unscheduled approach to protected zone - counter-surveillance activated", timestamp: "2026-02-06T07:45:00Z", status: "acknowledged", sector: "dss", sectorProtocol: "DSS-VIP-001: Protective Intelligence Response" },
  
  // Correctional - Facility Security
  { id: "inc-009", type: "anomaly", severity: "high", cameraId: "cam-012", cameraName: "Exercise Yard", description: "Unusual congregation detected in yard area - guards alerted", timestamp: "2026-02-06T06:30:00Z", status: "active", sector: "correctional", sectorProtocol: "NCoS-SEC-008: Behavioral Anomaly Response" },
]

export const auditLogs: AuditLogEntry[] = [
  { id: "log-001", action: "Mode Switch", user: "madeena.umar@civicwatch.ng", mode: "investigation", details: "Switched to Investigation Mode for Case #CW-2026-0042", timestamp: "2026-02-06T14:30:00Z", caseId: "CW-2026-0042", ipAddress: "192.168.1.100", result: "success" },
  { id: "log-002", action: "Identity Reveal Request", user: "madeena.umar@civicwatch.ng", mode: "authorized-reveal", details: "Requested identity reveal on cam-005 footage for Case #CW-2026-0042", timestamp: "2026-02-06T14:25:00Z", caseId: "CW-2026-0042", ipAddress: "192.168.1.100", result: "success" },
  { id: "log-003", action: "Feed Access", user: "madeena.umar@civicwatch.ng", mode: "monitoring", details: "Accessed live feed from Perimeter South camera", timestamp: "2026-02-06T13:00:00Z", ipAddress: "192.168.1.100", result: "success" },
  { id: "log-004", action: "Reveal Expired", user: "system", mode: "authorized-reveal", details: "Auto re-masking applied after reveal duration expired on cam-003 (Building Entrance)", timestamp: "2026-02-06T12:00:00Z", caseId: "CW-2026-0038", ipAddress: "system", result: "expired" },
  { id: "log-005", action: "Emergency Override", user: "madeena.umar@civicwatch.ng", mode: "emergency", details: "Emergency mode activated - MFA verified", timestamp: "2026-02-06T11:30:00Z", caseId: "CW-2026-0040", ipAddress: "192.168.1.100", result: "success" },
  { id: "log-006", action: "Login", user: "madeena.umar@civicwatch.ng", mode: "monitoring", details: "Successful authentication with MFA", timestamp: "2026-02-06T09:00:00Z", ipAddress: "192.168.1.100", result: "success" },
  { id: "log-007", action: "Unauthorized Access Attempt", user: "unknown", mode: "monitoring", details: "Failed login attempt from unknown IP", timestamp: "2026-02-06T08:45:00Z", ipAddress: "10.0.0.55", result: "denied" },
  { id: "log-008", action: "Identity Reveal Request", user: "madeena.umar@civicwatch.ng", mode: "authorized-reveal", details: "Requested reveal denied - insufficient justification for cam-010", timestamp: "2026-02-06T08:30:00Z", caseId: "CW-2026-0035", ipAddress: "192.168.1.100", result: "denied" },
]

export const revealRequests: RevealRequest[] = [
  { id: "rev-001", cameraId: "cam-005", cameraName: "Utility Enclosure", reason: "Investigating unauthorized access to utility enclosure after hours. Suspect captured on masked footage.", caseId: "CW-2026-0042", duration: 30, status: "active", requestedAt: "2026-02-06T14:25:00Z", expiresAt: "2026-02-06T14:55:00Z", requestedBy: "madeena.umar@civicwatch.ng" },
  { id: "rev-002", cameraId: "cam-006", cameraName: "Perimeter South", reason: "Perimeter breach investigation - identify intruder for law enforcement handoff.", caseId: "CW-2026-0041", duration: 60, status: "pending", requestedAt: "2026-02-06T13:00:00Z", requestedBy: "madeena.umar@civicwatch.ng" },
  { id: "rev-003", cameraId: "cam-003", cameraName: "Building Entrance", reason: "Package identification for security clearance verification.", caseId: "CW-2026-0038", duration: 15, status: "expired", requestedAt: "2026-02-06T11:45:00Z", expiresAt: "2026-02-06T12:00:00Z", requestedBy: "madeena.umar@civicwatch.ng" },
]

// Camera Activity Data - detailed per-camera activity logs
export const cameraActivities: Record<string, CameraActivity[]> = {
  "cam-001": [
    { id: "act-001-1", cameraId: "cam-001", timestamp: "2026-02-06T14:45:00Z", type: "person_entry", description: "Staff member entered via main gate", confidence: 98, personCount: 1, zone: "Zone A" },
    { id: "act-001-2", cameraId: "cam-001", timestamp: "2026-02-06T14:22:00Z", type: "person_entry", description: "Visitor arrival - credential check in progress", confidence: 95, personCount: 1, faceMatches: ["VIS-0847"] },
    { id: "act-001-3", cameraId: "cam-001", timestamp: "2026-02-06T13:58:00Z", type: "vehicle", description: "Official vehicle passed through checkpoint", confidence: 99, zone: "Zone A" },
    { id: "act-001-4", cameraId: "cam-001", timestamp: "2026-02-06T13:15:00Z", type: "person_exit", description: "Staff departure confirmed", confidence: 97, personCount: 1 },
    { id: "act-001-5", cameraId: "cam-001", timestamp: "2026-02-06T12:30:00Z", type: "anomaly", description: "Unusual loitering detected - cleared after 2 minutes", confidence: 92, zone: "Zone A" },
    { id: "act-001-6", cameraId: "cam-001", timestamp: "2026-02-06T11:45:00Z", type: "person_entry", description: "Morning shift staff arrival", confidence: 96, personCount: 3 },
  ],
  "cam-002": [
    { id: "act-002-1", cameraId: "cam-002", timestamp: "2026-02-06T14:52:00Z", type: "vehicle", description: "Vehicle parked in designated area", confidence: 97, zone: "Zone A" },
    { id: "act-002-2", cameraId: "cam-002", timestamp: "2026-02-06T14:10:00Z", type: "person_entry", description: "Person entered from parking lot", confidence: 94, personCount: 1 },
    { id: "act-002-3", cameraId: "cam-002", timestamp: "2026-02-06T13:32:00Z", type: "vehicle", description: "Delivery vehicle left parking lot", confidence: 98, zone: "Zone A" },
    { id: "act-002-4", cameraId: "cam-002", timestamp: "2026-02-06T12:05:00Z", type: "person_exit", description: "Staff member left building via parking exit", confidence: 96, personCount: 1 },
    { id: "act-002-5", cameraId: "cam-002", timestamp: "2026-02-06T11:20:00Z", type: "vehicle", description: "Morning vehicle arrivals - 4 vehicles", confidence: 99, zone: "Zone A" },
  ],
  "cam-003": [
    { id: "act-003-1", cameraId: "cam-003", timestamp: "2026-02-06T14:48:00Z", type: "person_entry", description: "Building entrance courtyard - visitor check-in", confidence: 96, personCount: 2, faceMatches: ["VIS-0847", "VIS-0848"] },
    { id: "act-003-2", cameraId: "cam-003", timestamp: "2026-02-06T14:15:00Z", type: "package", description: "Package delivered at entrance checkpoint", confidence: 93, zone: "Zone B" },
    { id: "act-003-3", cameraId: "cam-003", timestamp: "2026-02-06T13:40:00Z", type: "person_exit", description: "Multiple staff exiting through courtyard for lunch break", confidence: 97, personCount: 5 },
    { id: "act-003-4", cameraId: "cam-003", timestamp: "2026-02-06T12:55:00Z", type: "anomaly", description: "Unattended package in courtyard - staff responded", confidence: 88, zone: "Zone B" },
    { id: "act-003-5", cameraId: "cam-003", timestamp: "2026-02-06T11:30:00Z", type: "person_entry", description: "Morning foot traffic - facility entrance opening", confidence: 98, personCount: 8 },
  ],
  "cam-004": [
    { id: "act-004-1", cameraId: "cam-004", timestamp: "2026-02-06T14:30:00Z", type: "system_event", description: "Camera maintenance mode - live feed unavailable", confidence: 100, zone: "Zone B" },
    { id: "act-004-2", cameraId: "cam-004", timestamp: "2026-02-06T10:00:00Z", type: "person_entry", description: "Staff walking through outdoor walkway", confidence: 95, personCount: 2 },
  ],
  "cam-005": [
    { id: "act-005-1", cameraId: "cam-005", timestamp: "2026-02-06T14:25:00Z", type: "anomaly", description: "Unauthorized access to utility enclosure - logged and flagged", confidence: 99, zone: "Zone C" },
    { id: "act-005-2", cameraId: "cam-005", timestamp: "2026-02-06T13:42:00Z", type: "person_entry", description: "Authorized personnel entered utility enclosure", confidence: 98, personCount: 1, faceMatches: ["EMP-0234"] },
    { id: "act-005-3", cameraId: "cam-005", timestamp: "2026-02-06T13:00:00Z", type: "system_event", description: "Routine equipment audit - no issues detected", confidence: 100 },
    { id: "act-005-4", cameraId: "cam-005", timestamp: "2026-02-06T11:50:00Z", type: "person_exit", description: "Maintenance personnel departed", confidence: 96, personCount: 1 },
  ],
  "cam-006": [
    { id: "act-006-1", cameraId: "cam-006", timestamp: "2026-02-06T12:30:00Z", type: "intrusion", description: "Perimeter breach detected - intruder on fence line", confidence: 96, zone: "Zone C" },
    { id: "act-006-2", cameraId: "cam-006", timestamp: "2026-02-06T11:15:00Z", type: "anomaly", description: "Unusual movement along perimeter fence", confidence: 91, zone: "Zone C" },
    { id: "act-006-3", cameraId: "cam-006", timestamp: "2026-02-06T09:30:00Z", type: "system_event", description: "Perimeter system check - all zones clear", confidence: 100, zone: "Zone C" },
  ],
  "cam-007": [
    { id: "act-007-1", cameraId: "cam-007", timestamp: "2026-02-06T11:15:00Z", type: "system_event", description: "Camera feed interruption - possible tampering", confidence: 85, zone: "Zone D" },
  ],
  "cam-008": [
    { id: "act-008-1", cameraId: "cam-008", timestamp: "2026-02-06T14:50:00Z", type: "system_event", description: "Rooftop perimeter scan - no threats detected", confidence: 99, zone: "Zone D" },
    { id: "act-008-2", cameraId: "cam-008", timestamp: "2026-02-06T13:20:00Z", type: "anomaly", description: "Unusual bird activity - false positive cleared", confidence: 45, zone: "Zone D" },
    { id: "act-008-3", cameraId: "cam-008", timestamp: "2026-02-06T10:00:00Z", type: "system_event", description: "Daily rooftop inspection completed", confidence: 100, zone: "Zone D" },
  ],
  "cam-009": [
    { id: "act-009-1", cameraId: "cam-009", timestamp: "2026-02-06T14:35:00Z", type: "vehicle", description: "Delivery truck at loading bay", confidence: 98, zone: "Zone A" },
    { id: "act-009-2", cameraId: "cam-009", timestamp: "2026-02-06T13:50:00Z", type: "person_entry", description: "Warehouse staff confirmed at loading bay", confidence: 97, personCount: 2 },
    { id: "act-009-3", cameraId: "cam-009", timestamp: "2026-02-06T12:00:00Z", type: "package", description: "Scheduled delivery arrived - 5 packages", confidence: 96, zone: "Zone A" },
    { id: "act-009-4", cameraId: "cam-009", timestamp: "2026-02-06T10:15:00Z", type: "person_exit", description: "Staff departure from loading bay", confidence: 94, personCount: 2 },
  ],
  "cam-010": [
    { id: "act-010-1", cameraId: "cam-010", timestamp: "2026-02-06T14:40:00Z", type: "person_entry", description: "Pavilion staff at outdoor desk", confidence: 98, personCount: 2, zone: "Zone B" },
    { id: "act-010-2", cameraId: "cam-010", timestamp: "2026-02-06T14:05:00Z", type: "package", description: "Package placed at outdoor pavilion counter", confidence: 94, zone: "Zone B" },
    { id: "act-010-3", cameraId: "cam-010", timestamp: "2026-02-06T13:15:00Z", type: "person_entry", description: "Multiple visitors arriving at pavilion", confidence: 96, personCount: 4, faceMatches: ["VIS-0847", "VIS-0848"] },
    { id: "act-010-4", cameraId: "cam-010", timestamp: "2026-02-06T11:00:00Z", type: "person_entry", description: "Morning pavilion staffing", confidence: 99, personCount: 2 },
  ],
  "cam-011": [
    { id: "act-011-1", cameraId: "cam-011", timestamp: "2026-02-06T14:45:00Z", type: "person_entry", description: "Staff entering annex building", confidence: 97, personCount: 3, zone: "Zone C" },
    { id: "act-011-2", cameraId: "cam-011", timestamp: "2026-02-06T13:30:00Z", type: "person_exit", description: "Staff departure for break", confidence: 96, personCount: 2 },
    { id: "act-011-3", cameraId: "cam-011", timestamp: "2026-02-06T12:00:00Z", type: "system_event", description: "Routine exterior perimeter check", confidence: 100, zone: "Zone C" },
  ],
  "cam-012": [
    { id: "act-012-1", cameraId: "cam-012", timestamp: "2026-02-06T14:20:00Z", type: "system_event", description: "Generator yard - all systems operational", confidence: 99, zone: "Zone D" },
    { id: "act-012-2", cameraId: "cam-012", timestamp: "2026-02-06T13:00:00Z", type: "person_entry", description: "Maintenance technician inspecting outdoor generators", confidence: 98, personCount: 1, faceMatches: ["EMP-0512"] },
    { id: "act-012-3", cameraId: "cam-012", timestamp: "2026-02-06T11:30:00Z", type: "system_event", description: "Power load test completed successfully", confidence: 100, zone: "Zone D" },
  ],
}
