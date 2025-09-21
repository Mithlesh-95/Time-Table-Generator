"use client"

import { useEffect, useMemo, useState } from "react"
import { Box, LinearProgress, Typography, Stack, Button, List, ListItem, ListItemText, Alert, ListItemIcon, CircularProgress, Divider } from "@mui/material"
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import GeneratorStepper from "./GeneratorStepper"
import { apiClient } from "@/lib/api"
import { timetableApi } from "@/lib/api/timetable"
import { useRouter } from "next/navigation"

type Step = "input_validation" | "generation" | "conflict_check" | "success" | "failed"
function stepToIndex(step: Step) {
  switch (step) {
    case "input_validation":
      return 0
    case "generation":
      return 1
    case "conflict_check":
      return 2
    case "success":
      return 3
    case "failed":
      return 2
    default:
      return 0
  }
}

export default function GeneratorProgress({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<{ step: Step; progress: number; conflicts?: any[]; result?: any; error?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [serverMessage, setServerMessage] = useState<string | null>(null)
  const [polling, setPolling] = useState(true)
  const [savedId, setSavedId] = useState<number | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [debug, setDebug] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // pick debug flag from localStorage so users can toggle without rebuilds
    if (typeof window !== 'undefined') {
      setDebug(localStorage.getItem('debug_generation') === '1')
    }
    let alive = true
    let timer: NodeJS.Timeout

    const poll = async () => {
      try {
        const res = await timetableApi.getGenerationStatus(jobId)
        if (!alive) return
        const body: any = (res as any)?.data ?? res
        // Some backends wrap ApiResponse twice: { success, data: { success, data: {...} } }
        const payload: any = body?.data?.data ?? body?.data ?? body
        const rawStep: string | undefined = (payload?.step || payload?.status || payload?.state || '').toString().toLowerCase()
        const normStep: Step = (
          rawStep === 'success' || rawStep === 'completed' ? 'success' :
          rawStep === 'failed' || rawStep === 'error' ? 'failed' :
          rawStep === 'conflict_check' || rawStep === 'conflicts' ? 'conflict_check' :
          rawStep === 'input_validation' || rawStep === 'validating' || rawStep === 'pending' ? 'input_validation' :
          /* processing, running, generating */ 'generation'
        )
        const prog: number = Number(payload?.progress ?? payload?.percentage ?? payload?.percent ?? 0)
        const conflicts = payload?.conflicts ?? payload?.issues ?? []
        let result = payload?.result ?? payload?.timetable ?? payload?.data?.result
        // Completion/Failure heuristics
        const completedFlag = Boolean(payload?.completed || payload?.done || payload?.finished)
        const errorFlag = Boolean(payload?.error || payload?.failed)
        let finalStep = normStep
        const clamped = isNaN(prog) ? 0 : Math.max(0, Math.min(100, prog))
        if (errorFlag) finalStep = 'failed'
        else if (completedFlag || clamped >= 100 || rawStep === 'success' || rawStep === 'completed') finalStep = 'success'
        // If completed but only a resultUrl is present, fetch it
        const resultUrl: string | undefined = payload?.resultUrl || payload?.result_url
        if (finalStep === 'success' && !result && resultUrl) {
          try {
            const rr = await apiClient.get(resultUrl)
            // try common shapes: direct data or ApiResponse
            result = rr?.data?.data ?? rr?.data ?? rr
          } catch (e) {
            // ignore, UI will still show success w/o auto-save
          }
        }
        const norm = { step: finalStep, progress: finalStep === 'success' ? 100 : clamped, conflicts, result }
        setServerMessage(payload?.message || payload?.detail || null)
        setStatus(norm)
        setAttempts((a) => a + 1)
        if (norm.step === "success" || norm.step === "failed") {
          setPolling(false)
          // On success, save timetable entity if result present
          if (norm.step === 'success' && result) {
            try {
              // cache locally so View page can show immediately even if save fails
              if (typeof window !== 'undefined') {
                localStorage.setItem('last_generated_result', JSON.stringify(result))
                try { console.debug('[Generator] Cached last_generated_result') } catch {}
              }
              const raw = typeof window !== 'undefined' ? localStorage.getItem('last_generation_request') : null
              const cfg = raw ? JSON.parse(raw) : null
              if (cfg) {
                const payload = {
                  department_id: cfg.department_id,
                  section_letter: cfg.section_letter,
                  year: cfg.year,
                  semester: cfg.semester,
                  academic_year: cfg.academic_year,
                  data: result,
                }
                const saved = await timetableApi.saveTimetable(payload as any)
                if (saved?.data?.id) {
                  const newId = (saved.data as any).id
                  setSavedId(newId)
                  try { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('timetables_updated', { detail: { id: newId } })) } catch {}
                }
              }
            } catch (e) {
              // ignore save errors but keep view enabled
            }
          }
          return
        }
      } catch (e: any) {
        if (!alive) return
        setError(e?.message || "Failed to fetch status")
        setPolling(false)
        return
      }
      // Stop polling after ~3 minutes (120 attempts * 1.5s)
      if (attempts > 120) {
        setPolling(false)
        return
      }
      timer = setTimeout(poll, 1500)
    }
    poll()
    return () => {
      alive = false
      if (timer) clearTimeout(timer)
    }
  }, [jobId])

  const activeStep = useMemo(() => {
    const s = (status?.step as Step | undefined) ?? 'input_validation'
    return stepToIndex(s)
  }, [status])

  const stages = useMemo(() => {
    const p = status?.progress ?? 0
    const step = status?.step
    let idx = 0
    // Prefer step-based index first
    if (step === 'input_validation') idx = 0
    else if (step === 'generation') idx = 3
    else if (step === 'conflict_check') idx = 4
    else if (step === 'success') idx = 5
    else if (step === 'failed') idx = 3
    // If still early and progress available, nudge earlier stages visually
    if (idx === 0) {
      if (p >= 15) idx = 1
      if (p >= 30) idx = 2
    }
    const labels = [
      'Fetching faculty',
      'Fetching subjects & course hours',
      'Fetching rooms & labs',
      'Generating schedule',
      'Conflict check',
    ]
    return labels.map((label, i) => ({
      label,
      done: i < idx && step !== 'failed',
      active: i === idx && step !== 'failed' && step !== 'success',
    }))
  }, [status])

  return (
    <Box>
      <GeneratorStepper activeStep={activeStep} />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {status && status.step != null ? `Step: ${String(status.step).replace(/_/g, " ")} (${status.progress ?? 0}%)` : "Starting..."}
        </Typography>
        <LinearProgress variant={status ? "determinate" : "indeterminate"} value={status?.progress ?? 10} />
        {serverMessage && (
          <Typography variant="caption" color="text.secondary">{serverMessage}</Typography>
        )}
      </Stack>

      {/* Staged task progress with animated indicators */}
      <Box sx={{ mb: 1 }}>
        <List dense disablePadding>
          {stages.map((s, i) => (
            <ListItem key={i} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                {s.done ? (
                  <CheckCircleOutlineIcon color="success" fontSize="small" />
                ) : s.active ? (
                  <CircularProgress size={14} />
                ) : (
                  <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={s.label} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Divider sx={{ my: 2 }} />

      {/* Controls */}
      {status?.step !== 'success' && status?.step !== 'failed' && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {polling ? (
            <Button size="small" color="warning" variant="outlined" onClick={async () => { await timetableApi.cancelGeneration(jobId).catch(() => {}); setPolling(false) }}>Cancel</Button>
          ) : (
            <Button size="small" variant="contained" onClick={() => { setAttempts(0); setPolling(true); /* restart loop */ (async()=>{})() }}>Resume</Button>
          )}
          <Button size="small" variant="text" onClick={() => { setAttempts(0); /* immediate re-poll */ }}>{polling ? 'Working…' : 'Retry'}</Button>
          <Button size="small" variant="text" onClick={() => { const next = !debug; setDebug(next); if (typeof window !== 'undefined') localStorage.setItem('debug_generation', next ? '1' : '0') }}>
            {debug ? 'Hide raw status' : 'Show raw status'}
          </Button>
        </Stack>
      )}

      {(!polling && status?.step === 'generation') && (
        <Alert severity="info" sx={{ mt: 2 }}>Generation is still running on the server. You can Resume to continue polling or Cancel to stop waiting.</Alert>
      )}

      {(debug || Boolean(process?.env?.NEXT_PUBLIC_DEBUG_GEN)) && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">Debug status:</Typography>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 11 }}>{JSON.stringify(status, null, 2)}</pre>
        </Box>
      )}

      {status?.step === "conflict_check" && status?.conflicts && status.conflicts.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Conflicts Found
          </Typography>
          <List dense>
            {status.conflicts.map((c) => (
              <ListItem key={c.id} sx={{ px: 0 }}>
                <ListItemText primary={`${c.type}: ${c.message}`} secondary={c.suggestedFix || ""} />
              </ListItem>
            ))}
          </List>
          <Button color="warning" variant="outlined" onClick={() => router.push("/conflicts")}>View Conflict Reports</Button>
        </Box>
      )}

      {status?.step === "success" && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => router.push("/timetable")}>View Timetable</Button>
          {savedId && (
            <Button variant="outlined" onClick={() => router.push(`/timetable?id=${savedId}`)}>
              Open Saved
            </Button>
          )}
        </Stack>
      )}

      {!polling && status?.step === "failed" && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {status?.error || "Generation failed"}
        </Alert>
      )}
    </Box>
  )
}
