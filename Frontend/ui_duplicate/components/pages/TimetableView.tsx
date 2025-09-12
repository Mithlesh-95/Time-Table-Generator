"use client"

import { Box, Typography, Paper } from "@mui/material"
import TimetableControls from "@/components/timetable/TimetableControls"
import TimetableGrid from "@/components/timetable/TimetableGrid"
import TimetableLegend from "@/components/timetable/TimetableLegend"
import { useState } from "react"
import type { TimetableConfig, TimetableData } from "@/types/timetable"

export default function TimetableView() {
  const [config, setConfig] = useState<TimetableConfig>({
    colorScheme: {
      lecture: "#90caf9",
      tutorial: "#a5d6a7",
      practical: "#ffcc80",
      lab: "#ce93d8",
      break: "#b0bec5",
      free: "#f5f5f5",
    },
    timeSlots: [
      "09:00 - 09:50",
      "10:00 - 10:50",
      "11:00 - 11:50",
      "12:00 - 12:50",
      "13:30 - 14:20",
      "14:30 - 15:20",
    ],
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  })

  const [data] = useState<TimetableData>({
    metadata: {
      semester: "5",
      branch: "Computer Science",
      section: "A",
      academicYear: "2024-25",
    },
    schedule: {
      Monday: {},
      Tuesday: {},
      Wednesday: {},
      Thursday: {},
      Friday: {},
      Saturday: {},
    },
  })

  const handleConfigChange = (partial: Partial<TimetableConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }))
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Timetable View
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Paper sx={{ p: 2 }}>
          <TimetableControls config={config} onConfigChange={handleConfigChange} metadata={data.metadata} />
        </Paper>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "3fr 1fr" }, gap: 2 }}>
          <Box>
            <TimetableGrid data={data} config={config} />
          </Box>
          <Box>
            <TimetableLegend config={config} />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
