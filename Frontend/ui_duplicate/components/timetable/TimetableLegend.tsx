"use client"

import { Card, CardContent, CardHeader, Box, Typography, Chip } from "@mui/material"
import type { TimetableConfig } from "@/types/timetable"

interface TimetableLegendProps {
  config: TimetableConfig
}

export default function TimetableLegend({ config }: TimetableLegendProps) {
  const legendItems = [
    { type: "lecture", label: "Lecture", description: "Regular class sessions" },
    { type: "tutorial", label: "Tutorial", description: "Problem-solving sessions" },
    { type: "practical", label: "Practical", description: "Hands-on sessions" },
    { type: "lab", label: "Laboratory", description: "Lab experiments" },
    { type: "break", label: "Break", description: "Lunch/Tea break" },
    { type: "free", label: "Free Period", description: "No scheduled class" },
  ] as const

  return (
    <Card>
      <CardHeader title="Legend" subheader="Color coding for different session types" />
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {legendItems.map((item) => (
            <Box
              key={item.type}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 1,
                borderRadius: 1,
                backgroundColor: "rgba(0,0,0,0.02)",
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: 1,
                  backgroundColor: config.colorScheme[item.type],
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {item.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.description}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Quick Stats
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip label="6 Periods/Day" size="small" variant="outlined" />
            <Chip label="6 Working Days" size="small" variant="outlined" />
            <Chip label="36 Total Slots" size="small" variant="outlined" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
