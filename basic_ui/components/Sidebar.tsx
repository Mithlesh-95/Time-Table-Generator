"use client"

import { useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Avatar, Divider } from "@mui/material"
import DashboardIcon from "@mui/icons-material/Dashboard"
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"
import SchoolIcon from "@mui/icons-material/School"
import DoorFrontIcon from "@mui/icons-material/DoorFront"
import MenuBookIcon from "@mui/icons-material/MenuBook"
import BoltIcon from "@mui/icons-material/Bolt"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"

const items = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon fontSize="small" /> },
  { label: "Students", path: "/data/students", icon: <PeopleAltIcon fontSize="small" /> },
  { label: "Faculty", path: "/data/faculty", icon: <SchoolIcon fontSize="small" /> },
  { label: "Rooms", path: "/data/rooms", icon: <DoorFrontIcon fontSize="small" /> },
  { label: "Courses", path: "/data/courses", icon: <MenuBookIcon fontSize="small" /> },
  { label: "Timetable Generator", path: "/generator", icon: <BoltIcon fontSize="small" /> },
  { label: "View Timetables", path: "/timetable", icon: <CalendarMonthIcon fontSize="small" /> },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const activeIndex = useMemo(() => items.findIndex((i) => pathname?.startsWith(i.path)), [pathname])

  return (
    <Box
      sx={{
        width: 260,
        flexShrink: 0,
        px: 2,
        py: 2,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        gap: 2,
        borderRight: '1px solid rgba(0,0,0,0.06)',
        background: 'linear-gradient(180deg, #f3f8ff 0%, #ffffff 60%)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 1 }}>
        <Avatar sx={{ bgcolor: '#00bcd4' }}>N</Avatar>
        <Box>
          <Typography fontWeight={800} lineHeight={1.2}>NEP Timetable</Typography>
          <Typography variant="caption" color="text.secondary">AI-Powered Scheduling</Typography>
        </Box>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, mb: 1, display: 'block' }}>MANAGEMENT</Typography>
        <List sx={{ py: 0 }}>
          {items.map((item, idx) => (
            <ListItemButton
              key={item.path}
              selected={idx === activeIndex}
              onClick={() => router.push(item.path)}
              sx={{
                my: 0.5,
                borderRadius: 2,
                '&.Mui-selected': {
                  background: 'rgba(0,188,212,0.15)'
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>{item.icon}</ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: 14 }} primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box sx={{ mt: 'auto' }}>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 1 }}>
          <Avatar sx={{ width: 28, height: 28 }}>U</Avatar>
          <Box>
            <Typography variant="body2">Academic Admin</Typography>
            <Typography variant="caption" color="text.secondary">NEP 2020 Compliant System</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
