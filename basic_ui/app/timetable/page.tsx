"use client"

import { Box } from "@mui/material"
import TimetableView from "@/components/pages/TimetableView"
import DashboardLayout from "@/components/layout/DashboardLayout"

export default function TimetablePage() {
  return (
    <DashboardLayout title="View Timetables" subtitle="Browse generated timetables and export.">
      <TimetableView />
    </DashboardLayout>
  )
}
