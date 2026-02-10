"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info, FileText, Download, Copy, AlertCircle } from "lucide-react"

export function CamsReportGuide() {
  const [copied, setCopied] = useState(false)

  const exampleReport = {
    generatedAt: new Date().toISOString(),
    reportedBy: "madeena.umar@civicwatch.ng",
    facility: "CivicWatch NG - Main Facility",
    exportFormats: ["JSON", "CSV", "Email Format"],
    keyMetrics: [
      "Total activity events per camera",
      "Detection confidence scores",
      "Incident severity and type",
      "Person entry/exit counts",
      "Vehicle detection counts",
      "Anomaly/intrusion alerts",
      "Face match results",
      "System event logs",
    ],
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 shrink-0 text-primary mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-2">CAMs Activity Report Guide</h3>
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              The CAMs (Comprehensive Activity Monitoring System) Report provides a detailed breakdown of surveillance activity across all cameras and entrance points.
            </p>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="font-medium text-foreground mb-2">Report Includes:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {exampleReport.keyMetrics.map((metric) => (
                  <li key={metric}>{metric}</li>
                ))}
              </ul>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="font-medium text-foreground mb-2">Export Formats:</p>
              <div className="flex flex-wrap gap-2">
                {exampleReport.exportFormats.map((format) => (
                  <Badge key={format} variant="outline">
                    {format}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="font-medium text-foreground mb-2">How to Share:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Generate the report by navigating to Investigation → CAMs Report</li>
                <li>Select desired zone or view all zones</li>
                <li>Click Share and choose format (Link, Email, JSON)</li>
                <li>Send to video generation or analysis team</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CamsReportSummary() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-foreground">Report Structure</span>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Camera-by-camera breakdown with activity metrics, incidents, and detection details
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="flex items-center gap-2 mb-2">
          <Download className="h-4 w-4 text-sky-400" />
          <span className="text-xs font-medium text-foreground">Export Options</span>
        </div>
        <p className="text-[10px] text-muted-foreground">
          JSON for APIs, CSV for spreadsheets, Email for teams
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-medium text-foreground">Send to Video Gen</span>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Share JSON report with video generation team for compiled footage
        </p>
      </div>
    </div>
  )
}
