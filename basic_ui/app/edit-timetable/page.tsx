"use client"

import { Box, Typography } from "@mui/material"
import Navigation from "@/components/Navigation"

export default function EditTimetablePage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Edit Timetable
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Drag & drop/manual overrides will be implemented here.
        </Typography>
      </Box>
    </Box>
  )
}
