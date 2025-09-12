"use client"

import { Box, Typography, Paper } from "@mui/material"
import ReportBuilder from "@/components/reports/ReportBuilder"
import ReportPreview from "@/components/reports/ReportPreview"
import ReportTemplates from "@/components/reports/ReportTemplates"
import { useState } from "react"
import type { ReportConfig, ReportData } from "@/types/reports"

export default function Reports() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [config, setConfig] = useState<ReportConfig>({
    type: "timetable-summary",
    filters: {
      semester: [],
      branch: [],
      section: [],
      dateRange: { start: null, end: null },
    },
    fields: ["semester", "branch", "section", "status", "utilization"],
    sortBy: "utilization",
    sortOrder: "desc",
  })

  const [data] = useState<ReportData>({
    timetables: [
      {
        id: "1",
        semester: "5",
        branch: "Computer Science",
        section: "A",
        generatedDate: new Date().toISOString(),
        status: "active",
        totalPeriods: 36,
        utilization: 78,
      },
      {
        id: "2",
        semester: "3",
        branch: "Information Technology",
        section: "B",
        generatedDate: new Date().toISOString(),
        status: "draft",
        totalPeriods: 36,
        utilization: 64,
      },
    ],
    teachers: [
      { id: "t1", name: "Dr. Smith", department: "CSE", totalHours: 18, subjects: ["DSA", "OS"] },
      { id: "t2", name: "Prof. Lee", department: "IT", totalHours: 12, subjects: ["DBMS"] },
    ],
    rooms: [
      { id: "r1", number: "A-101", type: "Lecture Hall", capacity: 60, utilization: 72 },
      { id: "r2", number: "Lab-3", type: "Computer Lab", capacity: 30, utilization: 85 },
    ],
  })

  const handleConfigChange = (partial: Partial<ReportConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial, filters: { ...prev.filters, ...(partial as any).filters } }))
  }

  const handleExport = (format: "pdf" | "excel" | "csv") => {
    console.log("Exporting report as", format)
  }

  const handlePrint = () => {
    console.log("Printing report")
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Reports
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
        <Paper sx={{ p: 2 }}>
          <ReportTemplates
            selectedTemplate={selectedTemplate}
            onTemplateSelect={setSelectedTemplate}
            onConfigChange={handleConfigChange}
          />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <ReportBuilder config={config} onConfigChange={handleConfigChange} onExport={handleExport} onPrint={handlePrint} />
        </Paper>
        <Paper sx={{ p: 2 }}>
          <ReportPreview config={config} data={data} />
        </Paper>
      </Box>
    </Box>
  )
}
