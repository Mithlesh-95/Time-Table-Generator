"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
  Chip,
  FormHelperText,
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import SaveIcon from "@mui/icons-material/Save"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"

interface FormData {
  academicYear: string
  semester: string
  branch: string
  section: string
  startDate: Date | null
  endDate: Date | null
  workingDays: string[]
  periodsPerDay: number
  periodDuration: number
}

interface FormErrors {
  [key: string]: string
}

const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"]
const branches = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil", "Electrical"]
const sections = ["A", "B", "C", "D"]
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function ConfigurationForm() {
  const [formData, setFormData] = useState<FormData>({
    academicYear: "",
    semester: "",
    branch: "",
    section: "",
    startDate: null,
    endDate: null,
    workingDays: [],
    periodsPerDay: 6,
    periodDuration: 50,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.academicYear) newErrors.academicYear = "Academic year is required"
    if (!formData.semester) newErrors.semester = "Semester is required"
    if (!formData.branch) newErrors.branch = "Branch is required"
    if (!formData.section) newErrors.section = "Section is required"
    if (!formData.startDate) newErrors.startDate = "Start date is required"
    if (!formData.endDate) newErrors.endDate = "End date is required"
    if (formData.workingDays.length === 0) newErrors.workingDays = "At least one working day must be selected"
    if (formData.periodsPerDay < 1 || formData.periodsPerDay > 10) {
      newErrors.periodsPerDay = "Periods per day must be between 1 and 10"
    }
    if (formData.periodDuration < 30 || formData.periodDuration > 120) {
      newErrors.periodDuration = "Period duration must be between 30 and 120 minutes"
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = "End date must be after start date"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (generateTimetable = false) => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // API call placeholder - replace with actual API integration
      console.log("Submitting configuration:", formData)

      if (generateTimetable) {
        // Trigger timetable generation
        console.log("Starting timetable generation...")
      }

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWorkingDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }))
  }

  return (
    <Card>
      <CardHeader title="Timetable Configuration" subheader="Configure the basic parameters for timetable generation" />
      <CardContent>
        <Grid container spacing={3}>
          {/* Academic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Academic Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Academic Year"
              placeholder="e.g., 2024-25"
              value={formData.academicYear}
              onChange={(e) => setFormData((prev) => ({ ...prev, academicYear: e.target.value }))}
              error={!!errors.academicYear}
              helperText={errors.academicYear}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.semester}>
              <InputLabel>Semester</InputLabel>
              <Select
                value={formData.semester}
                label="Semester"
                onChange={(e) => setFormData((prev) => ({ ...prev, semester: e.target.value }))}
              >
                {semesters.map((sem) => (
                  <MenuItem key={sem} value={sem}>
                    Semester {sem}
                  </MenuItem>
                ))}
              </Select>
              {errors.semester && <FormHelperText>{errors.semester}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.branch}>
              <InputLabel>Branch</InputLabel>
              <Select
                value={formData.branch}
                label="Branch"
                onChange={(e) => setFormData((prev) => ({ ...prev, branch: e.target.value }))}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch} value={branch}>
                    {branch}
                  </MenuItem>
                ))}
              </Select>
              {errors.branch && <FormHelperText>{errors.branch}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.section}>
              <InputLabel>Section</InputLabel>
              <Select
                value={formData.section}
                label="Section"
                onChange={(e) => setFormData((prev) => ({ ...prev, section: e.target.value }))}
              >
                {sections.map((section) => (
                  <MenuItem key={section} value={section}>
                    Section {section}
                  </MenuItem>
                ))}
              </Select>
              {errors.section && <FormHelperText>{errors.section}</FormHelperText>}
            </FormControl>
          </Grid>

          {/* Schedule Configuration */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Schedule Configuration
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Semester Start Date"
                value={formData.startDate}
                onChange={(date) => setFormData((prev) => ({ ...prev, startDate: date }))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.startDate,
                    helperText: errors.startDate,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Semester End Date"
                value={formData.endDate}
                onChange={(date) => setFormData((prev) => ({ ...prev, endDate: date }))}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.endDate,
                    helperText: errors.endDate,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Working Days
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {weekDays.map((day) => (
                <Chip
                  key={day}
                  label={day}
                  clickable
                  color={formData.workingDays.includes(day) ? "primary" : "default"}
                  onClick={() => handleWorkingDayToggle(day)}
                />
              ))}
            </Box>
            {errors.workingDays && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>
                {errors.workingDays}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Periods per Day"
              value={formData.periodsPerDay}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, periodsPerDay: Number.parseInt(e.target.value) || 0 }))
              }
              error={!!errors.periodsPerDay}
              helperText={errors.periodsPerDay}
              inputProps={{ min: 1, max: 10 }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Period Duration (minutes)"
              value={formData.periodDuration}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, periodDuration: Number.parseInt(e.target.value) || 0 }))
              }
              error={!!errors.periodDuration}
              helperText={errors.periodDuration}
              inputProps={{ min: 30, max: 120 }}
            />
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
              >
                Save Configuration
              </Button>
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
              >
                Generate Timetable
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
