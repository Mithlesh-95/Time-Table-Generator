"use client"

import { Box, CircularProgress, Typography, Backdrop } from "@mui/material"

interface LoadingOverlayProps {
  open: boolean
  message?: string
}

export default function LoadingOverlay({ open, message = "Loading..." }: LoadingOverlayProps) {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        backdropFilter: 'blur(3px)', // Add blur effect
        transition: 'opacity 0.3s ease-in-out', // Smooth fade in/out
      }}
      open={open}
    >
      <CircularProgress color="inherit" size={60} thickness={4} />
      <Typography variant="h6" component="div">
        {message}
      </Typography>
      <Typography variant="body2" component="div" sx={{ opacity: 0.8 }}>
        Please wait while the page loads...
      </Typography>
    </Backdrop>
  )
}
