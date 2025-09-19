"use client"

import { Box, Typography, List, ListItem, ListItemText, Divider } from "@mui/material"
import Navigation from "@/components/Navigation"

export default function ConflictsPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Conflict Reports
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          List of clashes with suggested fixes (placeholder).
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="Faculty double-booked: Dr. Sharma" secondary="Tue 10:00–11:00, CSE-201 and CSE-305" />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary="Room conflict: Lab-3" secondary="Wed 2:00–4:00, two practicals assigned" />
          </ListItem>
        </List>
      </Box>
    </Box>
  )
}

