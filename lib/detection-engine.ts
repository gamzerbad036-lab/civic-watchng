// Advanced per-camera detection data model with cross-camera vehicle tracking
// Each camera has image-accurate detections matching what is actually visible

export interface DetectedObject {
  id: string
  type: "person" | "vehicle" | "package" | "equipment"
  label: string
  confidence: number
  // Bounding box as percentage of image dimensions (0-1)
  bbox: { x: number; y: number; w: number; h: number }
  color: string
  tracked: boolean
  // For persons
  faceVisible: boolean
  faceId?: string
  activity?: string
  // For vehicles
  vehicleType?: string
  licensePlate?: string
  vehicleColor?: string
  vehicleModel?: string
  crossCameraId?: string // Shared ID to track same vehicle across cameras
}

export interface VehicleTrackingRecord {
  crossCameraId: string
  licensePlate: string
  vehicleType: string
  vehicleColor: string
  vehicleModel: string
  firstSeen: { cameraId: string; timestamp: string }
  lastSeen: { cameraId: string; timestamp: string }
  sightings: {
    cameraId: string
    cameraName: string
    timestamp: string
    confidence: number
    bbox: { x: number; y: number; w: number; h: number }
    direction?: string
  }[]
  status: "active" | "departed" | "flagged" | "cleared"
  riskLevel: "low" | "medium" | "high"
  notes?: string
}

export interface FaceTrackingRecord {
  faceId: string
  label: string
  type: "staff" | "visitor" | "unknown" | "flagged"
  sightings: {
    cameraId: string
    cameraName: string
    timestamp: string
    confidence: number
    activity: string
  }[]
  status: "active" | "cleared" | "monitoring"
}

// ====================================================================
// Per-camera detection definitions
// Detections are matched to actual image content per camera
// ====================================================================

