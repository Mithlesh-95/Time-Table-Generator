"use client"

import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
} from "@mui/material"
import type { ReportConfig, ReportData } from "@/types/reports"

interface ReportPreviewProps {
  config: ReportConfig
  data: ReportData
}

export default function ReportPreview({ config, data }: ReportPreviewProps) {
  const getFilteredData = () => {
    switch (config.type) {
      case "timetable-summary":
        return data.timetables.filter((item) => {
          const semesterMatch = config.filters.semester.length === 0 || config.filters.semester.includes(item.semester)
          const branchMatch = config.filters.branch.length === 0 || config.filters.branch.includes(item.branch)
          const sectionMatch = config.filters.section.length === 0 || config.filters.section.includes(item.section)

          return semesterMatch && branchMatch && sectionMatch
        })

      case "teacher-workload":
        return data.teachers

      case "room-utilization":
        return data.rooms

      default:
        return []
    }
  }

  const renderTableHeaders = () => {
    return config.fields.map((field) => (
      <TableCell key={field} sx={{ fontWeight: "bold" }}>
        {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}
      </TableCell>
    ))
  }

  const renderTableRows = () => {
    const filteredData = getFilteredData()

    return filteredData.map((item: any, index) => (
      <TableRow key={index} hover>
        {config.fields.map((field) => (
          <TableCell key={field}>{renderCellContent(item[field], field)}</TableCell>
        ))}
      </TableRow>
    ))
  }

  const renderCellContent = (value: any, field: string) => {
    if (field === "status") {
      const statusColors = {
        active: "success",
        draft: "warning",
        archived: "default",
      } as const

      return <Chip label={value} color={statusColors[value as keyof typeof statusColors] || "default"} size="small" />
    }

    if (field === "utilization") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LinearProgress variant="determinate" value={value} sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} />
          <Typography variant="caption">{value}%</Typography>
        </Box>
      )
    }

    if (field === "subjects" && Array.isArray(value)) {
      return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {value.map((subject, idx) => (
            <Chip key={idx} label={subject} size="small" variant="outlined" />
          ))}
        </Box>
      )
    }

    if (field === "generatedDate") {
      return new Date(value).toLocaleDateString()
    }

    return value
  }

  const getReportTitle = () => {
    const titles = {
      "timetable-summary": "Timetable Summary Report",
      "teacher-workload": "Teacher Workload Analysis",
      "room-utilization": "Room Utilization Report",
      "conflict-analysis": "Conflict Analysis Report",
    }
    return titles[config.type]
  }

  const filteredData = getFilteredData()

  return (
    <Card>
      <CardHeader title={getReportTitle()} subheader={`${filteredData.length} records found`} />
      <CardContent>
        {filteredData.length === 0 ? (
          <Alert severity="info">No data matches the current filters. Try adjusting your filter criteria.</Alert>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: "60vh" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>{renderTableHeaders()}</TableRow>
              </TableHead>
              <TableBody>{renderTableRows()}</TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Report Summary */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Report Summary
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <Typography variant="body2">
              <strong>Total Records:</strong> {filteredData.length}
            </Typography>
            <Typography variant="body2">
              <strong>Generated:</strong> {new Date().toLocaleString()}
            </Typography>
            <Typography variant="body2">
              <strong>Type:</strong> {getReportTitle()}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
