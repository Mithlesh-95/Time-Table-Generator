"use client"

import { Box } from "@mui/material"
import Navigation from "@/components/Navigation"
import TimetableView from "@/components/pages/TimetableView"

export default function TimetablePage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <TimetableView />
      </Box>
    </Box>
  )
}
