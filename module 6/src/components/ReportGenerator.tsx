import React, { useState } from 'react';
import { FileText, Users, User, Building2, Calendar, Download } from 'lucide-react';
import { ReportTemplate } from '../types';
import PDFGenerator from '../utils/PDFGenerator';
import { sampleTimetable, faculty, students, rooms } from '../data/sampleData';

const ReportGenerator: React.FC = () => {
  const [selectedReportType, setSelectedReportType] = useState<string>('student');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('professional');
  const [selectedFilters, setSelectedFilters] = useState({
    semester: '',
    department: '',
    section: '',
    faculty: '',
    dateRange: { start: '', end: '' }
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    {
      id: 'student',
      name: 'Student Timetables',
      description: 'Individual student schedules with subject details',
      icon: User,
      color: 'bg-blue-500'
    },
    {
      id: 'faculty',
      name: 'Faculty Schedules',
      description: 'Teaching schedules and workload distribution',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      id: 'department',
      name: 'Department Overview',
      description: 'Complete department-wise timetable consolidation',
      icon: Building2,
      color: 'bg-purple-500'
    },
    {
      id: 'room',
      name: 'Room Utilization',
      description: 'Room-wise schedule and utilization reports',
      icon: Calendar,
      color: 'bg-orange-500'
    }
  ];

  const templates: ReportTemplate[] = [
    {
      id: 'professional',
      name: 'Professional Blue',
      type: 'student',
      layout: 'portrait',
      includeHeaders: true,
      includeFooters: true,
      colorScheme: 'blue'
    },
    {
      id: 'academic',
      name: 'Academic Green',
      type: 'faculty',
      layout: 'landscape',
      includeHeaders: true,
      includeFooters: true,
      colorScheme: 'green'
    },
    {
      id: 'minimal',
      name: 'Minimal Grey',
      type: 'department',
      layout: 'portrait',
      includeHeaders: false,
      includeFooters: false,
      colorScheme: 'grey'
    }
  ];

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const template = templates.find(t => t.id === selectedTemplate);
      const pdfGenerator = new PDFGenerator();
      
      switch (selectedReportType) {
        case 'student':
          await pdfGenerator.generateStudentTimetable(students[0], sampleTimetable, template);
          break;
        case 'faculty':
          await pdfGenerator.generateFacultySchedule(faculty[0], sampleTimetable, template);
          break;
        case 'department':
          await pdfGenerator.generateDepartmentReport('Computer Science', sampleTimetable, template);
          break;
        case 'room':
          await pdfGenerator.generateRoomUtilization(rooms[0], sampleTimetable, template);
          break;
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Report Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.id}
                onClick={() => setSelectedReportType(type.id)}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  selectedReportType === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg text-white ${type.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{type.name}</h3>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">{type.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Template Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Choose Template</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{template.name}</h3>
                <div className="flex space-x-1">
                  <div className={`w-3 h-3 rounded-full bg-${template.colorScheme}-500`}></div>
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Layout: {template.layout}</p>
                <p>Headers: {template.includeHeaders ? 'Yes' : 'No'}</p>
                <p>Footers: {template.includeFooters ? 'Yes' : 'No'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Filters & Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester
            </label>
            <select
              value={selectedFilters.semester}
              onChange={(e) => setSelectedFilters({...selectedFilters, semester: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={selectedFilters.department}
              onChange={(e) => setSelectedFilters({...selectedFilters, department: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics">Electronics</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <select
              value={selectedFilters.section}
              onChange={(e) => setSelectedFilters({...selectedFilters, section: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Generate Report</h3>
            <p className="text-sm text-gray-600">
              {selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} report using {templates.find(t => t.id === selectedTemplate)?.name} template
            </p>
          </div>
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Generate PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;