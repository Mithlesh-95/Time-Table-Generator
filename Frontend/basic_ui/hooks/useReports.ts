"use client"

import { useState } from "react"
import { reportsApi, type ExportRequest } from "@/lib/api/reports"
import type { ReportConfig, ReportData } from "@/types/reports"

export const useReports = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateReport = async (config: ReportConfig) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await reportsApi.generateReport(config)

      if (response.success) {
        setReportData(response.data)
        return response.data
      } else {
        throw new Error("Failed to generate report")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error occurred")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = async (request: ExportRequest) => {
    try {
      setIsExporting(true)
      setError(null)

      const response = await reportsApi.exportReport(request)

      if (response.success) {
        // Trigger download
        const link = document.createElement("a")
        link.href = response.data.downloadUrl
        link.download = response.data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        return response.data
      } else {
        throw new Error("Failed to export report")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error occurred")
      throw error
    } finally {
      setIsExporting(false)
    }
  }

  return {
    reportData,
    isLoading,
    isExporting,
    error,
    generateReport,
    exportReport,
  }
}
