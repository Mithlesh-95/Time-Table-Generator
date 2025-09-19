"use client"

import { useState } from "react"
import { Box, TextField, Button, Stack, MenuItem, Typography } from "@mui/material"

export interface InputValues {
  program: string
  semester: string
  sections: string[]
  constraints: Record<string, any>
}

export default function GeneratorInputForm({ onStart }: { onStart: (values: InputValues) => void }) {
  const [program, setProgram] = useState("")
  const [semester, setSemester] = useState("")
  const [sections, setSections] = useState<string>("")
  const [constraints, setConstraints] = useState<string>("{}")

  const handleSubmit = () => {
    let parsed: Record<string, any> = {}
    try {
      parsed = JSON.parse(constraints || "{}")
    } catch (e) {
      alert("Constraints must be valid JSON")
      return
    }
    const sectionList = sections
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    onStart({ program, semester, sections: sectionList, constraints: parsed })
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configure Generation
      </Typography>
      <Stack spacing={2} direction={{ xs: "column", sm: "row" }} sx={{ mb: 2 }}>
        <TextField select label="Program" value={program} onChange={(e) => setProgram(e.target.value)} fullWidth size="small">
          <MenuItem value="B.Ed.">B.Ed.</MenuItem>
          <MenuItem value="M.Ed.">M.Ed.</MenuItem>
          <MenuItem value="FYUP">FYUP</MenuItem>
          <MenuItem value="ITEP">ITEP</MenuItem>
        </TextField>
        <TextField
          select
          label="Semester"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          fullWidth
          size="small"
        >
          <MenuItem value="Jan–May 2025">Jan–May 2025</MenuItem>
          <MenuItem value="Aug–Dec 2025">Aug–Dec 2025</MenuItem>
        </TextField>
      </Stack>
      <Stack spacing={2}>
        <TextField
          label="Sections (comma separated)"
          placeholder="e.g., A, B, C"
          value={sections}
          onChange={(e) => setSections(e.target.value)}
          size="small"
          fullWidth
        />
        <TextField
          label="Constraints (JSON)"
          placeholder='{"no_classes_after": "16:00"}'
          value={constraints}
          onChange={(e) => setConstraints(e.target.value)}
          multiline
          minRows={3}
          fullWidth
        />
        <Box>
          <Button variant="contained" onClick={handleSubmit} disabled={!program || !semester}>
            Start Generation
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
