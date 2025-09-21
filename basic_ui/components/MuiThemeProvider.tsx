"use client"

import { PropsWithChildren } from "react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"

const theme = createTheme({
  palette: {
    primary: { main: "#00bcd4" },
    secondary: { main: "#9c27b0" },
    background: { default: "#f5f7fb" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" } } },
    MuiButton: { defaultProps: { variant: "contained" } },
  },
})

export default function MuiThemeProvider({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
