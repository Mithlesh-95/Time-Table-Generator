"use client"

import { Box, Paper, Stack, Button, MenuItem, Select, FormControl, InputLabel, CircularProgress } from "@mui/material"
import TimetableGrid from "@/components/timetable/TimetableGrid"
import TimetableLegend from "@/components/timetable/TimetableLegend"
import { useEffect, useMemo, useState } from "react"
import type { TimetableConfig, TimetableData, TimetableEntry } from "@/types/timetable"
import DownloadIcon from "@mui/icons-material/FileDownload"
import { api } from "@/lib/api"
import { timetableApi, type TimetableEntity } from "@/lib/api/timetable"
import { getCollegeCode, subscribeCollegeCode } from "@/lib/college"
import { useSearchParams } from "next/navigation"

export default function TimetableView() {
  const searchParams = useSearchParams()
  const [config, setConfig] = useState<TimetableConfig>({
    colorScheme: {
      lecture: "#90caf9",
      tutorial: "#a5d6a7",
      practical: "#ffcc80",
      lab: "#ce93d8",
      break: "#b0bec5",
      free: "#f5f5f5",
    },
    timeSlots: [
      "09:00 - 09:50",
      "10:00 - 10:50",
      "11:00 - 11:50",
      "12:00 - 12:50",
      "13:30 - 14:20",
      "14:30 - 15:20",
    ],
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  })

  // (effects referencing sectionId are declared after sectionId state)

  // (moved below state declarations)

  // Helper: infer workingDays and timeSlots from a schedule shape
  const inferConfigFromSchedule = (sched: TimetableData["schedule"]) => {
    if (!sched) return
    const CANONICAL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    const days = Object.keys(sched).sort((a, b) => {
      const ai = CANONICAL_DAYS.indexOf(String(a))
      const bi = CANONICAL_DAYS.indexOf(String(b))
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })
    if (days.length) {
      const firstDay = days[0]
      const slotKeys = Object.keys((sched as any)[firstDay] || {})
      const parseStart = (s: string) => {
        // Expect formats like "09:00 - 09:50" or "9:00-9:50"; fallback to original string sort
        const m = String(s).split("-")[0].trim().split(":")
        if (m.length >= 2) {
          const hh = parseInt(m[0].replace(/\D/g, ""), 10)
          const mm = parseInt(m[1].replace(/\D/g, ""), 10)
          if (!isNaN(hh) && !isNaN(mm)) return hh * 60 + mm
        }
        return Number.MAX_SAFE_INTEGER
      }
      const slots = slotKeys.sort((a, b) => parseStart(a) - parseStart(b))
      if (days.length && slots.length) {
        setConfig((prev) => ({ ...prev, workingDays: days, timeSlots: slots }))
      } else if (days.length) {
        setConfig((prev) => ({ ...prev, workingDays: days }))
      }
    }
  }

  // Helper: adapt common backend shapes to our TimetableData.schedule
  const toSchedule = (raw: any): TimetableData["schedule"] | null => {
    // Already in schedule shape
    if (raw && raw.Monday && raw.Tuesday) return raw as TimetableData["schedule"]

    // Common shapes: array of entries with day/time fields
    const entries: any[] = raw?.entries || raw?.timetable || raw?.slots || raw?.data || []
    if (Array.isArray(entries) && entries.length) {
      const sched: any = {}
      for (const e of entries) {
        const day = e.day || e.Day || e.weekday || e.weekDay
        const time = e.time || e.timeslot || e.timeSlot || e.slot
        if (!day || !time) continue
        sched[day] = sched[day] || {}
        sched[day][time] = {
          subject: e.subject || e.subject_name || e.subjectShort || e.subjectCode || "",
          teacher: e.teacher || e.faculty || e.instructor || e.teacherShort || "",
          room: e.room || e.room_no || e.roomName || "",
          type: (e.type || e.kind || "lecture").toLowerCase(),
          subjectCode: e.subject_code || e.subjectCode,
          subjectFullName: e.subject_full_name || e.subjectFullName || e.subject_name,
          teacherShort: e.teacher_short || e.teacherShort,
          teacherFull: e.teacher_full || e.teacherFull,
        }
      }
      return sched
    }
    return null
  }

  // (moved below state declarations)


  const [collegeCode, setCollegeCode] = useState<string>(getCollegeCode())
  const [sections, setSections] = useState<Array<{ id: number; name: string; semester?: string }>>([])
  const [sectionId, setSectionId] = useState<number | "">("")
  const [loading, setLoading] = useState<boolean>(false)
  const [data, setData] = useState<TimetableData>({
    metadata: {
      semester: "",
      branch: "",
      section: "",
      academicYear: "",
    },
    schedule: {
      Monday: {},
      Tuesday: {},
      Wednesday: {},
      Thursday: {},
      Friday: {},
      Saturday: {},
    },
  })

  const handleConfigChange = (partial: Partial<TimetableConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }))
  }

  // Fetch generated timetables for the active college and build dropdown options
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        if (!collegeCode) { setSections([]); return }
        const res = await api.get<any>("/timetables/", { 'department__college__code': collegeCode })
        const body: any = (res as any)?.data ?? res
        const list = Array.isArray(body) ? body : (body?.results ?? [])
        if (!alive) return
        const opts = list.map((e: TimetableEntity | any) => ({
          id: e.id,
          name: e.section_letter ? `Section ${e.section_letter} • Year ${e.year} • Sem ${e.semester}` : (e?.data?.metadata?.section || `Timetable #${e.id}`),
          semester: String(e.semester ?? e?.data?.metadata?.semester ?? ""),
        }))
        setSections(opts)
        if (opts.length && !sectionId) setSectionId(opts[0].id)
      } catch (_) {
        setSections([])
      }
    })()
    return () => { alive = false }
  }, [collegeCode])

  useEffect(() => {
    const unsub = subscribeCollegeCode((code) => setCollegeCode(code))
    return () => unsub()
  }, [])

  // Refresh timetables when generator saves a new one
  useEffect(() => {
    const onUpdated = (e: any) => {
      // Force refetch by toggling collegeCode or calling the list fetch inline
      ;(async () => {
        try {
          const res = await api.get<any>("/timetables/", { 'department__college__code': collegeCode })
          const body: any = (res as any)?.data ?? res
          const list = Array.isArray(body) ? body : (body?.results ?? [])
          const opts = list.map((e: TimetableEntity | any) => ({
            id: e.id,
            name: e.section_letter ? `Section ${e.section_letter} • Year ${e.year} • Sem ${e.semester}` : (e?.data?.metadata?.section || `Timetable #${e.id}`),
            semester: String(e.semester ?? e?.data?.metadata?.semester ?? ""),
          }))
          setSections(opts)
          const newId = (e?.detail && e.detail.id) || (opts[0]?.id)
          if (newId) setSectionId(newId)
        } catch { /* ignore */ }
      })()
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('timetables_updated' as any, onUpdated as any)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('timetables_updated' as any, onUpdated as any)
      }
    }
  }, [collegeCode])

  // If we have a local last_generated_result and no selected id, show it optimistically
  useEffect(() => {
    if (sectionId) return
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('last_generated_result')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed) {
        let next = parsed as TimetableData
        if (!next.schedule || Object.keys(next.schedule || {}).length === 0) {
          const sched = toSchedule((parsed as any).schedule || parsed)
          if (sched) next = { metadata: parsed.metadata || { semester: '', branch: '', section: '', academicYear: '' }, schedule: sched }
        }
        if (next && next.schedule) {
          setData(next)
          inferConfigFromSchedule(next.schedule)
        }
      }
    } catch { /* ignore */ }
  }, [sectionId])

  // If no cached result either, try fetching the latest generation status by job id and render its inline result
  useEffect(() => {
    if (sectionId) return
    if (typeof window === 'undefined') return
    const cached = localStorage.getItem('last_generated_result')
    if (cached) return
    const job = localStorage.getItem('last_generation_job_id')
    if (!job) return
    ;(async () => {
      try {
        // reuse generator status endpoint via timetableApi
        const res: any = await (await import('@/lib/api/timetable')).timetableApi.getGenerationStatus(job)
        const body: any = (res as any)?.data ?? res
        const payload: any = body?.data?.data ?? body?.data ?? body
        const result = payload?.result
        if (!result) return
        let next: TimetableData = result as TimetableData
        if (!next.schedule || Object.keys(next.schedule || {}).length === 0) {
          const sched = toSchedule((result as any).schedule || result)
          if (sched) next = { metadata: (result as any).metadata || { semester: '', branch: '', section: '', academicYear: '' }, schedule: sched }
        }
        if (next && next.schedule) {
          setData(next)
          inferConfigFromSchedule(next.schedule)
        }
      } catch {
        // ignore
      }
    })()
  }, [sectionId])

  // Fetch timetable entity data for selected generated timetable
  useEffect(() => {
    if (!sectionId) return
    let alive = true
    setLoading(true)
    ;(async () => {
      try {
        const res = await timetableApi.getTimetable(Number(sectionId))
        const raw: any = (res as any)?.data ?? res
        const entity = raw as unknown as TimetableEntity
        if (!entity || !alive) return
        const payload: any = (entity as any).data
        let next: TimetableData | null = null
        if (payload?.schedule) {
          next = payload as TimetableData
        } else {
          const sched = toSchedule(payload)
          if (sched) {
            const meta = payload?.metadata || {}
            next = {
              metadata: {
                semester: String(meta?.semester ?? (entity as any).semester ?? ""),
                branch: String(meta?.branch ?? ""),
                section: String(meta?.section ?? `Section ${(entity as any).section_letter}`),
                academicYear: String(meta?.academicYear ?? (entity as any).academic_year ?? ""),
              },
              schedule: sched,
            }
          } else {
            next = {
              metadata: {
                semester: String(payload?.metadata?.semester ?? (entity as any).semester ?? ""),
                branch: String(payload?.metadata?.branch ?? ""),
                section: String(payload?.metadata?.section ?? `Section ${(entity as any).section_letter}`),
                academicYear: String(payload?.metadata?.academicYear ?? (entity as any).academic_year ?? ""),
              },
              schedule: (payload?.schedule || {}) as TimetableData["schedule"],
            }
          }
        }
        setData(next!)
        inferConfigFromSchedule(next!.schedule)
      } catch (_) {
        // keep empty state
        setData((prev) => ({
          ...prev,
          metadata: {
            semester: String(sections.find(s => s.id === sectionId)?.semester ?? ""),
            branch: "",
            section: String(sections.find(s => s.id === sectionId)?.name ?? ""),
            academicYear: "",
          },
        }))
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [sectionId, sections])

  const csvData = useMemo(() => {
    // Build CSV from current grid
    const header = ["Time", ...config.workingDays]
    const rows = config.timeSlots.map((slot) => {
      const cols = config.workingDays.map((day) => {
        const e = (data.schedule as any)[day]?.[slot] as TimetableEntry | undefined
        if (!e) return ""
        return `${e.subject ?? ''} | ${e.teacher ?? ''} | ${e.room ?? ''}`.trim()
      })
      return [slot, ...cols]
    })
    const lines = [header, ...rows]
    return lines.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")
  }, [config, data])

  const downloadCSV = () => {
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `timetable_${data?.metadata?.section || 'section'}_${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Top bar: select section + download */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="section-select-label">Select Section</InputLabel>
          <Select
            labelId="section-select-label"
            value={sectionId}
            label="Select Section"
            onChange={(e) => setSectionId(e.target.value as number)}
          >
            {sections.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" size="small" onClick={async () => {
          try {
            const res = await api.get<any>("/timetables/", { 'department__college__code': collegeCode })
            const body: any = (res as any)?.data ?? res
            const list = Array.isArray(body) ? body : (body?.results ?? [])
            const opts = list.map((e: TimetableEntity | any) => ({
              id: e.id,
              name: e.section_letter ? `Section ${e.section_letter} • Year ${e.year} • Sem ${e.semester}` : (e?.data?.metadata?.section || `Timetable #${e.id}`),
              semester: String(e.semester ?? e?.data?.metadata?.semester ?? ""),
            }))
            setSections(opts)
            if (opts.length && !sectionId) setSectionId(opts[0].id)
          } catch { /* ignore */ }
        }}>Refresh</Button>
        <Button variant="contained" startIcon={<DownloadIcon />} onClick={downloadCSV}>
          Download as CSV
        </Button>
      </Stack>

      {/* Grid */}
      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        {loading ? (
          <Box sx={{ height: 280, display: 'grid', placeItems: 'center' }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <TimetableGrid data={data} config={config} />
        )}
      </Paper>

      {/* Legend below for clarity */}
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <TimetableLegend config={config} />
      </Paper>
    </Box>
  )
}