export const cameraDetections: Record<string, DetectedObject[]> = {
  // CAM-001: Main Gate A - Gate checkpoint with person walking through, dark sedan approaching
  "cam-001": [
    {
      id: "det-001-1",
      type: "person",
      label: "Staff Member",
      confidence: 0.96,
      bbox: { x: 0.38, y: 0.30, w: 0.08, h: 0.28 },
      color: "#3b82f6",
      tracked: true,
      faceVisible: true,
      faceId: "EMP-0312",
      activity: "Walking through gate checkpoint",
      isBlurred: true,
    },
    {
      id: "det-001-2",
      type: "vehicle",
      label: "Dark Sedan",
      confidence: 0.97,
      bbox: { x: 0.55, y: 0.50, w: 0.25, h: 0.22 },
      color: "#06b6d4",
      tracked: true,
      faceVisible: false,
      vehicleType: "Sedan",
      licensePlate: "ABJ-284-KW",
      vehicleColor: "Black",
      vehicleModel: "Toyota Camry",
      crossCameraId: "veh-track-001",
    },
    {
      id: "det-001-3",
      type: "person",
      label: "Gate Guard",
      confidence: 0.93,
      bbox: { x: 0.18, y: 0.32, w: 0.07, h: 0.25 },
      color: "#f59e0b",
      tracked: false,
      faceVisible: true,
      faceId: "EMP-0089",
      activity: "Standing at guard booth",
      isBlurred: true,
    },
  ],

  // CAM-002: Parking Lot B - White SUV pulling in, two people walking, parked cars
  "cam-002": [
    {
      id: "det-002-1",
      type: "vehicle",
      label: "White SUV",
      confidence: 0.98,
      bbox: { x: 0.40, y: 0.38, w: 0.22, h: 0.26 },
      color: "#06b6d4",
      tracked: true,
      faceVisible: false,
      vehicleType: "SUV",
      licensePlate: "LGA-519-FH",
      vehicleColor: "White",
      vehicleModel: "Toyota Highlander",
      crossCameraId: "veh-track-002",
    },
    {
      id: "det-002-2",
      type: "person",
      label: "Visitor A",
      confidence: 0.91,
      bbox: { x: 0.25, y: 0.42, w: 0.06, h: 0.22 },
      color: "#3b82f6",
      tracked: true,
      faceVisible: true,
      faceId: "VIS-0847",
      activity: "Walking between parked cars",
      isBlurred: true,
    },
    {
      id: "det-002-3",
      type: "person",
      label: "Visitor B",
      confidence: 0.88,
      bbox: { x: 0.30, y: 0.44, w: 0.06, h: 0.20 },
      color: "#8b5cf6",
      tracked: true,
      faceVisible: true,
      faceId: "VIS-0848",
      activity: "Walking between parked cars",
      isBlurred: true,
    },
    {
      id: "det-002-4",
      type: "vehicle",
      label: "Parked Sedan (Black)",
      confidence: 0.95,
      bbox: { x: 0.08, y: 0.52, w: 0.18, h: 0.18 },
      color: "#64748b",
      tracked: true,
      faceVisible: false,
      vehicleType: "Sedan",
      licensePlate: "ABJ-284-KW",
      vehicleColor: "Black",
      vehicleModel: "Toyota Camry",
      crossCameraId: "veh-track-001", // Same vehicle from cam-001!
    },
    {
      id: "det-002-5",
      type: "vehicle",
      label: "Parked Hatchback (Silver)",
      confidence: 0.90,
      bbox: { x: 0.70, y: 0.55, w: 0.16, h: 0.16 },
      color: "#64748b",
      tracked: false,
      faceVisible: false,
      vehicleType: "Hatchback",
      licensePlate: "KAN-802-GJ",
      vehicleColor: "Silver",
      vehicleModel: "Honda Fit",
      crossCameraId: "veh-track-003",
    },
  ],

  // CAM-003: Building Entrance - Front courtyard, people approaching entrance
  "cam-003": [
    {
      id: "det-003-1",
      type: "person",
      label: "Reception Staff",
      confidence: 0.97,
      bbox: { x: 0.42, y: 0.28, w: 0.07, h: 0.24 },
      color: "#10b981",
      tracked: false,
      faceVisible: true,
      faceId: "EMP-0156",
      activity: "Standing at entrance checkpoint",
      isBlurred: true,
    },
    {
      id: "det-003-2",
      type: "person",
      label: "Visitor A",
      confidence: 0.94,
      bbox: { x: 0.35, y: 0.30, w: 0.06, h: 0.22 },
      color: "#3b82f6",
      tracked: true,
      faceVisible: true,
      faceId: "VIS-0847", // Same visitor from cam-002
      activity: "Walking toward building entrance",
      isBlurred: true,
    },
    {
      id: "det-003-3",
      type: "person",
      label: "Visitor B",
      confidence: 0.92,
      bbox: { x: 0.50, y: 0.32, w: 0.06, h: 0.22 },
      color: "#8b5cf6",
      tracked: true,
      faceVisible: true,
      faceId: "VIS-0848", // Same visitor from cam-002
      activity: "Waiting in courtyard area",
      isBlurred: true,
    },
    {
      id: "det-003-4",
      type: "person",
      label: "Staff Member",
      confidence: 0.89,
      bbox: { x: 0.72, y: 0.40, w: 0.06, h: 0.22 },
      color: "#f59e0b",
      tracked: false,
      faceVisible: true,
      faceId: "EMP-0234",
      activity: "Walking across courtyard",
      isBlurred: true,
    },
    {
      id: "det-003-5",
      type: "package",
      label: "Unattended Package",
      confidence: 0.86,
      bbox: { x: 0.62, y: 0.62, w: 0.08, h: 0.06 },
      color: "#ef4444",
      tracked: false,
      faceVisible: false,
      activity: "Stationary on courtyard ground",
    },
  ],

  // CAM-004: Walkway B2 - Maintenance mode, empty outdoor walkway, no people
  "cam-004": [],

  // CAM-005: Utility Enclosure - One person in dark clothing near equipment
  "cam-005": [
    {
      id: "det-005-1",
      type: "person",
      label: "Unidentified Individual",
      confidence: 0.94,
      bbox: { x: 0.45, y: 0.28, w: 0.09, h: 0.35 },
      color: "#ef4444",
      tracked: true,
      faceVisible: true,
      faceId: "UNK-0001",
      activity: "Accessing utility equipment - FLAGGED",
      isBlurred: true,
    },
    {
      id: "det-005-2",
      type: "equipment",
      label: "Server Rack A",
      confidence: 0.99,
      bbox: { x: 0.15, y: 0.10, w: 0.15, h: 0.75 },
      color: "#64748b",
      tracked: false,
      faceVisible: false,
      activity: "Equipment - nominal",
    },
    {
      id: "det-005-3",
      type: "equipment",
      label: "Server Rack B",
      confidence: 0.99,
      bbox: { x: 0.65, y: 0.10, w: 0.15, h: 0.75 },
      color: "#64748b",
      tracked: false,
      faceVisible: false,
      activity: "Equipment - nominal",
    },
  ],

  // CAM-006: Perimeter South - Fence line, one suspicious figure, no vehicles
  "cam-006": [
    {
      id: "det-006-1",
      type: "person",
      label: "Intruder (Suspected)",
      confidence: 0.91,
      bbox: { x: 0.55, y: 0.35, w: 0.08, h: 0.30 },
      color: "#ef4444",
      tracked: true,
      faceVisible: true,
      faceId: "UNK-0002",
      activity: "Approaching perimeter fence - ALERT",
    },
  ],

  // CAM-007: Emergency Exit C - Offline, no detections
  "cam-007": [],

  // CAM-008: Rooftop Array - Aerial view, HVAC equipment, parking lot in distance, no people
  "cam-008": [
    {
      id: "det-008-1",
      type: "equipment",
      label: "HVAC Unit",
      confidence: 0.97,
      bbox: { x: 0.30, y: 0.25, w: 0.20, h: 0.20 },
      color: "#64748b",
      tracked: false,
      faceVisible: false,
      activity: "Equipment - operational",
    },
    {
      id: "det-008-2",
      type: "vehicle",
      label: "Distant Vehicle (White SUV)",
      confidence: 0.72,
      bbox: { x: 0.68, y: 0.72, w: 0.08, h: 0.05 },
      color: "#06b6d4",
      tracked: true,
      faceVisible: false,
      vehicleType: "SUV",
      licensePlate: "LGA-519-FH",
      vehicleColor: "White",
      vehicleModel: "Toyota Highlander",
      crossCameraId: "veh-track-002", // Same SUV from cam-002, visible from rooftop
    },
  ],

  // CAM-009: Loading Bay - Delivery truck, two workers in vests, pallets
  "cam-009": [
    {
      id: "det-009-1",
      type: "vehicle",
      label: "Delivery Truck",
      confidence: 0.99,
      bbox: { x: 0.35, y: 0.20, w: 0.35, h: 0.45 },
      color: "#06b6d4",
      tracked: true,
      faceVisible: false,
      vehicleType: "Truck",
      licensePlate: "LAG-773-KD",
      vehicleColor: "Blue/White",
      vehicleModel: "Isuzu NPR",
      crossCameraId: "veh-track-004",
    },
    {
      id: "det-009-2",
      type: "person",
      label: "Warehouse Worker A",
      confidence: 0.95,
      bbox: { x: 0.22, y: 0.42, w: 0.07, h: 0.26 },
      color: "#3b82f6",
      tracked: false,
      faceVisible: true,
      faceId: "EMP-0445",
      activity: "Standing near loading dock",
    },
    {
      id: "det-009-3",
      type: "person",
      label: "Warehouse Worker B",
      confidence: 0.93,
      bbox: { x: 0.72, y: 0.45, w: 0.07, h: 0.24 },
      color: "#f59e0b",
      tracked: false,
      faceVisible: true,
      faceId: "EMP-0512",
      activity: "Handling cargo near truck",
    },
    {
      id: "det-009-4",
      type: "package",
      label: "Cargo Pallets",
      confidence: 0.96,
      bbox: { x: 0.12, y: 0.58, w: 0.15, h: 0.12 },
      color: "#64748b",
      tracked: false,
      faceVisible: false,
      activity: "Stacked on loading platform",
    },
  ],

  // CAM-010: Visitor Pavilion - Outdoor covered area with visitors, staff
  "cam-010": [
    {
      id: "det-010-1",
      type: "person",
      label: "Pavilion Staff A",
      confidence: 0.97,
      bbox: { x: 0.38, y: 0.25, w: 0.06, h: 0.22 },
      color: "#10b981",
      tracked: false,
      faceVisible: true,
      faceId: "EMP-0156",
      activity: "Standing at outdoor pavilion desk",
    },
    {
      id: "det-010-2",
      type: "person",
      label: "Pavilion Staff B",
      confidence: 0.95,
      bbox: { x: 0.48, y: 0.26, w: 0.06, h: 0.22 },
      color: "#10b981",
      tracked: false,
      faceVisible: true,
      faceId: "EMP-0178",
      activity: "Standing at outdoor pavilion desk",
    },
    {
      id: "det-010-3",
      type: "person",
      label: "Visitor A",
      confidence: 0.93,
      bbox: { x: 0.25, y: 0.50, w: 0.06, h: 0.20 },
      color: "#3b82f6",
      tracked: true,
      faceVisible: true,
      faceId: "VIS-0847", // Same visitor tracked from cam-002 -> cam-003 -> cam-010
      activity: "Seated under outdoor canopy",
    },
    {
      id: "det-010-4",
      type: "person",
      label: "Visitor B",
      confidence: 0.91,
      bbox: { x: 0.32, y: 0.52, w: 0.06, h: 0.19 },
      color: "#8b5cf6",
      tracked: true,
      faceVisible: true,
      faceId: "VIS-0848", // Same visitor tracked
      activity: "Seated under outdoor canopy",
    },
    {
      id: "det-010-5",
      type: "person",
      label: "Visitor C",
      confidence: 0.87,
      bbox: { x: 0.60, y: 0.50, w: 0.06, h: 0.20 },
      color: "#f59e0b",
      tracked: false,
      faceVisible: true,
      faceId: "VIS-0851",
      activity: "Standing on pathway near pavilion",
    },
  ],

  // CAM-011: Staff Quarters - Three people entering building, no vehicles
  "cam-011": [
    {
      id: "det-011-1",
      type: "person",
      label: "Staff Member A",
      confidence: 0.95,
      bbox: { x: 0.35, y: 0.35, w: 0.07, h: 0.28 },
      color: "#3b82f6",
      tracked: true,
      faceVisible: true,
      faceId: "EMP-0234",
      activity: "Entering annex building",
    },
    {
      id: "det-011-2",
      type: "person",
      label: "Staff Member B",
      confidence: 0.92,
      bbox: { x: 0.45, y: 0.38, w: 0.07, h: 0.26 },
      color: "#f59e0b",
      tracked: true,
      faceVisible: true,
      faceId: "EMP-0312",
      activity: "Entering annex building",
    },
    {
      id: "det-011-3",
      type: "person",
      label: "Staff Member C",
      confidence: 0.89,
      bbox: { x: 0.55, y: 0.40, w: 0.06, h: 0.24 },
      color: "#8b5cf6",
      tracked: false,
      faceVisible: true,
      faceId: "EMP-0445",
      activity: "Following group into building",
    },
  ],

  // CAM-012: Generator Yard - Outdoor utility area, maintenance technician, industrial equipment
  "cam-012": [
    {
      id: "det-012-1",
      type: "person",
      label: "Maintenance Technician",
      confidence: 0.96,
      bbox: { x: 0.50, y: 0.30, w: 0.08, h: 0.32 },
      color: "#3b82f6",
      tracked: false,
      faceVisible: true,
      faceId: "EMP-0512",
      activity: "Inspecting outdoor generator equipment",
    },
    {
      id: "det-012-2",
      type: "equipment",
      label: "Generator Unit A",
      confidence: 0.98,
      bbox: { x: 0.10, y: 0.18, w: 0.25, h: 0.50 },
      color: "#64748b",
      tracked: false,
      faceVisible: false,
      activity: "Equipment - operational",
    },
    {
      id: "det-012-3",
      type: "equipment",
      label: "Electrical Panel",
      confidence: 0.97,
      bbox: { x: 0.75, y: 0.15, w: 0.15, h: 0.40 },
      color: "#64748b",
      tracked: false,
      faceVisible: false,
      activity: "Equipment - nominal",
    },
  ],
}

