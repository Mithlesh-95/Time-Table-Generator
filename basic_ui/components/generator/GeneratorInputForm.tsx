"use client"

import { useEffect, useState } from "react"
import { Box, TextField, Button, Stack, MenuItem, Typography, FormGroup, FormControlLabel, Checkbox, Select, InputLabel, FormControl, CircularProgress } from "@mui/material"
import { api } from "@/lib/api"
import { getCollegeCode, subscribeCollegeCode } from "@/lib/college"

export interface InputValues {
  academicYear: string
  year: 1 | 2 | 3 | 4
  semester: string
  departmentId: number
  sectionLetter: 'A'|'B'|'C'|'D'|'E'|'F'
  workingDays: string[]
  periodsPerDay: number
}

export default function GeneratorInputForm({ onStart }: { onStart: (values: InputValues) => void }) {
  const [collegeCode, setCollegeCode] = useState<string>(getCollegeCode())
  const [academicYear, setAcademicYear] = useState<string>("2024-25")
  const [year, setYear] = useState<1 | 2 | 3 | 4>(1)
  const [semester, setSemester] = useState<string>("Semester 1")
  const [departmentId, setDepartmentId] = useState<number | "">("")
  const [departments, setDepartments] = useState<Array<{ id: number; name: string; code?: string }>>([])
  const [loadingDepartments, setLoadingDepartments] = useState<boolean>(false)
  const [sectionLetter, setSectionLetter] = useState<'A'|'B'|'C'|'D'|'E'|'F'>('A')
  const [periodsPerDay, setPeriodsPerDay] = useState<number>(5)
  const [workingDays, setWorkingDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"])

  const handleSubmit = () => {
    if (!departmentId) return
    onStart({
      academicYear,
      year,
      semester,
      departmentId: Number(departmentId),
      sectionLetter,
      workingDays,
      periodsPerDay,
    })
  }

  // Fetch departments for selected college
  useEffect(() => {
    let alive = true
    setLoadingDepartments(true)
    ;(async () => {
      try {
        const res = await api.get<any>("/departments/", { 'college__code': collegeCode })
        const list = Array.isArray(res.data) ? res.data : (res.data?.results ?? [])
        if (!alive) return
        setDepartments(list.map((d: any) => ({ id: d.id, name: d.name, code: d.code })))
        if (list.length) setDepartmentId(list[0].id)
      } catch (_) {
        setDepartments([])
        setDepartmentId("")
      } finally {
        if (alive) setLoadingDepartments(false)
      }
    })()
    return () => { alive = false }
  }, [collegeCode])

  useEffect(() => {
    const unsub = subscribeCollegeCode((code) => setCollegeCode(code))
    return () => unsub()
  }, [])

  const toggleDay = (d: string) => {
    setWorkingDays((prev) => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  return (
    <Box>
      <Stack spacing={2}>
        <TextField label="Academic Year" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} size="small" fullWidth />

        <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
          <FormControl fullWidth size="small">
            <InputLabel id="year-label">Year</InputLabel>
            <Select labelId="year-label" label="Year" value={year} onChange={(e) => setYear(e.target.value as 1|2|3|4)}>
              <MenuItem value={1}>1st Year B.Tech</MenuItem>
              <MenuItem value={2}>2nd Year B.Tech</MenuItem>
              <MenuItem value={3}>3rd Year B.Tech</MenuItem>
              <MenuItem value={4}>4th Year B.Tech</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="semester-label">Semester</InputLabel>
            <Select labelId="semester-label" label="Semester" value={semester} onChange={(e) => setSemester(e.target.value)}>
              <MenuItem value="Semester 1">Semester 1</MenuItem>
              <MenuItem value="Semester 2">Semester 2</MenuItem>
              <MenuItem value="Semester 3">Semester 3</MenuItem>
              <MenuItem value="Semester 4">Semester 4</MenuItem>
              <MenuItem value="Semester 5">Semester 5</MenuItem>
              <MenuItem value="Semester 6">Semester 6</MenuItem>
              <MenuItem value="Semester 7">Semester 7</MenuItem>
              <MenuItem value="Semester 8">Semester 8</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
          <FormControl fullWidth size="small">
            <InputLabel id="dept-label">Department</InputLabel>
            <Select labelId="dept-label" label="Department" value={departmentId} onChange={(e) => setDepartmentId(e.target.value as number)} disabled={loadingDepartments || !departments.length}>
              {loadingDepartments ? (
                <MenuItem value=""><CircularProgress size={16} sx={{ mr: 1 }} /> Loading…</MenuItem>
              ) : departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.code ? `${d.code} — ${d.name}` : d.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="section-letter-label">Section</InputLabel>
            <Select labelId="section-letter-label" label="Section" value={sectionLetter} onChange={(e) => setSectionLetter(e.target.value as any)}>
              {(['A','B','C','D','E','F'] as const).map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Box>
          <Typography variant="caption" color="text.secondary">Working Days</Typography>
          <FormGroup row>
            {(["Mon","Tue","Wed","Thu","Fri","Sat"] as const).map((d) => (
              <FormControlLabel key={d} control={<Checkbox size="small" checked={workingDays.includes(d)} onChange={() => toggleDay(d)} />} label={d} />
            ))}
          </FormGroup>
        </Box>

        <TextField type="number" label="Periods per Day" size="small" value={periodsPerDay} onChange={(e) => setPeriodsPerDay(Number(e.target.value || 0))} inputProps={{ min: 1, max: 10 }} />

        <Box>
          <Button variant="contained" onClick={handleSubmit} disabled={!semester || !departmentId}>
            Generate Timetable
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
