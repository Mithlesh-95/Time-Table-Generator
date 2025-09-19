"use client"

import { useEffect, useMemo, useState } from "react"
import { Box, LinearProgress, Typography, Stack, Button, List, ListItem, ListItemText, Alert } from "@mui/material"
import GeneratorStepper from "./GeneratorStepper"
import { generatorApi, GenerationStatusResponse } from "@/lib/api"
import { useRouter } from "next/navigation"

function stepToIndex(step: GenerationStatusResponse["step"]) {
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
  const [status, setStatus] = useState<GenerationStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [polling, setPolling] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let alive = true
    let timer: NodeJS.Timeout

    const poll = async () => {
      try {
        const res = await generatorApi.getGenerationStatus(jobId)
        if (!alive) return
        setStatus(res.data)
        if (res.data.step === "success" || res.data.step === "failed") {
          setPolling(false)
          return
        }
      } catch (e: any) {
        if (!alive) return
        setError(e?.message || "Failed to fetch status")
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

  const activeStep = useMemo(() => (status ? stepToIndex(status.step) : 0), [status])

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
          {status ? `Step: ${status.step.replace("_", " ")} (${status.progress}%)` : "Starting..."}
        </Typography>
        <LinearProgress variant={status ? "determinate" : "indeterminate"} value={status?.progress ?? 10} />
      </Stack>

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
          {status.resultUrl && (
            <Button variant="outlined" href={status.resultUrl} target="_blank" rel="noreferrer">
              Download Result
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
