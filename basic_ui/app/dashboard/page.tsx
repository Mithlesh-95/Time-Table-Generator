"use client"

import { Box } from "@mui/material"
import Navigation from "@/components/Navigation"
import Dashboard from "@/components/pages/Dashboard"
import AuthGuard from "@/components/AuthGuard"

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Dashboard />
        </Box>
      </Box>
    </AuthGuard>
  )
}
