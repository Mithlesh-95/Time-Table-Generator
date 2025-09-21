"use client"

import { Box, Typography, Button, Stack, TextField, Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from "@mui/material"
import DashboardLayout from "@/components/layout/DashboardLayout"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import BulkUploadDialog from "@/components/BulkUploadDialog"
import AddOneDialog, { type FieldDef } from "@/components/AddOneDialog"
import { getCollegeCode, subscribeCollegeCode } from "@/lib/college"
import LoadingOverlay from "@/components/LoadingOverlay"

export default function StudentsPage() {
  const [collegeCode, setCollegeCode] = useState<string>(getCollegeCode())
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState("")
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [current, setCurrent] = useState<any | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [toast, setToast] = useState<{open: boolean; msg: string; type: 'success'|'error'}>({open:false,msg:'',type:'success'})

  const openMenu = Boolean(anchorEl)
  const handleMenu = (e: React.MouseEvent<HTMLButtonElement>, row: any) => {
    setAnchorEl(e.currentTarget)
    setCurrent(row)
  }

  const addFields: FieldDef[] = [
    { name: 'enrollment_no', label: 'Enrollment No.' },
    { name: 'first_name', label: 'First Name' },
    { name: 'last_name', label: 'Last Name' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'current_semester', label: 'Semester' },
    { name: 'department_id', label: 'Department ID', placeholder: 'numeric id' },
  ]

  const onAddOne = async (values: Record<string, any>) => {
    await api.post("/students/", values)
    await fetchRows()
  }
  const closeMenu = () => setAnchorEl(null)

  const fetchRows = async () => {
    try {
      setLoading(true)
      if (!collegeCode) { setRows([]); return }
      const res = await api.get<any>("/students/", { 'department__college__code': collegeCode })
      const data = Array.isArray((res as any).data) ? (res as any).data : ((res as any).data?.results ?? [])
      setRows(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRows() }, [collegeCode])

  useEffect(() => {
    const unsub = subscribeCollegeCode((code) => setCollegeCode(code))
    return () => unsub()
  }, [])

  const filtered = useMemo(() => {
    if (!q) return rows
    const term = q.toLowerCase()
    return rows.filter((r: any) => `${r.enrollment_no ?? ''} ${r.first_name ?? ''} ${r.last_name ?? ''} ${r.email ?? ''}`.toLowerCase().includes(term))
  }, [rows, q])

  const onDelete = async () => {
    if (!current) return
    try {
      await api.delete(`/students/${current.id}/`)
      setConfirmOpen(false)
      setCurrent(null)
      await fetchRows()
    } catch (_) {
      setConfirmOpen(false)
    }
  }

  return (
    <DashboardLayout title="Student Management" subtitle="Manage student records and data.">
      <LoadingOverlay show={loading} message="Loading Students" />
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }} alignItems={{ md: "center" }}>
        <TextField size="small" placeholder="Search by name or roll no..." sx={{ flex: 1 }} value={q} onChange={(e) => setQ(e.target.value)} />
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => setBulkOpen(true)}>Bulk Upload</Button>
          <Button variant="contained" onClick={() => setAddOpen(true)}>Add Student</Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 0, borderRadius: 3, boxShadow: 1, border: "1px solid rgba(0,0,0,0.06)" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Roll No.</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((r: any) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.enrollment_no}</TableCell>
                <TableCell>{`${r.first_name} ${r.last_name}`}</TableCell>
                <TableCell>{r.current_semester}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={(e) => handleMenu(e, r)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary">No students found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Menu anchorEl={anchorEl} open={openMenu} onClose={closeMenu} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MenuItem onClick={() => { closeMenu(); /* TODO: navigate to edit form */ }}>Edit</MenuItem>
        <MenuItem onClick={() => { closeMenu(); setConfirmOpen(true) }} sx={{ color: 'error.main' }}>Delete</MenuItem>
      </Menu>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete Student</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Are you sure you want to delete <b>{current?.first_name} {current?.last_name}</b>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={onDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <BulkUploadDialog
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        endpoint="/students/bulk-upload/"
        templateUrl="/templates/students-template.csv"
        title="Bulk Upload Students"
        onCompleted={() => { setToast({open:true,msg:'Students uploaded',type:'success'}); fetchRows() }}
      />

      <AddOneDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Student"
        fields={addFields}
        onSubmit={onAddOne}
      />

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({...toast, open:false})}>
        <Alert onClose={() => setToast({...toast, open:false})} severity={toast.type} variant="filled">{toast.msg}</Alert>
      </Snackbar>
    </DashboardLayout>
  )
}

