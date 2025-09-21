"use client"

import { Box } from "@mui/material"
import Dashboard from "@/components/pages/Dashboard"
import AuthGuard from "@/components/AuthGuard"
import DashboardLayout from "@/components/layout/DashboardLayout"

export default function HomePage() {
  return (
    <AuthGuard>
      <DashboardLayout title="Academic Dashboard" subtitle="NEP 2020 Compliant Timetable Management System">
        <Dashboard />
      </DashboardLayout>
    </AuthGuard>
  )
}
