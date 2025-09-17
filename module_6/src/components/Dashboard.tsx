import React, { useState } from 'react';
import { Calendar, FileText, BarChart3, Mail, Download, Settings } from 'lucide-react';
import ReportGenerator from './ReportGenerator';
import AnalyticsDashboard from './AnalyticsDashboard';
import ExportManager from './ExportManager';
import EmailDistribution from './EmailDistribution';

type TabType = 'reports' | 'analytics' | 'exports' | 'email' | 'settings';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('reports');

  const tabs = [
    { id: 'reports', label: 'Report Generation', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'exports', label: 'Export Manager', icon: Download },
    { id: 'email', label: 'Email Distribution', icon: Mail },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'reports':
        return <ReportGenerator />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'exports':
        return <ExportManager />;
      case 'email':
        return <EmailDistribution />;
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">System Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  College Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter college name"
                  defaultValue="University College of Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2024-2025"
                  defaultValue="2024-2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Report Template
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Professional Blue</option>
                  <option>Academic Green</option>
                  <option>Minimal Grey</option>
                </select>
              </div>
            </div>
          </div>
        );
      default:
        return <ReportGenerator />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Timetable Management System
                </h1>
                <p className="text-sm text-gray-600">
                  Report Generation & Integration Platform
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Academic Year</p>
                <p className="font-semibold text-gray-900">2024-2025</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main>{renderContent()}</main>
      </div>
    </div>
  );
};

export default Dashboard;