"use client"

import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { Box } from "@mui/material"
import Navigation from "@/components/Navigation"
import AuthGuard from "@/components/AuthGuard"
import CollegeManager from "@/components/college/CollegeManager"

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
})

export default function CollegePage() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthGuard>
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <Navigation />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <CollegeManager />
          </Box>
        </Box>
      </AuthGuard>
    </ThemeProvider>
  )
}
