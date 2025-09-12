"use client"

import { useState, useEffect } from "react"
import { timetableApi, type TimetableGenerationRequest, type TimetableGenerationResponse } from "@/lib/api/timetable"
import type { TimetableData } from "@/types/timetable"

export const useTimetableGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStatus, setGenerationStatus] = useState<TimetableGenerationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateTimetable = async (request: TimetableGenerationRequest) => {
    try {
      setIsGenerating(true)
      setError(null)

      const response = await timetableApi.generateTimetable(request)

      if (response.success) {
        setGenerationStatus(response.data)

        // Poll for status updates
        const pollInterval = setInterval(async () => {
          try {
            const statusResponse = await timetableApi.getGenerationStatus(response.data.id)

            if (statusResponse.success) {
              setGenerationStatus(statusResponse.data)

              if (statusResponse.data.status === "completed" || statusResponse.data.status === "failed") {
                clearInterval(pollInterval)
                setIsGenerating(false)
              }
            }
          } catch (error) {
            console.error("Error polling status:", error)
            clearInterval(pollInterval)
            setIsGenerating(false)
          }
        }, 2000)

        return response.data
      } else {
        throw new Error("Failed to start timetable generation")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error occurred")
      setIsGenerating(false)
      throw error
    }
  }

  return {
    generateTimetable,
    isGenerating,
    generationStatus,
    error,
  }
}

export const useTimetableData = (id?: string) => {
  const [timetableData, setTimetableData] = useState<TimetableData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTimetable = async (timetableId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await timetableApi.getTimetable(timetableId)

      if (response.success) {
        setTimetableData(response.data)
      } else {
        throw new Error("Failed to fetch timetable")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const updateTimetable = async (updates: Partial<TimetableData>) => {
    if (!id) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await timetableApi.updateTimetable(id, updates)

      if (response.success) {
        setTimetableData(response.data)
      } else {
        throw new Error("Failed to update timetable")
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchTimetable(id)
    }
  }, [id])

  return {
    timetableData,
    isLoading,
    error,
    fetchTimetable,
    updateTimetable,
  }
}
