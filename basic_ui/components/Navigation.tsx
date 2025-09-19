"use client"

import { useState } from "react"
import type React from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Menu,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import DashboardIcon from "@mui/icons-material/Dashboard"
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeek"
import AssessmentIcon from "@mui/icons-material/Assessment"
import LogoutIcon from "@mui/icons-material/Logout"
import SettingsIcon from "@mui/icons-material/Settings"
import SchoolIcon from "@mui/icons-material/School"

const navigationItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { label: "College", path: "/college", icon: <DashboardIcon /> },
  { label: "Timetable View", path: "/timetable", icon: <CalendarViewWeekIcon /> },
  { label: "Reports", path: "/reports", icon: <AssessmentIcon /> },
]

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [year, setYear] = useState<string>("2025")
  const [semester, setSemester] = useState<string>("Jan–May 2025")
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton selected={pathname === item.path} onClick={() => handleNavigation(item.path)}>
              <Box sx={{ mr: 2 }}>{item.icon}</Box>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 2 }}>
            <SchoolIcon />
            <Typography variant="h6" component="div">
              NEP 2020 Timetable Generator
            </Typography>
          </Box>

          {/* Context selectors */}
          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="academic-year-label">Academic Year</InputLabel>
                <Select
                  labelId="academic-year-label"
                  value={year}
                  label="Academic Year"
                  onChange={(e) => setYear(e.target.value)}
                >
                  <MenuItem value={"2024"}>2024</MenuItem>
                  <MenuItem value={"2025"}>2025</MenuItem>
                  <MenuItem value={"2026"}>2026</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="semester-label">Semester</InputLabel>
                <Select
                  labelId="semester-label"
                  value={semester}
                  label="Semester"
                  onChange={(e) => setSemester(e.target.value)}
                >
                  <MenuItem value={"Jan–May 2025"}>Jan–May 2025</MenuItem>
                  <MenuItem value={"Aug–Dec 2025"}>Aug–Dec 2025</MenuItem>
                  <MenuItem value={"Jan–May 2026"}>Jan–May 2026</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          {!isMobile && (
            <Box sx={{ display: "flex", gap: 1 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    backgroundColor: pathname === item.path ? "rgba(255,255,255,0.1)" : "transparent",
                  }}
                >
                  {item.label}
                </Button>
              ))}
              {/* Profile menu */}
              <IconButton color="inherit" onClick={handleProfileMenuOpen} sx={{ ml: 1 }} aria-label="profile">
                <Avatar sx={{ width: 28, height: 28 }}>A</Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  onClick={() => {
                    handleProfileMenuClose()
                    router.push("/settings")
                  }}
                >
                  <SettingsIcon fontSize="small" style={{ marginRight: 8 }} /> Settings
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleProfileMenuClose()
                    try {
                      localStorage.removeItem("access_token")
                      localStorage.removeItem("refresh_token")
                    } catch (_) {}
                    window.location.href = "/login/index.html"
                  }}
                >
                  <LogoutIcon fontSize="small" style={{ marginRight: 8 }} /> Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
        >
          {drawer}
        </Drawer>
      )}
    </>
  )
}
