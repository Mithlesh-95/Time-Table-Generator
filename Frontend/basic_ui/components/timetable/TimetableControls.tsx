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
  Button,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
} from "@mui/material"
import RefreshIcon from "@mui/icons-material/Refresh"
import SaveIcon from "@mui/icons-material/Save"
import PrintIcon from "@mui/icons-material/Print"
import ShareIcon from "@mui/icons-material/Share"
import type { TimetableConfig, TimetableMetadata } from "@/types/timetable"

interface TimetableControlsProps {
  config: TimetableConfig
  onConfigChange: (config: Partial<TimetableConfig>) => void
  metadata: TimetableMetadata
}

export default function TimetableControls({ config, onConfigChange, metadata }: TimetableControlsProps) {
  const [viewMode, setViewMode] = useState<"week" | "day">("week")
  const [showRoomNumbers, setShowRoomNumbers] = useState(true)
  const [showTeacherNames, setShowTeacherNames] = useState(true)

  const handleViewModeChange = (mode: "week" | "day") => {
    setViewMode(mode)
    // Implement view mode logic
  }

  const handleAction = (action: string) => {
    console.log(`Timetable action: ${action}`)
    // Placeholder for actual action handlers
  }

  const colorSchemes = [
    { name: "Default", scheme: config.colorScheme },
    {
      name: "Pastel",
      scheme: {
        lecture: "#81c784",
        tutorial: "#64b5f6",
        practical: "#ffb74d",
        lab: "#ba68c8",
        break: "#a5a5a5",
        free: "#f5f5f5",
      },
    },
    {
      name: "High Contrast",
      scheme: {
        lecture: "#2196f3",
        tutorial: "#4caf50",
        practical: "#ff9800",
        lab: "#9c27b0",
        break: "#607d8b",
        free: "#e0e0e0",
      },
    },
  ]

  return (
    <Card>
      <CardHeader title="Timetable Controls" subheader="Customize view and manage timetable" />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Current Selection Info */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Current Selection
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Chip label={`Sem ${metadata.semester}`} size="small" />
              <Chip label={metadata.branch} size="small" />
              <Chip label={`Sec ${metadata.section}`} size="small" />
            </Box>
          </Box>

          <Divider />

          {/* View Controls */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              View Options
            </Typography>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>View Mode</InputLabel>
              <Select
                value={viewMode}
                label="View Mode"
                onChange={(e) => handleViewModeChange(e.target.value as "week" | "day")}
              >
                <MenuItem value="week">Weekly View</MenuItem>
                <MenuItem value="day">Daily View</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={<Switch checked={showRoomNumbers} onChange={(e) => setShowRoomNumbers(e.target.checked)} />}
              label="Show Room Numbers"
            />

            <FormControlLabel
              control={<Switch checked={showTeacherNames} onChange={(e) => setShowTeacherNames(e.target.checked)} />}
              label="Show Teacher Names"
            />
          </Box>

          <Divider />

          {/* Color Scheme */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Color Scheme
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Theme</InputLabel>
              <Select
                value="Default"
                label="Theme"
                onChange={(e) => {
                  const selectedScheme = colorSchemes.find((s) => s.name === e.target.value)
                  if (selectedScheme) {
                    onConfigChange({ colorScheme: selectedScheme.scheme })
                  }
                }}
              >
                {colorSchemes.map((scheme) => (
                  <MenuItem key={scheme.name} value={scheme.name}>
                    {scheme.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider />

          {/* Actions */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Actions
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => handleAction("refresh")} fullWidth>
                Refresh Data
              </Button>

              <Button variant="outlined" startIcon={<SaveIcon />} onClick={() => handleAction("save")} fullWidth>
                Save Changes
              </Button>

              <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => handleAction("print")} fullWidth>
                Print Timetable
              </Button>

              <Button variant="outlined" startIcon={<ShareIcon />} onClick={() => handleAction("share")} fullWidth>
                Share Timetable
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
