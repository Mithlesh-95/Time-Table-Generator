"use client"

import { Stepper, Step, StepLabel } from "@mui/material"

export interface GeneratorStepProps {
  activeStep: number
}

const steps = ["Input Validation", "Generation", "Conflict Check", "Success"]

export default function GeneratorStepper({ activeStep }: GeneratorStepProps) {
  return (
    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
      {steps.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  )
}