// ====================================================================
// Cross-camera vehicle tracking records
// Tracks the same vehicle as it moves between camera views
// ====================================================================

export const vehicleTrackingRecords: VehicleTrackingRecord[] = [
  {
    crossCameraId: "veh-track-001",
    licensePlate: "ABJ-284-KW",
    vehicleType: "Sedan",
    vehicleColor: "Black",
    vehicleModel: "Toyota Camry",
    firstSeen: { cameraId: "cam-001", timestamp: "2026-02-06T13:58:00Z" },
    lastSeen: { cameraId: "cam-002", timestamp: "2026-02-06T14:05:00Z" },
    sightings: [
      {
        cameraId: "cam-001",
        cameraName: "Main Gate A",
        timestamp: "2026-02-06T13:58:00Z",
        confidence: 0.97,
        bbox: { x: 0.55, y: 0.50, w: 0.25, h: 0.22 },
        direction: "Entering compound via main gate",
      },
      {
        cameraId: "cam-002",
        cameraName: "Parking Lot B",
        timestamp: "2026-02-06T14:05:00Z",
        confidence: 0.95,
        bbox: { x: 0.08, y: 0.52, w: 0.18, h: 0.18 },
        direction: "Parked in designated bay",
      },
    ],
    status: "active",
    riskLevel: "low",
    notes: "Official vehicle, cleared at gate checkpoint",
  },
  {
    crossCameraId: "veh-track-002",
    licensePlate: "LGA-519-FH",
    vehicleType: "SUV",
    vehicleColor: "White",
    vehicleModel: "Toyota Highlander",
    firstSeen: { cameraId: "cam-002", timestamp: "2026-02-06T14:52:00Z" },
    lastSeen: { cameraId: "cam-008", timestamp: "2026-02-06T14:55:00Z" },
    sightings: [
      {
        cameraId: "cam-002",
        cameraName: "Parking Lot B",
        timestamp: "2026-02-06T14:52:00Z",
        confidence: 0.98,
        bbox: { x: 0.40, y: 0.38, w: 0.22, h: 0.26 },
        direction: "Pulling into parking space",
      },
      {
        cameraId: "cam-008",
        cameraName: "Rooftop Array",
        timestamp: "2026-02-06T14:55:00Z",
        confidence: 0.72,
        bbox: { x: 0.68, y: 0.72, w: 0.08, h: 0.05 },
        direction: "Visible from rooftop - parked in lot",
      },
    ],
    status: "active",
    riskLevel: "low",
    notes: "Visitor vehicle, occupants checked in at reception",
  },
  {
    crossCameraId: "veh-track-003",
    licensePlate: "KAN-802-GJ",
    vehicleType: "Hatchback",
    vehicleColor: "Silver",
    vehicleModel: "Honda Fit",
    firstSeen: { cameraId: "cam-001", timestamp: "2026-02-06T11:20:00Z" },
    lastSeen: { cameraId: "cam-002", timestamp: "2026-02-06T11:25:00Z" },
    sightings: [
      {
        cameraId: "cam-001",
        cameraName: "Main Gate A",
        timestamp: "2026-02-06T11:20:00Z",
        confidence: 0.93,
        bbox: { x: 0.50, y: 0.48, w: 0.22, h: 0.20 },
        direction: "Entered via main gate",
      },
      {
        cameraId: "cam-002",
        cameraName: "Parking Lot B",
        timestamp: "2026-02-06T11:25:00Z",
        confidence: 0.90,
        bbox: { x: 0.70, y: 0.55, w: 0.16, h: 0.16 },
        direction: "Parked in east row",
      },
    ],
    status: "active",
    riskLevel: "low",
    notes: "Staff vehicle - morning arrival",
  },
  {
    crossCameraId: "veh-track-004",
    licensePlate: "LAG-773-KD",
    vehicleType: "Truck",
    vehicleColor: "Blue/White",
    vehicleModel: "Isuzu NPR",
    firstSeen: { cameraId: "cam-001", timestamp: "2026-02-06T10:00:00Z" },
    lastSeen: { cameraId: "cam-009", timestamp: "2026-02-06T14:35:00Z" },
    sightings: [
      {
        cameraId: "cam-001",
        cameraName: "Main Gate A",
        timestamp: "2026-02-06T10:00:00Z",
        confidence: 0.96,
        bbox: { x: 0.45, y: 0.42, w: 0.30, h: 0.30 },
        direction: "Delivery truck entering compound",
      },
      {
        cameraId: "cam-009",
        cameraName: "Loading Bay",
        timestamp: "2026-02-06T10:15:00Z",
        confidence: 0.99,
        bbox: { x: 0.35, y: 0.20, w: 0.35, h: 0.45 },
        direction: "Backed up to loading dock",
      },
      {
        cameraId: "cam-009",
        cameraName: "Loading Bay",
        timestamp: "2026-02-06T14:35:00Z",
        confidence: 0.99,
        bbox: { x: 0.35, y: 0.20, w: 0.35, h: 0.45 },
        direction: "Still at loading dock - unloading",
      },
    ],
    status: "active",
    riskLevel: "low",
    notes: "Scheduled delivery - PO #DLV-2026-0184",
  },
  {
    crossCameraId: "veh-track-005",
    licensePlate: "UNK-PLATE",
    vehicleType: "Van",
    vehicleColor: "Dark Gray",
    vehicleModel: "Unknown",
    firstSeen: { cameraId: "cam-001", timestamp: "2026-02-06T12:15:00Z" },
    lastSeen: { cameraId: "cam-001", timestamp: "2026-02-06T12:15:00Z" },
    sightings: [
      {
        cameraId: "cam-001",
        cameraName: "Main Gate A",
        timestamp: "2026-02-06T12:15:00Z",
        confidence: 0.78,
        bbox: { x: 0.60, y: 0.52, w: 0.22, h: 0.24 },
        direction: "Approached gate but did not enter - turned away",
      },
    ],
    status: "flagged",
    riskLevel: "high",
    notes: "FLAGGED: Vehicle approached gate and turned away without stopping. License plate partially obscured. Under review.",
  },
]

// ====================================================================
// Face tracking records (cross-camera person tracking)
// ====================================================================

export const faceTrackingRecords: FaceTrackingRecord[] = [
  {
    faceId: "VIS-0847",
    label: "Visitor A",
    type: "visitor",
    sightings: [
      { cameraId: "cam-002", cameraName: "Parking Lot B", timestamp: "2026-02-06T14:10:00Z", confidence: 0.91, activity: "Walking between parked cars" },
      { cameraId: "cam-003", cameraName: "Lobby Central", timestamp: "2026-02-06T14:15:00Z", confidence: 0.94, activity: "Checking in at reception" },
      { cameraId: "cam-010", cameraName: "Reception Hall", timestamp: "2026-02-06T14:20:00Z", confidence: 0.93, activity: "Seated in waiting area" },
    ],
    status: "active",
  },
  {
    faceId: "VIS-0848",
    label: "Visitor B",
    type: "visitor",
    sightings: [
      { cameraId: "cam-002", cameraName: "Parking Lot B", timestamp: "2026-02-06T14:10:00Z", confidence: 0.88, activity: "Walking between parked cars" },
      { cameraId: "cam-003", cameraName: "Lobby Central", timestamp: "2026-02-06T14:16:00Z", confidence: 0.92, activity: "Waiting at reception" },
      { cameraId: "cam-010", cameraName: "Reception Hall", timestamp: "2026-02-06T14:22:00Z", confidence: 0.91, activity: "Seated in waiting area" },
    ],
    status: "active",
  },
  {
    faceId: "EMP-0234",
    label: "Staff - Operations",
    type: "staff",
    sightings: [
      { cameraId: "cam-003", cameraName: "Lobby Central", timestamp: "2026-02-06T13:40:00Z", confidence: 0.89, activity: "Walking through lobby" },
      { cameraId: "cam-011", cameraName: "Staff Quarters", timestamp: "2026-02-06T14:45:00Z", confidence: 0.95, activity: "Entering annex building" },
    ],
    status: "active",
  },
  {
    faceId: "EMP-0312",
    label: "Staff - Security",
    type: "staff",
    sightings: [
      { cameraId: "cam-001", cameraName: "Main Gate A", timestamp: "2026-02-06T14:45:00Z", confidence: 0.96, activity: "Walking through gate checkpoint" },
      { cameraId: "cam-011", cameraName: "Staff Quarters", timestamp: "2026-02-06T14:50:00Z", confidence: 0.92, activity: "Entering annex building" },
    ],
    status: "active",
  },
  {
    faceId: "EMP-0512",
    label: "Maintenance Tech",
    type: "staff",
    sightings: [
      { cameraId: "cam-009", cameraName: "Loading Bay", timestamp: "2026-02-06T13:50:00Z", confidence: 0.93, activity: "Handling cargo near truck" },
      { cameraId: "cam-012", cameraName: "Generator Room", timestamp: "2026-02-06T14:20:00Z", confidence: 0.96, activity: "Inspecting generator equipment" },
    ],
    status: "active",
  },
  {
    faceId: "UNK-0001",
    label: "Unknown Individual",
    type: "flagged",
    sightings: [
      { cameraId: "cam-005", cameraName: "Server Room", timestamp: "2026-02-06T14:25:00Z", confidence: 0.94, activity: "Accessing server rack - UNAUTHORIZED" },
    ],
    status: "monitoring",
  },
  {
    faceId: "UNK-0002",
    label: "Suspected Intruder",
    type: "flagged",
    sightings: [
      { cameraId: "cam-006", cameraName: "Perimeter South", timestamp: "2026-02-06T12:30:00Z", confidence: 0.91, activity: "Approaching perimeter fence" },
    ],
    status: "monitoring",
  },
]

