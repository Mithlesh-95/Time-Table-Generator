"use client"

import { useState } from "react"
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography, Alert, LinearProgress } from "@mui/material"
import { apiClient } from "@/lib/api"
import { getCollegeCode } from "@/lib/college"

export default function BulkUploadDialog({
  open,
  onClose,
  endpoint,
  templateUrl,
  onCompleted,
  title = "Bulk Upload",
}: {
  open: boolean
  onClose: () => void
  endpoint: string // e.g., "/students/bulk-upload/"
  templateUrl: string // e.g., "/templates/students-template.csv"
  onCompleted?: (result?: any) => void
  title?: string
}) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any | null>(null)

  const onUpload = async () => {
    if (!file) return
    try {
      setLoading(true)
      setError(null)
      setResult(null)
      const form = new FormData()
      form.append("file", file)
      const collegeCode = getCollegeCode()
      form.append("college_code", collegeCode)
      const res = await apiClient.post(endpoint, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setResult(res.data)
      onCompleted?.(res.data)
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setError(null)
    setResult(null)
  }

  return (
    <Dialog open={open} onClose={() => { if (!loading) { reset(); onClose() }}} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2">Select a CSV or XLSX file. You can download a sample template below.</Typography>
          {loading && <LinearProgress />}
          {error && <Alert severity="error">{error}</Alert>}
          {result && <Alert severity="success">Uploaded successfully.</Alert>}
          <input type="file" accept=".csv,.xlsx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <Button variant="outlined" href={templateUrl} download>Download Sample Template</Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => { reset(); onClose() }} disabled={loading}>Close</Button>
        <Button variant="contained" onClick={onUpload} disabled={!file || loading}>Upload</Button>
      </DialogActions>
    </Dialog>
  )
}
