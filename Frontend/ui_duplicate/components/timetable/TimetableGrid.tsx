"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
  IconButton,
  Collapse,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import type { TimetableData, TimetableConfig, TimetableEntry } from "@/types/timetable"

interface TimetableGridProps {
  data: TimetableData
  config: TimetableConfig
  onCellClick?: (day: string, time: string) => void
  selectedCell?: { day: string; time: string } | null
}

export default function TimetableGrid({ data, config, onCellClick, selectedCell }: TimetableGridProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  const getCellStyle = (entry: TimetableEntry | undefined, day: string, time: string) => {
    const isSelected = selectedCell?.day === day && selectedCell?.time === time
    const backgroundColor = entry ? config.colorScheme[entry.type] : config.colorScheme.free

    return {
      backgroundColor,
      color: theme.palette.getContrastText(backgroundColor),
      cursor: "pointer",
      border: isSelected ? `2px solid ${theme.palette.primary.main}` : "1px solid #e0e0e0",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        transform: "scale(1.02)",
        boxShadow: theme.shadows[2],
      },
      minHeight: "80px",
      padding: theme.spacing(1),
    }
  }

  const renderCellContent = (entry: TimetableEntry | undefined) => {
    if (!entry || entry.type === "free") {
      return (
        <Typography variant="caption" color="text.secondary">
          Free
        </Typography>
      )
    }

    if (entry.type === "break") {
      return (
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="subtitle2" fontWeight="bold">
            BREAK
          </Typography>
        </Box>
      )
    }

    return (
      <Box>
        <Typography variant="subtitle2" fontWeight="bold" noWrap>
          {entry.subject}
        </Typography>
        <Typography variant="caption" display="block" noWrap>
          {entry.teacher}
        </Typography>
        <Typography variant="caption" display="block" noWrap>
          Room: {entry.room}
        </Typography>
        <Chip
          label={entry.type}
          size="small"
          sx={{
            mt: 0.5,
            fontSize: "0.7rem",
            height: "20px",
            backgroundColor: "rgba(255,255,255,0.2)",
          }}
        />
      </Box>
    )
  }

  // Mobile view with collapsible days
  if (isMobile) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {data.metadata.branch} - Semester {data.metadata.semester} - Section {data.metadata.section}
          </Typography>

          {config.workingDays.map((day) => (
            <Box key={day} sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1,
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  borderRadius: 1,
                  cursor: "pointer",
                }}
                onClick={() => setExpandedDay(expandedDay === day ? null : day)}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  {day}
                </Typography>
                <IconButton size="small" sx={{ color: "inherit" }}>
                  {expandedDay === day ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              <Collapse in={expandedDay === day}>
                <Box sx={{ mt: 1 }}>
                  {config.timeSlots.map((time) => {
                    const entry = data.schedule[day]?.[time]
                    return (
                      <Box
                        key={time}
                        sx={{
                          ...getCellStyle(entry, day, time),
                          mb: 1,
                          borderRadius: 1,
                          p: 2,
                        }}
                        onClick={() => onCellClick?.(day, time)}
                      >
                        <Typography variant="caption" fontWeight="bold" display="block">
                          {time}
                        </Typography>
                        {renderCellContent(entry)}
                      </Box>
                    )
                  })}
                </Box>
              </Collapse>
            </Box>
          ))}
        </CardContent>
      </Card>
    )
  }

  // Desktop view with full grid
  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {data.metadata.branch} - Semester {data.metadata.semester} - Section {data.metadata.section}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Academic Year: {data.metadata.academicYear}
          </Typography>
        </Box>

        <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflow: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", backgroundColor: theme.palette.grey[100] }}>Time / Day</TableCell>
                {config.workingDays.map((day) => (
                  <TableCell
                    key={day}
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: theme.palette.grey[100],
                      minWidth: "150px",
                    }}
                  >
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {config.timeSlots.map((time) => (
                <TableRow key={time}>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: theme.palette.grey[50],
                      position: "sticky",
                      left: 0,
                      zIndex: 1,
                    }}
                  >
                    {time}
                  </TableCell>
                  {config.workingDays.map((day) => {
                    const entry = data.schedule[day]?.[time]
                    return (
                      <TableCell
                        key={`${day}-${time}`}
                        sx={getCellStyle(entry, day, time)}
                        onClick={() => onCellClick?.(day, time)}
                      >
                        {renderCellContent(entry)}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}