// ====================================================================
// Utility functions
// ====================================================================

export function getCamerasWithVehicles(): string[] {
  return Object.entries(cameraDetections)
    .filter(([_, detections]) => detections.some((d) => d.type === "vehicle"))
    .map(([camId]) => camId)
}

export function getCamerasWithoutVehicles(): string[] {
  return Object.entries(cameraDetections)
    .filter(([_, detections]) => !detections.some((d) => d.type === "vehicle"))
    .map(([camId]) => camId)
}

export function getVehicleTrackByCrossId(crossCameraId: string): VehicleTrackingRecord | undefined {
  return vehicleTrackingRecords.find((r) => r.crossCameraId === crossCameraId)
}

export function getVehicleSightingsForCamera(cameraId: string): VehicleTrackingRecord[] {
  return vehicleTrackingRecords.filter((r) =>
    r.sightings.some((s) => s.cameraId === cameraId)
  )
}

export function getFaceTrackRecord(faceId: string): FaceTrackingRecord | undefined {
  return faceTrackingRecords.find((r) => r.faceId === faceId)
}

export function getCameraDetectionSummary(cameraId: string) {
  const detections = cameraDetections[cameraId] || []
  return {
    total: detections.length,
    persons: detections.filter((d) => d.type === "person").length,
    vehicles: detections.filter((d) => d.type === "vehicle").length,
    packages: detections.filter((d) => d.type === "package").length,
    equipment: detections.filter((d) => d.type === "equipment").length,
    trackedFaces: detections.filter((d) => d.faceVisible && d.faceId).length,
    hasVehicles: detections.some((d) => d.type === "vehicle"),
    flaggedObjects: detections.filter((d) => d.activity?.includes("FLAGGED") || d.activity?.includes("ALERT")).length,
  }
}
