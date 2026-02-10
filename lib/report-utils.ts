// Utility to generate shareable report links and formats
import type { CameraReport } from "@/lib/types"
import { cameras, incidents, cameraActivities } from "@/lib/mock-data"

export function generateCameraReport(cameraIds?: string[]): CameraReport[] {
  const targetCameras = cameraIds ? cameras.filter(c => cameraIds.includes(c.id)) : cameras

  return targetCameras.map((camera) => {
    const cameraIncidents = incidents.filter((i) => i.cameraId === camera.id)
    const activity = cameraActivities[camera.id] || []

    const personActivities = activity.filter(
      (a) => a.type === "person_entry" || a.type === "person_exit"
    )
    const vehicleActivities = activity.filter((a) => a.type === "vehicle")

    return {
      camera,
      totalActivity: activity.length,
      activeDetections: activity.filter((a) => a.type === "anomaly" || a.type === "intrusion").length,
      incidents: cameraIncidents,
      activity,
      dailyPeakTime: activity.length > 0 ? "14:00-15:00" : "N/A",
      averagePersonsPerHour: Math.round(personActivities.length / 24),
      lastIncident: cameraIncidents[0],
    }
  })
}

export function generateShareableLink(reportData: any): string {
  const encoded = btoa(JSON.stringify(reportData))
  return `${window.location.origin}?report=${encoded}`
}

export function generateEmailReport(reportData: any): string {
  const timestamp = new Date().toLocaleString()
  const body = `
CAMs Activity Report
Generated: ${timestamp}
Reported by: madeena.umar@civicwatch.ng

SUMMARY:
- Total Cameras: ${reportData.summary?.totalCameras || 0}
- Online Cameras: ${reportData.summary?.onlineCameras || 0}
- Total Activity Events: ${reportData.summary?.totalActivity || 0}
- Total Incidents: ${reportData.summary?.totalIncidents || 0}
- Critical Alerts: ${reportData.summary?.criticalAlerts || 0}

${reportData.cameras?.map((cam: any) => `
CAMERA: ${cam.name} (${cam.id})
Location: ${cam.location} | Zone: ${cam.zone}
Status: ${cam.status}
Activity Events: ${cam.activity?.totalEvents || 0}
- Persons: ${cam.activity?.totalPersonDetections || 0}
- Vehicles: ${cam.activity?.totalVehicleDetections || 0}
- Anomalies: ${cam.activity?.totalAnomalies || 0}
Confidence: ${cam.activity?.averageConfidence || 0}%
Incidents: ${cam.incidents?.length || 0}
`).join("\n")}

This is a classified report. Handle with appropriate confidentiality.
`
  return body
}

export function copyReportToClipboard(format: "json" | "csv" | "email", reportData: any): boolean {
  try {
    let content = ""
    if (format === "json") {
      content = JSON.stringify(reportData, null, 2)
    } else if (format === "csv") {
      content = generateCSVReport(reportData)
    } else if (format === "email") {
      content = generateEmailReport(reportData)
    }

    navigator.clipboard.writeText(content)
    return true
  } catch (error) {
    console.error("Failed to copy to clipboard:", error)
    return false
  }
}

function generateCSVReport(reportData: any): string {
  let csv = "CAMS Activity Report\n"
  csv += `Generated,${new Date().toISOString()}\n`
  csv += `Reported By,madeena.umar@civicwatch.ng\n\n`
  csv += "SUMMARY\n"
  csv += `Total Cameras,${reportData.summary?.totalCameras || 0}\n`
  csv += `Online Cameras,${reportData.summary?.onlineCameras || 0}\n`
  csv += `Total Activity,${reportData.summary?.totalActivity || 0}\n`
  csv += `Total Incidents,${reportData.summary?.totalIncidents || 0}\n\n`
  csv += "CAMERA DETAILS\n"
  csv += "Camera ID,Name,Location,Zone,Status,Events,Persons,Vehicles,Anomalies,Confidence\n"

  reportData.cameras?.forEach((cam: any) => {
    csv += `${cam.id},"${cam.name}","${cam.location}",${cam.zone},${cam.status},${cam.activity?.totalEvents || 0},${cam.activity?.totalPersonDetections || 0},${cam.activity?.totalVehicleDetections || 0},${cam.activity?.totalAnomalies || 0},${cam.activity?.averageConfidence || 0}%\n`
  })

  return csv
}
