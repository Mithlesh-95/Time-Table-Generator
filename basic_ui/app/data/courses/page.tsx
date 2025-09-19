"use client"

import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { Box, Typography, Button } from "@mui/material"
import Navigation from "@/components/Navigation"

const theme = createTheme({
  palette: { primary: { main: "#1976d2" }, secondary: { main: "#dc004e" } },
})

export default function CoursesPage() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Manage Courses
          </Typography>
          <Button variant="contained">Add Course</Button>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
