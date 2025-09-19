"use client"

import React, { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    try {
      if (typeof window === "undefined") return

      // Capture tokens from URL hash or query if present
      const url = new URL(window.location.href)
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""))
      const q = url.searchParams
      const access = hash.get("access") || q.get("access")
      const refresh = hash.get("refresh") || q.get("refresh")
      if (access) {
        localStorage.setItem("access_token", access)
      }
      if (refresh) {
        localStorage.setItem("refresh_token", refresh)
      }
      if (access || refresh) {
        // Clean hash/query from URL without reloading
        const cleanUrl = `${url.origin}${url.pathname}${url.search ? "" : ""}`
        window.history.replaceState({}, document.title, cleanUrl)
      }

      const token = localStorage.getItem("access_token")
      if (!token) {
        // Redirect to the Next.js hosted login page
        window.location.href = "/login/index.html"
        return
      }
    } catch (_) {
      window.location.href = "/login/index.html"
    }
  }, [router])

  return <>{children}</>
}
