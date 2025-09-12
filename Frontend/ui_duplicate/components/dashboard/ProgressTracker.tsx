"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Box,
  LinearProgress,
  Chip,
  Alert,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"

interface ProgressStep {
  label: string
  description: string
  status: "pending" | "in-progress" | "completed" | "error"
  progress?: number
  message?: string
}

export default function ProgressTracker() {
  const [activeStep, setActiveStep] = useState(0)
  const [steps, setSteps] = useState<ProgressStep[]>([
    {
      label: "Data Entry",
      description: "Collecting configuration and subject data",
      status: "completed",
      progress: 100,
      message: "Configuration saved successfully",
    },
    {
      label: "Data Validation",
      description: "Validating constraints and requirements",
      status: "completed",
      progress: 100,
      message: "All validations passed",
    },
    {
      label: "Algorithm Processing",
      description: "Running timetable generation algorithm",
      status: "in-progress",
      progress: 65,
      message: "Processing constraints and optimizing schedule...",
    },
    {
      label: "Conflict Resolution",
      description: "Resolving scheduling conflicts",
      status: "pending",
      progress: 0,
    },
    {
      label: "Timetable Ready",
      description: "Final timetable generated and ready for review",
      status: "pending",
      progress: 0,
    },
  ])

  const getStepIcon = (status: ProgressStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon color="success" />
      case "error":
        return <ErrorIcon color="error" />
      case "in-progress":
        return <HourglassEmptyIcon color="primary" />
      default:
        return null
    }
  }

  const getStatusChip = (status: ProgressStep["status"]) => {
    const statusConfig = {
      pending: { label: "Pending", color: "default" as const },
      "in-progress": { label: "In Progress", color: "primary" as const },
      completed: { label: "Completed", color: "success" as const },
      error: { label: "Error", color: "error" as const },
    }

    const config = statusConfig[status]
    return <Chip label={config.label} color={config.color} size="small" />
  }

  // Simulate progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSteps((prev) =>
        prev.map((step, index) => {
          if (step.status === "in-progress" && step.progress !== undefined && step.progress < 100) {
            return {
              ...step,
              progress: Math.min(step.progress + Math.random() * 10, 100),
            }
          }
          return step
        }),
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader title="Generation Progress" subheader="Track the current timetable generation status" />
      <CardContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label} completed={step.status === "completed"}>
              <StepLabel icon={getStepIcon(step.status)} error={step.status === "error"}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2">{step.label}</Typography>
                  {getStatusChip(step.status)}
                </Box>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {step.description}
                </Typography>

                {step.status === "in-progress" && step.progress !== undefined && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress variant="determinate" value={step.progress} sx={{ mb: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(step.progress)}% complete
                    </Typography>
                  </Box>
                )}

                {step.message && (
                  <Alert severity={step.status === "error" ? "error" : "info"} sx={{ mt: 1 }}>
                    {step.message}
                  </Alert>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </CardContent>
    </Card>
  )
}
