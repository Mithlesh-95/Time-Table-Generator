"use client"

import { useState } from "react"
import { Box, Typography, Paper } from "@mui/material"
import Navigation from "@/components/Navigation"
import GeneratorInputForm, { type InputValues } from "@/components/generator/GeneratorInputForm"
import GeneratorProgress from "@/components/generator/GeneratorProgress"
import { generatorApi } from "@/lib/api"

export default function GeneratorPage() {
  const [jobId, setJobId] = useState<string | null>(null)

  const handleStart = async (values: InputValues) => {
    const res = await generatorApi.startGeneration({
      program: values.program,
      semester: values.semester,
      sections: values.sections,
      constraints: values.constraints,
    })
    setJobId(res.data.jobId)
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Timetable Generator
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Run AI/ML scheduling algorithm. Step-wise progress appears below.
        </Typography>

        {!jobId ? (
          <Paper sx={{ p: 2 }}>
            <GeneratorInputForm onStart={handleStart} />
          </Paper>
        ) : (
          <Paper sx={{ p: 2 }}>
            <GeneratorProgress jobId={jobId} />
          </Paper>
        )}
      </Box>
    </Box>
  )
}

