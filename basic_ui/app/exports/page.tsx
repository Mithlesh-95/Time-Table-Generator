"use client"

import { Box, Typography, Button, Stack } from "@mui/material"
import Navigation from "@/components/Navigation"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import FileDownloadIcon from "@mui/icons-material/FileDownload"

export default function ExportsPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Reports & Export
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button variant="outlined" startIcon={<PictureAsPdfIcon />}>Export PDF</Button>
          <Button variant="outlined" startIcon={<FileDownloadIcon />}>Export Excel</Button>
        </Stack>
      </Box>
    </Box>
  )
}

