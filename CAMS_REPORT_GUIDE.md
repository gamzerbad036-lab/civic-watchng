# CAMs Activity Report System

## Overview

The **CAMs (Comprehensive Activity Monitoring System) Activity Report** is a surveillance system feature that provides detailed, per-camera activity logs across all entrance points and floors of the facility. This report is designed to be shared with video generation teams, analysts, and other stakeholders.

## Report Features

### 1. **Per-Camera Breakdown**
Each camera location shows:
- **Camera ID & Location**: Unique identifier and physical location (e.g., "Main Gate A - North Entrance")
- **Status**: Online, Offline, or Maintenance mode
- **Activity Count**: Total number of detection events in the monitoring period
- **Activity Types**:
  - **Person Detection**: Entry/exit counts with confidence scores
  - **Vehicle Detection**: Vehicle passage tracking
  - **Package Detection**: Delivery/package events
  - **Anomalies**: Unusual activity patterns
  - **System Events**: Camera maintenance, feed issues, etc.
  - **Intrusions**: Security boundary violations
  
- **Confidence Metrics**: Average detection confidence (0-100%)
- **Incidents**: All alerts associated with each camera (severity, type, status)

### 2. **Activity Types & Signals**

#### Person Entry/Exit
```json
{
  "type": "person_entry",
  "description": "Staff member entered via main gate",
  "confidence": 98,
  "timestamp": "2026-02-06T14:45:00Z"
}
```

#### Vehicle Detection
```json
{
  "type": "vehicle",
  "description": "Official vehicle passed through checkpoint",
  "confidence": 99,
  "timestamp": "2026-02-06T13:58:00Z"
}
```

#### Package Tracking
```json
{
  "type": "package",
  "description": "Package delivered to main reception",
  "confidence": 93,
  "timestamp": "2026-02-06T14:15:00Z"
}
```

#### Anomaly Detection
```json
{
  "type": "anomaly",
  "description": "Unusual loitering detected - cleared after 2 minutes",
  "confidence": 92,
  "timestamp": "2026-02-06T12:30:00Z"
}
```

#### System Events
```json
{
  "type": "system_event",
  "description": "Camera maintenance mode - live feed unavailable",
  "confidence": 100,
  "timestamp": "2026-02-06T14:30:00Z"
}
```

### 3. **Report Data Structure**

```json
{
  "generatedAt": "2026-02-06T15:00:00Z",
  "reportedBy": "madeena.umar@civicwatch.ng",
  "facility": "CivicWatch NG - Main Facility",
  "period": "2026-02-06 (24 hours)",
  "summary": {
    "totalCameras": 12,
    "onlineCameras": 11,
    "totalActivity": 247,
    "totalIncidents": 6,
    "criticalAlerts": 1
  },
  "cameras": [
    {
      "id": "cam-001",
      "name": "Main Gate A",
      "location": "North Entrance",
      "zone": "Zone A",
      "status": "online",
      "activity": {
        "totalEvents": 28,
        "breakdown": {
          "person_entry": 8,
          "person_exit": 6,
          "vehicle": 3,
          "anomaly": 1
        },
        "averageConfidence": 96,
        "totalPersonDetections": 14,
        "totalVehicleDetections": 3,
        "totalAnomalies": 1
      },
      "incidents": [
        {
          "id": "inc-001",
          "type": "motion",
          "severity": "low",
          "description": "Unusual motion detected near entrance after hours"
        }
      ],
      "recentActivity": [
        {
          "timestamp": "2026-02-06T14:45:00Z",
          "type": "person_entry",
          "description": "Staff member entered via main gate",
          "confidence": 98,
          "personCount": 1
        }
      ]
    }
  ]
}
```

## Export Formats

### 1. **JSON Export**
- **Use Case**: API integration, automated processing
- **File Extension**: `.json`
- **Encoding**: UTF-8
- **Compression**: Not compressed (full data)
- **Ideal For**: Sending to video generation APIs, data pipelines, analysis systems

```bash
# Example filename
cams-report-2026-02-06.json
```

### 2. **CSV Export**
- **Use Case**: Spreadsheet analysis, reports
- **File Extension**: `.csv`
- **Format**: Standard CSV with headers
- **Ideal For**: Analysts, compliance documentation, manual review

