"use client"

import { PropsWithChildren, useEffect, useMemo, useState } from "react"
import { Box, Typography, IconButton, Avatar, Menu, MenuItem, Tooltip, Stack, Divider } from "@mui/material"
import Sidebar from "@/components/Sidebar"
import { parseJwt, getCollegeCode, setCollegeCode } from "@/lib/college"
import { api } from "@/lib/api"

export default function DashboardLayout({ title, subtitle, children }: PropsWithChildren & { title: string; subtitle?: string }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const user = useMemo(() => {
    if (typeof window === 'undefined') return { name: 'User', email: '' }
    const token = localStorage.getItem('access_token')
    const payload = parseJwt(token)
    const name = payload?.name || payload?.username || payload?.email || 'User'
    const email = payload?.email || ''
    return { name, email }
  }, [])

  const initials = useMemo(() => {
    const parts = String(user.name || '').trim().split(/\s+/)
    const first = parts[0]?.[0] || 'U'
    const second = parts[1]?.[0] || ''
    return (first + second).toUpperCase()
  }, [user.name])

  const onLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('college_code')
      window.location.href = '/login/index.html'
    }
  }

  // Ensure college_code is available after login
  useEffect(() => {
    let alive = true
    const ensureCollege = async () => {
      if (typeof window === 'undefined') return
      const token = localStorage.getItem('access_token')
      const existing = getCollegeCode()
      if (!token) return
      if (existing && existing.trim()) return
      try {
        const res: any = await api.get<any>("/auth/me/")
        let code: any = (res as any)?.data?.college_code || (res as any)?.data?.college || ''
        if (code && typeof code === 'object' && typeof code.code === 'string') code = code.code
        if (alive && typeof code === 'string' && code.trim()) setCollegeCode(code.trim())
      } catch {
        // ignore
      }
    }
    ensureCollege()
    return () => { alive = false }
  }, [])

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "linear-gradient(180deg, #f6f9ff 0%, #ffffff 60%)" }}>
      <Sidebar />
      <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>{title}</Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
            )}
          </Box>
          <Box>
            <Tooltip title={user.email || user.name}>
              <IconButton onClick={handleOpen} size="small" sx={{ ml: 1 }} aria-controls={open ? 'user-menu' : undefined} aria-haspopup="true" aria-expanded={open ? 'true' : undefined}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: '#4F46E5' }}>{initials}</Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              id="user-menu"
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem disabled>Settings (coming soon)</MenuItem>
              <Divider />
              <MenuItem onClick={onLogout} sx={{ color: 'error.main' }}>Logout</MenuItem>
            </Menu>
          </Box>
        </Stack>
        <Box sx={{ maxWidth: 1200 }}>{children}</Box>
      </Box>
    </Box>
  )
}
