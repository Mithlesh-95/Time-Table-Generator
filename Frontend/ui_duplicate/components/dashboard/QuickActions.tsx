"use client"

import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Box,
  Divider,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import UploadIcon from "@mui/icons-material/Upload"
import DownloadIcon from "@mui/icons-material/Download"
import SettingsIcon from "@mui/icons-material/Settings"
import HistoryIcon from "@mui/icons-material/History"

export default function QuickActions() {
  const handleAction = (action: string) => {
    console.log(`Quick action: ${action}`)
    // Placeholder for actual action handlers
  }

  const recentActivities = [
    { text: "Timetable generated for CSE Sem 5", time: "2 hours ago" },
    { text: "Configuration updated for IT Sec A", time: "1 day ago" },
    { text: "Report exported for Mechanical Dept", time: "2 days ago" },
  ]

  return (
    <Card>
      <CardHeader title="Quick Actions" subheader="Common tasks and recent activity" />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleAction("new-timetable")} fullWidth>
            New Timetable
          </Button>

          <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => handleAction("import-data")} fullWidth>
            Import Data
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleAction("export-config")}
            fullWidth
          >
            Export Config
          </Button>

          <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => handleAction("settings")} fullWidth>
            Settings
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>

        <List dense>
          {recentActivities.map((activity, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <ListItemIcon>
                <HistoryIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={activity.text}
                secondary={activity.time}
                primaryTypographyProps={{ variant: "body2" }}
                secondaryTypographyProps={{ variant: "caption" }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}
