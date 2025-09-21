"use client"

import { useState } from "react"
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Alert, LinearProgress } from "@mui/material"

export type FieldDef = { name: string; label: string; type?: string; placeholder?: string }

export default function AddOneDialog({
  open,
  title,
  fields,
  onClose,
  onSubmit,
}: {
  open: boolean
  title: string
  fields: FieldDef[]
  onClose: () => void
  onSubmit: (values: Record<string, any>) => Promise<void>
}) {
  const [values, setValues] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleChange = (name: string, val: any) => setValues((v) => ({ ...v, [name]: val }))

  const submit = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      await onSubmit(values)
      setSuccess("Saved successfully")
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Save failed")
    } finally {
      setLoading(false)
    }
  }

  const close = () => {
    if (loading) return
    setValues({})
    setError(null)
    setSuccess(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {loading && <LinearProgress />}
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          {fields.map((f) => (
            <TextField
              key={f.name}
              label={f.label}
              placeholder={f.placeholder}
              type={f.type || "text"}
              size="small"
              value={values[f.name] ?? ""}
              onChange={(e) => handleChange(f.name, e.target.value)}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={loading}>Close</Button>
        <Button variant="contained" onClick={submit} disabled={loading}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}