```
Camera ID,Name,Location,Zone,Status,Events,Persons,Vehicles,Anomalies,Avg Confidence
cam-001,Main Gate A,North Entrance,Zone A,online,28,14,3,1,96%
```

### 3. **Email Format**
- **Use Case**: Direct sharing via email
- **Format**: Plain text, formatted for readability
- **Ideal For**: Team notifications, incident summaries

## Sharing the Report

### Method 1: **Direct Download**
- Click "JSON Export" or "CSV Export" button
- File downloads directly to your device
- Send file to video generation team via secure channel

### Method 2: **Shareable Link**
- Click "Share" → "Copy Shareable Link"
- URL-encoded report data embedded in link
- Recipients can view report by accessing the link
- Limited to shorter reports (URL length limitations)

### Method 3: **Email Format**
- Click "Share" → "Copy for Email"
- Formatted plain text copied to clipboard
- Paste into email body and send
- Readable by any email client

### Method 4: **JSON Copy**
- Click "Share" → "Copy as JSON"
- Full JSON copied to clipboard
- Paste into chat, collaboration tools, or email
- Perfect for team communication platforms

## Using with Video Generation Services

The report is formatted for easy integration with external video generation services:

### Step 1: Export Report
```
1. Navigate to Investigation → CAMs Report
2. Select desired zone or all cameras
3. Click "JSON Export"
4. Save file (e.g., cams-report-2026-02-06.json)
```

### Step 2: Send to Video Generation Team
```
Email the JSON file to video generation service with instructions:
- Include specific cameras/zones of interest
- Specify time range
- Request concatenated video output
- Note any specific incidents to highlight
```

### Step 3: Video Generation Response
The external service will:
- Parse the CAMs report JSON
- Identify specific timestamps and camera IDs
- Pull raw footage from archive
- Generate compiled video with incident markers
- Return edited video file

## Cameras & Locations Reference

| Camera ID | Name | Location | Zone | Type |
|-----------|------|----------|------|------|
| cam-001 | Main Gate A | North Entrance | Zone A | Entrance |
| cam-002 | Parking Lot B | East Wing | Zone A | Parking |
| cam-003 | Lobby Central | Main Building | Zone B | Entrance Hall |
| cam-004 | Corridor L2 | Second Floor | Zone B | Interior |
| cam-005 | Server Room | Basement | Zone C | Restricted |
| cam-006 | Perimeter South | South Fence | Zone C | Perimeter |
| cam-007 | Emergency Exit C | West Wing | Zone D | Emergency |
| cam-008 | Rooftop Array | Building Top | Zone D | Perimeter |
| cam-009 | Loading Bay | Rear Entrance | Zone A | Entrance |
| cam-010 | Reception Hall | Ground Floor | Zone B | Entrance Hall |
| cam-011 | Staff Quarters | Annex Building | Zone C | Residential |
| cam-012 | Generator Room | Utility Block | Zone D | Utility |

## Activity Metrics Reference

### Confidence Scores
- **90-100%**: High confidence, reliable detection
- **70-89%**: Medium confidence, generally reliable
- **50-69%**: Lower confidence, may require review
- **Below 50%**: Low confidence, likely false positive

### Activity Breakdown
- **Person Entry**: Individual entering a monitored area
- **Person Exit**: Individual leaving a monitored area
- **Vehicle**: Vehicle passage through monitored zone
- **Package**: Packages/deliveries detected
- **Anomaly**: Unusual behavior or pattern
- **System Event**: Camera or infrastructure event
- **Intrusion**: Security boundary violation

### Incident Severity
- **Low**: Minor activity, no immediate action required
- **Medium**: Noteworthy event, review recommended
- **High**: Significant incident, attention required
- **Critical**: Security threat, immediate action needed

## Privacy & Compliance

All CAMs reports:
- Are encrypted in transit
- Contain timestamp metadata
- Track report generation and access
- Are subject to audit logs
- Comply with NDPR and GDPR requirements
- Include privacy protection indicators

## Support

For questions about the CAMs Activity Report system:
- Contact: madeena.umar@civicwatch.ng
- System: CivicWatch NG - Main Facility
- Version: 1.0
- Last Updated: 2026-02-06
