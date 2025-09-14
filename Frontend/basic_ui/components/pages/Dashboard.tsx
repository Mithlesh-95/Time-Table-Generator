"use client"

import { Box, Typography } from "@mui/material"
import ConfigurationForm from "@/components/dashboard/ConfigurationForm"
import ProgressTracker from "@/components/dashboard/ProgressTracker"
import QuickActions from "@/components/dashboard/QuickActions"

export default function Dashboard() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Dashboard
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, gap: 2 }}>
        <Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <ConfigurationForm />
            <ProgressTracker />
          </Box>
        </Box>
        <Box>
          <QuickActions />
        </Box>
      </Box>
    </Box>
  )
}
