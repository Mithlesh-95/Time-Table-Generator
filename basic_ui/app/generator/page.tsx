"use client"

import { useState } from "react"
import { Box, Typography, Paper, Stack, CircularProgress, Alert } from "@mui/material"
import GeneratorInputForm, { type InputValues } from "@/components/generator/GeneratorInputForm"
import GeneratorProgress from "@/components/generator/GeneratorProgress"
import { timetableApi } from "@/lib/api/timetable"
import DashboardLayout from "@/components/layout/DashboardLayout"

export default function GeneratorPage() {
  const [jobId, setJobId] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)

  const handleStart = async (values: InputValues) => {
    try {
      setStartError(null)
      setStarting(true)
      const payload = {
        academic_year: values.academicYear,
        year: values.year,
        semester: values.semester,
        department_id: values.departmentId,
        section_letter: values.sectionLetter,
        working_days: values.workingDays,
        periods_per_day: values.periodsPerDay,
      }
      if (typeof window !== 'undefined') localStorage.setItem('last_generation_request', JSON.stringify(payload))
      const res = await timetableApi.generateTimetable(payload)
      const body: any = (res as any)?.data ?? res
      const id = body?.jobId || body?.job_id || body?.id || body?.data?.jobId || body?.data?.job_id || body?.data?.id
      if (id) {
        setJobId(String(id))
        if (typeof window !== 'undefined') localStorage.setItem('last_generation_job_id', String(id))
      }
      else {
        console.error('Generation start response missing jobId', body)
        setStartError('Failed to start generation. Missing job id from server.')
      }
    } catch (e) {
      console.error('Failed to start generation', e)
      setStartError('Failed to start generation. Please try again.')
    }
    finally { setStarting(false) }
  }

  return (
    <DashboardLayout title="Timetable Generator" subtitle="Configure and generate timetables using AI.">
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '420px 1fr' },
        gap: 2,
        alignItems: 'start',
      }}>
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 1, border: '1px solid rgba(0,0,0,0.06)' }}>
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6">Configuration</Typography>
            <Typography variant="body2" color="text.secondary">Set parameters and click Generate.</Typography>
          </Stack>
          <GeneratorInputForm onStart={handleStart} />
        </Paper>

        <Paper sx={{ p: 2, minHeight: 280, borderRadius: 3, boxShadow: 1, border: '1px solid rgba(0,0,0,0.06)' }}>
          {jobId ? (
            <GeneratorProgress jobId={jobId} />
          ) : (
            <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
              {starting ? (
                <Stack spacing={1} alignItems="center" color="text.secondary">
                  <CircularProgress size={22} />
                  <Typography variant="body2">Starting generation…</Typography>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">Ready to Generate</Typography>
              )}
              {startError && (
                <Alert severity="error" sx={{ mt: 2 }}>{startError}</Alert>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    </DashboardLayout>
  )
}

