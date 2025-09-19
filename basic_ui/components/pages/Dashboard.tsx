"use client"

import { Box, Typography, Grid, Card, CardContent, Button, Stack, Divider } from "@mui/material"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks"
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled"
import VisibilityIcon from "@mui/icons-material/Visibility"
import ReportProblemIcon from "@mui/icons-material/ReportProblem"
import EditCalendarIcon from "@mui/icons-material/EditCalendar"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import BarChartIcon from "@mui/icons-material/BarChart"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const router = useRouter()

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Stack spacing={1} alignItems="flex-start">
                <Typography variant="subtitle2" color="text.secondary">
                  Quick Action
                </Typography>
                <Button fullWidth variant="contained" startIcon={<PersonAddIcon />} onClick={() => router.push("/data/faculty")}> 
                  Add Faculty
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Workload, availability, expertise
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Stack spacing={1} alignItems="flex-start">
                <Typography variant="subtitle2" color="text.secondary">
                  Quick Action
                </Typography>
                <Button fullWidth variant="contained" color="primary" startIcon={<LibraryBooksIcon />} onClick={() => router.push("/data/courses")}>
                  Add Courses
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Codes, credits, theory/practical
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Stack spacing={1} alignItems="flex-start">
                <Typography variant="subtitle2" color="text.secondary">
                  Quick Action
                </Typography>
                <Button fullWidth variant="contained" startIcon={<MeetingRoomIcon />} onClick={() => router.push("/data/rooms")}> 
                  Add Rooms/Labs
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Capacity, availability
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Stack spacing={1} alignItems="flex-start">
                <Typography variant="subtitle2" color="text.secondary">
                  Quick Action
                </Typography>
                <Button fullWidth variant="outlined" startIcon={<UploadFileIcon />} onClick={() => router.push("/data/students")}> 
                  Upload Students
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Excel/CSV with electives & credits
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Timetable Management and Scenario Simulation */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Timetable Management
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button size="large" variant="contained" startIcon={<PlayCircleFilledIcon />} onClick={() => router.push("/generator")}> 
                  Generate Timetable
                </Button>
                <Button size="large" variant="outlined" startIcon={<VisibilityIcon />} onClick={() => router.push("/timetable")}> 
                  View Timetable
                </Button>
                <Button size="large" variant="outlined" color="warning" startIcon={<ReportProblemIcon />} onClick={() => router.push("/conflicts")}> 
                  Conflict Reports
                </Button>
                <Button size="large" variant="outlined" startIcon={<EditCalendarIcon />} onClick={() => router.push("/edit-timetable")}> 
                  Edit Timetable
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Reports & Exports */}
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Reports & Exports
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
                <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => router.push("/exports?type=pdf")}> 
                  Export PDF
                </Button>
                <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => router.push("/exports?type=excel")}> 
                  Export Excel
                </Button>
                <Divider flexItem orientation="vertical" />
                <Button variant="contained" startIcon={<BarChartIcon />} onClick={() => router.push("/reports")}> 
                  Statistics Dashboard
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Scenario Simulation */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Scenario Simulation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Run what-if simulations (e.g., faculty absent, new elective added). Coming soon.
              </Typography>
              <Stack spacing={1}>
                <Button variant="outlined" size="small" onClick={() => router.push("/generator?scenario=faculty-absent")}>Faculty absent</Button>
                <Button variant="outlined" size="small" onClick={() => router.push("/generator?scenario=new-elective")}>New elective added</Button>
                <Button variant="outlined" size="small" onClick={() => router.push("/generator?scenario=room-unavailable")}>Room unavailable</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
