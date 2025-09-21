"use client"

import { Box, Typography, Grid, Card, CardContent, Button, Stack, Divider, Chip, CircularProgress, Skeleton } from "@mui/material"
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
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { getCollegeCode, subscribeCollegeCode } from "@/lib/college"
import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

export default function Dashboard() {
  const router = useRouter()
  const [collegeCode, setCollegeCode] = useState<string>(getCollegeCode())
  const [stats, setStats] = useState({ students: 0, faculty: 0, rooms: 0, courses: 0, timetables: 0 })
  const [loadingStats, setLoadingStats] = useState(true)
  const [facultyWorkloadData, setFacultyWorkloadData] = useState<Array<{ name: string; load: number }>>([])
  const [roomUtilizationData, setRoomUtilizationData] = useState<Array<{ name: string; value: number }>>([])

  useEffect(() => {
    let alive = true
    const fetchCounts = async () => {
      try {
        const paramsStudents = { 'department__college__code': collegeCode }
        const paramsFaculty = { 'department__college__code': collegeCode }
        const paramsRooms = { 'department__college__code': collegeCode }
        const paramsSubjects = { 'departments__college__code': collegeCode }
        const [s, f, r, c] = await Promise.all([
          api.get<any>("/students/", paramsStudents),
          api.get<any>("/faculties/", paramsFaculty),
          api.get<any>("/rooms/", paramsRooms),
          api.get<any>("/subjects/", paramsSubjects),
        ])
        if (!alive) return
        const arr = (resp: any) => Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp?.data?.results) ? resp.data.results : [])
        const total = (resp: any, fallbackArr: any[]) => (resp?.pagination?.total ?? (Array.isArray(fallbackArr) ? fallbackArr.length : 0))

        const sArr = arr(s)
        const fArr = arr(f)
        const rArr = arr(r)
        const cArr = arr(c)
        const sCount = total(s as any, sArr)
        const fCount = total(f as any, fArr)
        const rCount = total(r as any, rArr)
        const cCount = total(c as any, cArr)
        setStats({ students: sCount, faculty: fCount, rooms: rCount, courses: cCount, timetables: Math.max(20, Math.floor(sCount / 50)) })

        // Build faculty workload chart from capacity (or inferred load if available)
        const faculties = Array.isArray(fArr) ? fArr : []
        const topByCapacity = faculties
          .map((fa: any) => ({ name: `${fa.first_name ?? ''} ${fa.last_name ?? ''}`.trim() || fa.email, load: Number(fa.workload_capacity_hours ?? 0) }))
          .sort((a: any, b: any) => b.load - a.load)
          .slice(0, 5)
        setFacultyWorkloadData(topByCapacity)

        // Room utilization by room_type counts
        const rooms = Array.isArray(rArr) ? rArr : []
        const counts: Record<string, number> = {}
        rooms.forEach((rm: any) => { counts[rm.room_type] = (counts[rm.room_type] ?? 0) + 1 })
        const roomPie = [
          { name: "Theory Rooms", value: counts["lecture"] ?? 0 },
          { name: "Labs", value: counts["lab"] ?? 0 },
          { name: "Seminar Halls", value: counts["seminar"] ?? 0 },
        ]
        setRoomUtilizationData(roomPie)
      } catch (_) {
        // fallback keeps UI rendering without breaking DB/API
      } finally {
        if (alive) setLoadingStats(false)
      }
    }
    fetchCounts()
    return () => {
      alive = false
    }
  }, [collegeCode])

  // Retry fetch once after auth token becomes available (handles initial 401 before login)
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) return
    if (stats.students === 0 && stats.faculty === 0 && stats.rooms === 0 && stats.courses === 0 && !loadingStats) {
      ;(async () => {
        try {
          setLoadingStats(true)
          const [s, f, r, c] = await Promise.all([
            api.get<any>("/students/", { 'department__college__code': collegeCode }),
            api.get<any>("/faculties/", { 'department__college__code': collegeCode }),
            api.get<any>("/rooms/", { 'department__college__code': collegeCode }),
            api.get<any>("/subjects/", { 'departments__college__code': collegeCode }),
          ])
          const arr = (resp: any) => Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp?.data?.results) ? resp.data.results : [])
          const total = (resp: any, fallbackArr: any[]) => (resp?.pagination?.total ?? (Array.isArray(fallbackArr) ? fallbackArr.length : 0))
          const sArr = arr(s), fArr = arr(f), rArr = arr(r), cArr = arr(c)
          const sCount = total(s as any, sArr)
          const fCount = total(f as any, fArr)
          const rCount = total(r as any, rArr)
          const cCount = total(c as any, cArr)
          setStats({ students: sCount, faculty: fCount, rooms: rCount, courses: cCount, timetables: Math.max(20, Math.floor(sCount / 50)) })
          const faculties = Array.isArray(fArr) ? fArr : []
          setFacultyWorkloadData(
            faculties
              .map((fa: any) => ({ name: `${fa.first_name ?? ''} ${fa.last_name ?? ''}`.trim() || fa.email, load: Number(fa.workload_capacity_hours ?? 0) }))
              .sort((a: any, b: any) => b.load - a.load)
              .slice(0, 5)
          )
          const rooms = Array.isArray(rArr) ? rArr : []
          const counts: Record<string, number> = {}
          rooms.forEach((rm: any) => { counts[rm.room_type] = (counts[rm.room_type] ?? 0) + 1 })
          setRoomUtilizationData([
            { name: "Theory Rooms", value: counts["lecture"] ?? 0 },
            { name: "Labs", value: counts["lab"] ?? 0 },
            { name: "Seminar Halls", value: counts["seminar"] ?? 0 },
          ])
        } catch (_) {
        } finally {
          setLoadingStats(false)
        }
      })()
    }
  }, [loadingStats, stats.students, stats.faculty, stats.rooms, stats.courses, collegeCode])

  useEffect(() => {
    const unsub = subscribeCollegeCode((code) => setCollegeCode(code))
    return () => unsub()
  }, [])

  const donutColors = ["#4F46E5", "#06B6D4", "#10B981"]

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Hero section */}
      <Box
        sx={{
          borderRadius: 3,
          px: { xs: 3, md: 5 },
          py: { xs: 4, md: 6 },
          mb: 4,
          background: "linear-gradient(135deg, rgba(0,188,212,0.15) 0%, rgba(156,39,176,0.15) 100%)",
          border: "1px solid rgba(0,0,0,0.06)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* subtle decorative blob */}
        <Box
          sx={{
            position: "absolute",
            right: -60,
            top: -60,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, rgba(0,188,212,0.35), rgba(156,39,176,0.25))",
            filter: "blur(20px)",
          }}
        />

        <Stack
          spacing={2}
          alignItems="center"
          sx={{
            textAlign: "center",
            maxWidth: 1000,
            mx: "auto",
            animation: "fadeInUp 700ms ease both",
            "@keyframes fadeInUp": {
              from: { opacity: 0, transform: "translate3d(0, 12px, 0)" },
              to: { opacity: 1, transform: "translate3d(0, 0, 0)" },
            },
          }}
        >
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: 0.2 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 720 }}>
            Manage faculty, courses, rooms, and generate beautiful NEP 2020 compliant timetables with ease.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 1 }}>
            <Button
              size="large"
              startIcon={<PlayCircleFilledIcon />}
              onClick={() => router.push("/generator")}
              sx={{
                background: "linear-gradient(135deg, #00bcd4 0%, #9c27b0 100%)",
                color: "white",
                px: 3,
                '&:hover': {
                  filter: "brightness(1.05)",
                  boxShadow: "0 10px 24px rgba(0,188,212,0.25)",
                },
              }}
            >
              Generate Timetable
            </Button>
            <Button size="large" variant="outlined" startIcon={<VisibilityIcon />} onClick={() => router.push("/timetable")}>
              View Timetable
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Constrained container for content */}
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Stats row */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' },
          gap: 2,
          mb: 3,
        }}>
          {[{
            label: "Total Students",
            value: stats.students,
            icon: "👥",
          }, {
            label: "Faculty Members",
            value: stats.faculty,
            icon: "🧑‍🏫",
          }, {
            label: "Available Rooms",
            value: stats.rooms,
            icon: "🏫",
          }, {
            label: "Total Courses",
            value: stats.courses,
            icon: "📘",
          }, {
            label: "Generated Timetables",
            value: stats.timetables,
            icon: "🗓️",
          }].map((s) => (
            <Card key={s.label} sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                    {loadingStats ? (
                      <Skeleton variant="text" width={40} height={28} />
                    ) : (
                      <Typography variant="h6" fontWeight={800}>{s.value}</Typography>
                    )}
                  </Box>
                  <Box aria-hidden sx={{ fontSize: 26 }}>{s.icon}</Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Charts */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            alignItems: 'start',
          }}
        >
          {/* Left column: Faculty bar chart */}
          <Box>
            <Card sx={{ borderRadius: 3, boxShadow: 2, mb: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="h6">Faculty Workload Distribution</Typography>
                  <Chip size="small" label="This week" />
                </Stack>
                <Box sx={{ width: '100%', height: 220, display: 'grid', placeItems: 'center' }}>
                  {loadingStats ? (
                    <CircularProgress size={28} />
                  ) : (
                    <ResponsiveContainer>
                      <RBarChart data={facultyWorkloadData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="load" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                      </RBarChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Right column: Room pie chart */}
          <Box>
            <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="h6">Room Utilization</Typography>
                  <Chip size="small" label="This week" />
                </Stack>
                <Box sx={{ width: '100%', height: 220, display: 'grid', placeItems: 'center' }}>
                  {loadingStats ? (
                    <CircularProgress size={28} />
                  ) : (
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={roomUtilizationData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                          {roomUtilizationData.map((_, idx) => (
                            <Cell key={idx} fill={donutColors[idx % donutColors.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>

        </Box>
      </Box>
    </Box>
  )
}

