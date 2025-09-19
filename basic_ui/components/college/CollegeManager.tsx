"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import RefreshIcon from "@mui/icons-material/Refresh"
import { apiClient, api } from "@/lib/api"
import { fetchMe, type Me } from "@/lib/auth"

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
      <Typography variant="h6">{children}</Typography>
    </Box>
  )
}

export default function CollegeManager() {
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(0)
  const [summary, setSummary] = useState<any | null>(null)
  const [departments, setDepartments] = useState<any[]>([])
  const collegeId = me?.college?.id

  const handleTab = (_: React.SyntheticEvent, v: number) => setTab(v)

  const load = async () => {
    try {
      setLoading(true)
      const profile = await fetchMe()
      setMe(profile)
      if (profile.college?.id) {
        const cid = profile.college.id
        console.log("Loading college data for college_id=", cid)

        const depTask = (async () => {
          try {
            // Primary: server-side filter
            const depRes = await apiClient.get(`/departments/`, { params: { college: cid, page_size: 1000 } })
            const depPayload = depRes?.data
            let depList = depPayload?.data ?? depPayload?.results ?? depPayload ?? []
            if (!Array.isArray(depList)) depList = []
            // Fallback: if empty, fetch all and client-filter
            if (depList.length === 0) {
              const allRes = await apiClient.get(`/departments/`, { params: { page_size: 1000 } })
              const allPayload = allRes?.data
              let allList = allPayload?.data ?? allPayload?.results ?? allPayload ?? []
              if (!Array.isArray(allList)) allList = []
              depList = allList.filter((d: any) => d?.college?.id === cid)
            }
            setDepartments(depList)
          } catch (e) {
            console.error("Failed to load departments:", (e as any)?.response?.data || (e as any)?.message || e)
          }
        })()

        const sumTask = (async () => {
          try {
            const resp = await api.get<any>(`/colleges/${cid}/summary/`)
            const sum = (resp as any)?.data ?? resp
            setSummary(sum)
          } catch (e) {
            console.warn("Summary endpoint failed/timed out:", (e as any)?.response?.data || (e as any)?.message || e)
          }
        })()

        await Promise.allSettled([depTask, sumTask])
      } else {
        setSummary(null)
        setDepartments([])
      }
    } catch (e: any) {
      console.error("Failed to load college summary:", e?.response?.data || e?.message || e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Dialog state for create Department
  const [deptOpen, setDeptOpen] = useState(false)
  const [deptName, setDeptName] = useState("")
  const [deptCode, setDeptCode] = useState("")

  const canManage = me?.role === "admin" || me?.role === "superadmin"

  const createDepartment = async () => {
    if (!collegeId) return
    await apiClient.post(`/departments/`, {
      name: deptName,
      code: deptCode,
      college_id: collegeId,
    })
    setDeptOpen(false)
    setDeptName("")
    setDeptCode("")
    await load()
  }

  // Dialog state for create Section
  const [secOpen, setSecOpen] = useState(false)
  const [secDeptId, setSecDeptId] = useState<number | "">("")
  const [secSemester, setSecSemester] = useState("")
  const [secName, setSecName] = useState("")
  const [secSize, setSecSize] = useState<number | "">("")

  const createSection = async () => {
    if (!secDeptId) return
    await apiClient.post(`/sections/`, {
      department_id: secDeptId,
      semester: secSemester,
      name: secName,
      size: Number(secSize || 0),
    })
    setSecOpen(false)
    setSecDeptId("")
    setSecSemester("")
    setSecName("")
    setSecSize("")
    await load()
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!collegeId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">No college is associated with this account.</Typography>
        <Typography variant="body2" color="text.secondary">
          Please contact a superadmin to associate your profile with a college.
        </Typography>
      </Box>
    )
  }

  const collegeHeader = (
    <Paper sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box>
        <Typography variant="h5">{me?.college?.name} ({me?.college?.code})</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage Departments, Faculty, Sections, Rooms, Subjects and Students for your college
        </Typography>
      </Box>
      <Stack direction="row" spacing={1}>
        <IconButton onClick={load} title="Refresh">
          <RefreshIcon />
        </IconButton>
        {canManage && (
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => setDeptOpen(true)}>
            New Department
          </Button>
        )}
      </Stack>
    </Paper>
  )

  const DepartmentsTable = () => (
    <>
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" color="text.secondary">Departments found: {departments.length}</Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.map((d: any) => (
              <TableRow key={d.id} hover>
                <TableCell>{d.code}</TableCell>
                <TableCell>{d.name}</TableCell>
              </TableRow>
            ))}
            {departments.length === 0 && (
              <TableRow>
                <TableCell colSpan={2}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="body2">No departments found for this college.</Typography>
                    <Button size="small" startIcon={<RefreshIcon />} onClick={load}>Retry</Button>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )

  const FacultyTable = () => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Experience</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {summary?.faculties?.map((f: any) => (
            <TableRow key={f.id} hover>
              <TableCell>{f.first_name} {f.last_name}</TableCell>
              <TableCell>{f.email}</TableCell>
              <TableCell>{f.department?.code}</TableCell>
              <TableCell>{f.experience_years} yrs</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  const SectionsTable = () => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Department</TableCell>
            <TableCell>Semester</TableCell>
            <TableCell>Section</TableCell>
            <TableCell>Size</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {summary?.sections?.map((s: any) => (
            <TableRow key={`${s.department?.id}-${s.semester}-${s.name}`} hover>
              <TableCell>{s.department?.code}</TableCell>
              <TableCell>{s.semester}</TableCell>
              <TableCell>{s.name}</TableCell>
              <TableCell>{s.size}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  const RoomsTable = () => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Number</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Capacity</TableCell>
            <TableCell>Department</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {summary?.rooms?.map((r: any) => (
            <TableRow key={r.id} hover>
              <TableCell>{r.number}</TableCell>
              <TableCell>{r.room_type}</TableCell>
              <TableCell>{r.capacity}</TableCell>
              <TableCell>{r.department?.code || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  const SubjectsTable = () => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Credits (T+P)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {summary?.subjects?.map((s: any) => (
            <TableRow key={s.id} hover>
              <TableCell>{s.code}</TableCell>
              <TableCell>{s.name}</TableCell>
              <TableCell>{s.category}</TableCell>
              <TableCell>{s.credits_theory}+{s.credits_practical}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  const StudentsTable = () => (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Enrollment</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Semester</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {summary?.students?.map((s: any) => (
            <TableRow key={s.id} hover>
              <TableCell>{s.enrollment_no}</TableCell>
              <TableCell>{s.first_name} {s.last_name}</TableCell>
              <TableCell>{s.department?.code}</TableCell>
              <TableCell>{s.current_semester}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )

  return (
    <Box sx={{ p: 2 }}>
      {collegeHeader}

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={handleTab} variant="scrollable" scrollButtons="auto">
          <Tab label="Departments" />
          <Tab label="Faculty" />
          <Tab label="Sections" />
          <Tab label="Rooms" />
          <Tab label="Subjects" />
          <Tab label="Students" />
        </Tabs>
      </Paper>

      <Box hidden={tab !== 0}>
        <SectionTitle>Departments</SectionTitle>
        {canManage && (
          <Box sx={{ mb: 1 }}>
            <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setDeptOpen(true)}>
              Add Department
            </Button>
          </Box>
        )}
        <DepartmentsTable />
      </Box>

      <Box hidden={tab !== 1}>
        <SectionTitle>Faculty</SectionTitle>
        <FacultyTable />
      </Box>

      <Box hidden={tab !== 2}>
        <SectionTitle>Sections</SectionTitle>
        {canManage && (
          <Box sx={{ mb: 1 }}>
            <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setSecOpen(true)}>
              Add Section
            </Button>
          </Box>
        )}
        <SectionsTable />
      </Box>

      <Box hidden={tab !== 3}>
        <SectionTitle>Rooms</SectionTitle>
        <RoomsTable />
      </Box>

      <Box hidden={tab !== 4}>
        <SectionTitle>Subjects</SectionTitle>
        <SubjectsTable />
      </Box>

      <Box hidden={tab !== 5}>
        <SectionTitle>Students</SectionTitle>
        <StudentsTable />
      </Box>

      {/* Create Department Dialog */}
      <Dialog open={deptOpen} onClose={() => setDeptOpen(false)}>
        <DialogTitle>New Department</DialogTitle>
        <DialogContent>
          <Stack sx={{ mt: 1 }} spacing={2}>
            <TextField label="Department Code" value={deptCode} onChange={(e) => setDeptCode(e.target.value)} fullWidth />
            <TextField label="Department Name" value={deptName} onChange={(e) => setDeptName(e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeptOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createDepartment} disabled={!deptCode || !deptName}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Section Dialog */}
      <Dialog open={secOpen} onClose={() => setSecOpen(false)}>
        <DialogTitle>New Section</DialogTitle>
        <DialogContent>
          <Stack sx={{ mt: 1 }} spacing={2}>
            <TextField
              label="Department ID"
              type="number"
              value={secDeptId}
              onChange={(e) => setSecDeptId(e.target.value ? Number(e.target.value) : "")}
              helperText="Enter the numeric ID from Departments table"
              fullWidth
            />
            <TextField label="Semester" value={secSemester} onChange={(e) => setSecSemester(e.target.value)} fullWidth />
            <TextField label="Section Name" value={secName} onChange={(e) => setSecName(e.target.value)} fullWidth />
            <TextField label="Size" type="number" value={secSize} onChange={(e) => setSecSize(e.target.value as any)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSecOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={createSection} disabled={!secDeptId || !secSemester || !secName}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
