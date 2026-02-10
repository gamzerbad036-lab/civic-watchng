"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { auditLogs } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  FileText,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const resultConfig = {
  success: { label: "Success", color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400", icon: CheckCircle2 },
  denied: { label: "Denied", color: "border-red-500/30 bg-red-500/10 text-red-400", icon: XCircle },
  expired: { label: "Expired", color: "border-muted-foreground/30 bg-muted/50 text-muted-foreground", icon: Clock },
}

const modeLabels: Record<string, string> = {
  monitoring: "Monitoring",
  investigation: "Investigation",
  "authorized-reveal": "Auth. Reveal",
  audit: "Audit",
  emergency: "Emergency",
}

export function AuditLogPanel() {
  const [searchQuery, setSearchQuery] = useState("")
  const [resultFilter, setResultFilter] = useState<string>("all")

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.caseId && log.caseId.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesResult = resultFilter === "all" || log.result === resultFilter

    return matchesSearch && matchesResult
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">
            Immutable record of all system actions and access events
          </p>
        </div>
        <Button variant="outline" className="gap-2 border-border text-foreground bg-transparent">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Integrity Banner */}
      <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <Shield className="h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-xs font-medium text-primary">Log Integrity Verified</p>
          <p className="text-[11px] text-muted-foreground">
            Audit logs are cryptographically signed and tamper-proof. No entries can be modified or deleted.
          </p>
        </div>
        <Badge variant="outline" className="ml-auto shrink-0 gap-1 border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
          <Lock className="h-2.5 w-2.5" /> Immutable
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search actions, users, case IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card border-border pl-10 text-sm"
          />
        </div>
        <Select value={resultFilter} onValueChange={setResultFilter}>
          <SelectTrigger className="w-40 bg-card border-border text-sm">
            <SelectValue placeholder="All Results" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Log Table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="text-xs font-semibold text-muted-foreground">Timestamp</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Action</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">User</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Mode</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Case ID</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">IP Address</TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => {
              const config = resultConfig[log.result]
              const ResultIcon = config.icon
              return (
                <TableRow key={log.id} className="border-border hover:bg-secondary/30">
                  <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <div>
                        <span className="text-xs font-medium text-foreground">{log.action}</span>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[250px]">
                          {log.details}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.user}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded",
                      log.mode === "emergency" ? "bg-red-500/10 text-red-400" :
                      log.mode === "authorized-reveal" ? "bg-amber-500/10 text-amber-400" :
                      log.mode === "investigation" ? "bg-sky-500/10 text-sky-400" :
                      "bg-secondary text-muted-foreground"
                    )}>
                      {modeLabels[log.mode]}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {log.caseId || "---"}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {log.ipAddress}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("gap-1 px-1.5 py-0 text-[10px]", config.color)}>
                      <ResultIcon className="h-2.5 w-2.5" /> {config.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
        <span className="text-xs text-muted-foreground">
          Showing {filteredLogs.length} of {auditLogs.length} log entries
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-muted-foreground">
              {auditLogs.filter((l) => l.result === "success").length} Success
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-[10px] text-muted-foreground">
              {auditLogs.filter((l) => l.result === "denied").length} Denied
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              {auditLogs.filter((l) => l.result === "expired").length} Expired
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
