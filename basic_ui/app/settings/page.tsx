"use client"

import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { Box, Typography, TextField, Button, Stack } from "@mui/material"
import Navigation from "@/components/Navigation"

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#dc004e" },
  },
})

export default function SettingsPage() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Admin Settings
          </Typography>
          <Stack spacing={2} sx={{ maxWidth: 480 }}>
            <TextField label="Admin Name" size="small" />
            <TextField label="Email" size="small" />
            <Button variant="contained">Save</Button>
          </Stack>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
