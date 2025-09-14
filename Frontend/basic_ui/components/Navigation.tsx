"use client"

import { useState, useEffect } from "react"
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
  LinearProgress,
  CircularProgress,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import DashboardIcon from "@mui/icons-material/Dashboard"
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeek"
import AssessmentIcon from "@mui/icons-material/Assessment"
import SchoolIcon from "@mui/icons-material/School"
import LoadingOverlay from "./LoadingOverlay"

const navigationItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { label: "Add Data", path: "/master-data", icon: <SchoolIcon /> },
  { label: "Timetable View", path: "/timetable", icon: <CalendarViewWeekIcon /> },
  { label: "Reports", path: "/reports", icon: <AssessmentIcon /> },
]

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null)
  const [showOverlay, setShowOverlay] = useState(false)
  const [previousPathname, setPreviousPathname] = useState<string>("")
  const [navigationStartTime, setNavigationStartTime] = useState<number>(0)
  const router = useRouter()
  const pathname = usePathname()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  // Reset navigation state when pathname actually changes (navigation complete)
  useEffect(() => {
    if (isNavigating && pathname !== previousPathname && pathname !== navigationTarget && previousPathname !== "") {
      // Ensure minimum loading time to prevent blinking
      const elapsedTime = Date.now() - navigationStartTime
      const minLoadingTime = 600 // Minimum 600ms loading time
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
      
      const timer = setTimeout(() => {
        setIsNavigating(false)
        setNavigationTarget(null)
        setShowOverlay(false)
      }, remainingTime + 100) // Add small buffer
      return () => clearTimeout(timer)
    }
    setPreviousPathname(pathname)
  }, [pathname, isNavigating, navigationTarget, previousPathname, navigationStartTime])

  // Clear loading state when we reach the target destination
  useEffect(() => {
    if (isNavigating && pathname === navigationTarget) {
      // Ensure minimum loading time even when reaching target quickly
      const elapsedTime = Date.now() - navigationStartTime
      const minLoadingTime = 400 // Minimum 400ms for target reached
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
      
      const timer = setTimeout(() => {
        setIsNavigating(false)
        setNavigationTarget(null)
        setShowOverlay(false)
      }, remainingTime)
      return () => clearTimeout(timer)
    }
  }, [pathname, navigationTarget, isNavigating, navigationStartTime])

  // Show overlay for longer loads  
  useEffect(() => {
    if (isNavigating && !showOverlay) {
      const overlayTimer = setTimeout(() => {
        if (isNavigating) { // Double check we're still navigating
          setShowOverlay(true)
        }
      }, 1000) // Increased to 1 second to reduce unnecessary overlays
      return () => clearTimeout(overlayTimer)
    }
  }, [isNavigating, showOverlay])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleNavigation = (path: string) => {
    if (pathname === path) return // Don't navigate if already on the page
    
    setNavigationStartTime(Date.now()) // Record start time
    setIsNavigating(true)
    setNavigationTarget(path)
    router.push(path)
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        {navigationItems.map((item) => {
          const isCurrentlyNavigating = isNavigating && navigationTarget === item.path
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton 
                selected={pathname === item.path} 
                onClick={() => handleNavigation(item.path)}
                disabled={isNavigating}
              >
                <Box sx={{ mr: 2 }}>
                  {isCurrentlyNavigating ? <CircularProgress size={20} /> : item.icon}
                </Box>
                <ListItemText primary={isCurrentlyNavigating ? 'Loading...' : item.label} />
              </ListItemButton>
            </ListItem>
          )
        })}
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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            NEP 2020 Timetable Generator
          </Typography>
          {!isMobile && (
            <Box sx={{ display: "flex", gap: 1 }}>
              {navigationItems.map((item) => {
                const isCurrentlyNavigating = isNavigating && navigationTarget === item.path
                return (
                  <Button
                    key={item.path}
                    color="inherit"
                    onClick={() => handleNavigation(item.path)}
                    disabled={isNavigating}
                    startIcon={isCurrentlyNavigating ? <CircularProgress size={16} color="inherit" /> : item.icon}
                    sx={{
                      backgroundColor: pathname === item.path ? "rgba(255,255,255,0.1)" : "transparent",
                      minWidth: 120, // Prevent button width changes
                      transition: 'all 0.3s ease-in-out', // Smooth transitions
                      '&.Mui-disabled': {
                        color: 'rgba(255,255,255,0.7)', // Better disabled state
                      }
                    }}
                  >
                    {isCurrentlyNavigating ? 'Loading...' : item.label}
                  </Button>
                )
              })}
            </Box>
          )}
        </Toolbar>
        
        {/* Navigation Loading Progress Bar */}
        {isNavigating && (
          <LinearProgress 
            sx={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0,
              height: 4, // Slightly thicker for better visibility
              '& .MuiLinearProgress-bar': {
                transition: 'transform 0.4s ease-in-out'
              }
            }} 
            color="secondary"
          />
        )}
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
      
      {/* Page Navigation Loading Overlay */}
      <LoadingOverlay 
        open={showOverlay} 
        message={`Loading ${navigationTarget === '/master-data' ? 'Master Data Management' : navigationTarget === '/dashboard' ? 'Dashboard' : navigationTarget === '/timetable' ? 'Timetable View' : 'Page'}...`}
      />
    </>
  )
}
