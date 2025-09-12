"use client"

import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Chip,
} from "@mui/material"
import type { ReportTemplate, ReportConfig } from "@/types/reports"

interface ReportTemplatesProps {
  selectedTemplate: string | null
  onTemplateSelect: (templateId: string) => void
  onConfigChange: (config: Partial<ReportConfig>) => void
}

const predefinedTemplates: ReportTemplate[] = [
  {
    id: "weekly-summary",
    name: "Weekly Timetable Summary",
    description: "Overview of all active timetables with utilization metrics",
    type: "timetable-summary",
    defaultConfig: {
      fields: ["semester", "branch", "section", "utilization", "status"],
      sortBy: "utilization",
      sortOrder: "desc",
    },
  },
  {
    id: "teacher-workload",
    name: "Teacher Workload Report",
    description: "Detailed analysis of teacher assignments and hours",
    type: "teacher-workload",
    defaultConfig: {
      fields: ["name", "department", "totalHours", "subjects"],
      sortBy: "totalHours",
      sortOrder: "desc",
    },
  },
  {
    id: "room-efficiency",
    name: "Room Efficiency Analysis",
    description: "Room utilization and capacity optimization report",
    type: "room-utilization",
    defaultConfig: {
      fields: ["number", "type", "capacity", "utilization"],
      sortBy: "utilization",
      sortOrder: "asc",
    },
  },
  {
    id: "semester-overview",
    name: "Semester Overview",
    description: "Complete semester timetable status and metrics",
    type: "timetable-summary",
    defaultConfig: {
      fields: ["semester", "branch", "section", "generatedDate", "status", "utilization"],
      sortBy: "semester",
      sortOrder: "asc",
    },
  },
]

export default function ReportTemplates({ selectedTemplate, onTemplateSelect, onConfigChange }: ReportTemplatesProps) {
  const handleTemplateClick = (template: ReportTemplate) => {
    onTemplateSelect(template.id)
    onConfigChange({
      type: template.type,
      ...template.defaultConfig,
    })
  }

  const getTypeColor = (type: ReportTemplate["type"]) => {
    const colors = {
      "timetable-summary": "primary",
      "teacher-workload": "secondary",
      "room-utilization": "success",
      "conflict-analysis": "warning",
    } as const

    return colors[type] || "default"
  }

  return (
    <Card>
      <CardHeader title="Report Templates" subheader="Quick start with predefined report configurations" />
      <CardContent sx={{ p: 0 }}>
        <List>
          {predefinedTemplates.map((template) => (
            <ListItem key={template.id} disablePadding>
              <ListItemButton selected={selectedTemplate === template.id} onClick={() => handleTemplateClick(template)}>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2">{template.name}</Typography>
                      <Chip label={template.type.replace("-", " ")} size="small" color={getTypeColor(template.type)} />
                    </Box>
                  }
                  secondary={template.description}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}
