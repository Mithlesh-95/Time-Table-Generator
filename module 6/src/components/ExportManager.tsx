import React, { useState } from 'react';
import { FileSpreadsheet, FileText, Database, Download, Calendar, Clock } from 'lucide-react';
import ExcelExporter from '../utils/ExcelExporter';
import CSVExporter from '../utils/CSVExporter';
import { sampleTimetable, faculty, students, rooms } from '../data/sampleData';

const ExportManager: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<string>('excel');
  const [selectedData, setSelectedData] = useState<string>('timetable');
  const [isExporting, setIsExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState([
    {
      id: '1',
      format: 'Excel',
      dataType: 'Student Timetables',
      timestamp: '2024-01-15 14:30:00',
      size: '2.3 MB',
      status: 'completed'
    },
    {
      id: '2',
      format: 'CSV',
      dataType: 'Faculty Data',
      timestamp: '2024-01-15 12:15:00',
      size: '156 KB',
      status: 'completed'
    },
    {
      id: '3',
      format: 'PDF',
      dataType: 'Room Utilization',
      timestamp: '2024-01-14 16:45:00',
      size: '1.8 MB',
      status: 'completed'
    }
  ]);

  const exportFormats = [
    {
      id: 'excel',
      name: 'Excel (XLSX)',
      description: 'Advanced formatting, charts, and formulas',
      icon: FileSpreadsheet,
      color: 'bg-green-500'
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Simple comma-separated values for data analysis',
      icon: Database,
      color: 'bg-blue-500'
    },
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Professional formatted reports',
      icon: FileText,
      color: 'bg-red-500'
    }
  ];

  const dataTypes = [
    {
      id: 'timetable',
      name: 'Complete Timetable',
      description: 'All timetable entries with full details',
      records: sampleTimetable.length
    },
    {
      id: 'faculty',
      name: 'Faculty Information',
      description: 'Faculty profiles and assignments',
      records: faculty.length
    },
    {
      id: 'students',
      name: 'Student Records',
      description: 'Student information and enrollments',
      records: students.length
    },
    {
      id: 'rooms',
      name: 'Room Details',
      description: 'Room information and capacities',
      records: rooms.length
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let exporter;
      let filename = '';

      if (selectedFormat === 'excel') {
        exporter = new ExcelExporter();
        filename = `${selectedData}_export_${new Date().getTime()}.xlsx`;
      } else if (selectedFormat === 'csv') {
        exporter = new CSVExporter();
        filename = `${selectedData}_export_${new Date().getTime()}.csv`;
      }

      if (exporter) {
        switch (selectedData) {
          case 'timetable':
            await exporter.exportTimetable(sampleTimetable, filename);
            break;
          case 'faculty':
            await exporter.exportFaculty(faculty, filename);
            break;
          case 'students':
            await exporter.exportStudents(students, filename);
            break;
          case 'rooms':
            await exporter.exportRooms(rooms, filename);
            break;
        }

        // Add to export history
        const newExport = {
          id: Date.now().toString(),
          format: selectedFormat === 'excel' ? 'Excel' : 'CSV',
          dataType: dataTypes.find(d => d.id === selectedData)?.name || 'Unknown',
          timestamp: new Date().toLocaleString(),
          size: Math.random() * 5 > 2.5 ? `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9)} MB` : `${Math.floor(Math.random() * 500) + 50} KB`,
          status: 'completed'
        };

        setExportHistory([newExport, ...exportHistory]);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Export Configuration</h2>
        
        {/* Format Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Select Export Format</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exportFormats.map((format) => {
              const Icon = format.icon;
              return (
                <div
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    selectedFormat === format.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg text-white ${format.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{format.name}</h4>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{format.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Type Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Select Data to Export</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataTypes.map((dataType) => (
              <div
                key={dataType.id}
                onClick={() => setSelectedData(dataType.id)}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  selectedData === dataType.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{dataType.name}</h4>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {dataType.records} records
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{dataType.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Export Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm text-gray-600">Include headers</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm text-gray-600">Include timestamps</span>
              </label>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-600">Compress files</span>
              </label>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Ready to Export</h4>
            <p className="text-sm text-gray-600">
              {dataTypes.find(d => d.id === selectedData)?.name} as {exportFormats.find(f => f.id === selectedFormat)?.name}
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export History */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Export History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Format
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exportHistory.map((exportItem) => (
                <tr key={exportItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {exportItem.format === 'Excel' ? (
                        <FileSpreadsheet className="h-5 w-5 text-green-500 mr-2" />
                      ) : exportItem.format === 'CSV' ? (
                        <Database className="h-5 w-5 text-blue-500 mr-2" />
                      ) : (
                        <FileText className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className="text-sm font-medium text-gray-900">{exportItem.format}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exportItem.dataType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {exportItem.timestamp}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exportItem.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {exportItem.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExportManager;