"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  FormControlLabel,
  Checkbox,
  FormGroup,
  ButtonGroup,
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import TableViewIcon from "@mui/icons-material/TableView"
import PrintIcon from "@mui/icons-material/Print"
import SearchIcon from "@mui/icons-material/Search"
import type { ReportConfig } from "@/types/reports"

interface ReportBuilderProps {
  config: ReportConfig
  onConfigChange: (config: Partial<ReportConfig>) => void
  onExport: (format: "pdf" | "excel" | "csv") => void
  onPrint: () => void
}

const reportTypes = [
  { value: "timetable-summary", label: "Timetable Summary" },
  { value: "teacher-workload", label: "Teacher Workload Analysis" },
  { value: "room-utilization", label: "Room Utilization Report" },
  { value: "conflict-analysis", label: "Conflict Analysis" },
]

const availableFields = {
  "timetable-summary": [
    { value: "semester", label: "Semester" },
    { value: "branch", label: "Branch" },
    { value: "section", label: "Section" },
    { value: "generatedDate", label: "Generated Date" },
    { value: "status", label: "Status" },
    { value: "utilization", label: "Utilization %" },
  ],
  "teacher-workload": [
    { value: "name", label: "Teacher Name" },
    { value: "department", label: "Department" },
    { value: "totalHours", label: "Total Hours" },
    { value: "subjects", label: "Subjects" },
  ],
  "room-utilization": [
    { value: "number", label: "Room Number" },
    { value: "type", label: "Room Type" },
    { value: "capacity", label: "Capacity" },
    { value: "utilization", label: "Utilization %" },
  ],
  "conflict-analysis": [
    { value: "type", label: "Conflict Type" },
    { value: "severity", label: "Severity" },
    { value: "affected", label: "Affected Items" },
    { value: "suggestions", label: "Suggestions" },
  ],
}

const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"]
const branches = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil"]
const sections = ["A", "B", "C", "D"]

export default function ReportBuilder({ config, onConfigChange, onExport, onPrint }: ReportBuilderProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const handleFilterChange = (filterType: keyof ReportConfig["filters"], value: any) => {
    onConfigChange({
      filters: {
        ...config.filters,
        [filterType]: value,
      },
    })
  }

  const handleFieldToggle = (field: string) => {
    const newFields = config.fields.includes(field)
      ? config.fields.filter((f) => f !== field)
      : [...config.fields, field]

    onConfigChange({ fields: newFields })
  }

  const currentFields = availableFields[config.type] || []

  return (
    <Card>
      <CardHeader title="Report Builder" subheader="Customize your report parameters" />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Report Type */}
          <FormControl fullWidth>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={config.type}
              label="Report Type"
              onChange={(e) => onConfigChange({ type: e.target.value as ReportConfig["type"] })}
            >
              {reportTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider />

          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search in results..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
            }}
          />

          {/* Filters */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Filters
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Semester</InputLabel>
                <Select
                  multiple
                  value={config.filters.semester}
                  label="Semester"
                  onChange={(e) => handleFilterChange("semester", e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={`Sem ${value}`} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {semesters.map((sem) => (
                    <MenuItem key={sem} value={sem}>
                      Semester {sem}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Branch</InputLabel>
                <Select
                  multiple
                  value={config.filters.branch}
                  label="Branch"
                  onChange={(e) => handleFilterChange("branch", e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch} value={branch}>
                      {branch}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Section</InputLabel>
                <Select
                  multiple
                  value={config.filters.section}
                  label="Section"
                  onChange={(e) => handleFilterChange("section", e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={`Sec ${value}`} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {sections.map((section) => (
                    <MenuItem key={section} value={section}>
                      Section {section}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <DatePicker
                    label="Start Date"
                    value={config.filters.dateRange.start}
                    onChange={(date) =>
                      handleFilterChange("dateRange", {
                        ...config.filters.dateRange,
                        start: date,
                      })
                    }
                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                  />
                  <DatePicker
                    label="End Date"
                    value={config.filters.dateRange.end}
                    onChange={(date) =>
                      handleFilterChange("dateRange", {
                        ...config.filters.dateRange,
                        end: date,
                      })
                    }
                    slotProps={{ textField: { size: "small", fullWidth: true } }}
                  />
                </Box>
              </LocalizationProvider>
            </Box>
          </Box>

          <Divider />

          {/* Fields Selection */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Include Fields
            </Typography>
            <FormGroup>
              {currentFields.map((field) => (
                <FormControlLabel
                  key={field.value}
                  control={
                    <Checkbox
                      checked={config.fields.includes(field.value)}
                      onChange={() => handleFieldToggle(field.value)}
                    />
                  }
                  label={field.label}
                />
              ))}
            </FormGroup>
          </Box>

          <Divider />

          {/* Sorting */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Sorting
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <FormControl size="small" sx={{ flexGrow: 1 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={config.sortBy}
                  label="Sort By"
                  onChange={(e) => onConfigChange({ sortBy: e.target.value })}
                >
                  {currentFields.map((field) => (
                    <MenuItem key={field.value} value={field.value}>
                      {field.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small">
                <InputLabel>Order</InputLabel>
                <Select
                  value={config.sortOrder}
                  label="Order"
                  onChange={(e) => onConfigChange({ sortOrder: e.target.value as "asc" | "desc" })}
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Divider />

          {/* Export Actions */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Export Options
            </Typography>

            <ButtonGroup orientation="vertical" fullWidth>
              <Button startIcon={<PictureAsPdfIcon />} onClick={() => onExport("pdf")} variant="outlined">
                Export as PDF
              </Button>
              <Button startIcon={<TableViewIcon />} onClick={() => onExport("excel")} variant="outlined">
                Export as Excel
              </Button>
              <Button startIcon={<TableViewIcon />} onClick={() => onExport("csv")} variant="outlined">
                Export as CSV
              </Button>
              <Button startIcon={<PrintIcon />} onClick={onPrint} variant="outlined">
                Print Report
              </Button>
            </ButtonGroup>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
