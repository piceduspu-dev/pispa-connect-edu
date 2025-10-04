'use client';

import { useState } from 'react';
import { User } from '@/types/user';
import { FileUpload } from '@/components/admin/FileUpload';
import { FileList } from '@/components/admin/FileList';

interface AdminDashboardProps {
  user: User;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function AdminDashboard({ user, activeView, onViewChange }: AdminDashboardProps) {
  // Navigation tabs for admin dashboard
  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'students', label: 'Students', icon: 'fas fa-users' },
    { id: 'materials', label: 'Materials', icon: 'fas fa-book' },
    { id: 'activities', label: 'Activities', icon: 'fas fa-calendar' },
    { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-bar' },
  ];

  // State for file management
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Mock data for dashboard
  const stats = {
    totalStudents: 156,
    activeStudents: 142,
    totalMaterials: 24,
    upcomingActivities: 8,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-medium text-gray-900">
              Welcome, Admin {user.displayName}!
            </h2>
            <p className="text-gray-600 mt-1">
              Manage students, content, and monitor PISPA activities
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">System Status</div>
            <div className="flex items-center text-green-600">
              <i className="fas fa-circle text-xs mr-2"></i>
              All Systems Operational
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`${
                activeView === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Content Based on Active View */}
      {activeView === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Overview Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-users text-blue-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-user-check text-green-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-book text-purple-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Learning Materials</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalMaterials}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-calendar text-orange-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Activities</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.upcomingActivities}</p>
              </div>
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="md:col-span-2 lg:col-span-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Registrations</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programme</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Ahmad Ibrahim</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">PISPA2024001</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">APM</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">2 hours ago</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Siti Nurhaliza</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">PISPA2024002</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">APM</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">1 day ago</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Muhammad Rafi</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">PISPA2024003</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">APM</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">3 days ago</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="md:col-span-2 lg:col-span-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <i className="fas fa-user-plus mr-2"></i>
                Add Student
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <i className="fas fa-plus mr-2"></i>
                Create Activity
              </button>
              <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <i className="fas fa-upload mr-2"></i>
                Upload Material
              </button>
            </div>
          </div>
        </div>
      )}

      {activeView === 'students' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Student Management</h3>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors">
              <i className="fas fa-plus mr-2"></i>
              Add New Student
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programme</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Ahmad Ibrahim</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">PISPA2024001</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">APM</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">1</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-green-600 hover:text-green-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'materials' && (
        <div className="space-y-6">
          {/* Learning Materials Upload */}
          <FileUpload
            category="learning-materials"
            title="Upload Learning Materials"
            description="Upload official APM learning materials for Semester 1 PISPA students"
            allowedTypes={[
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-powerpoint',
              'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            ]}
            maxSize="10MB"
            onUploadComplete={() => setRefreshTrigger(prev => prev + 1)}
          />

          {/* Drill Guides Upload */}
          <FileUpload
            category="drill-guides"
            title="Upload Drill & Marching Guides"
            description="Upload drill instructions, marching guides, and training videos"
            allowedTypes={[
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'video/mp4',
              'video/quicktime',
              'image/jpeg',
              'image/png'
            ]}
            maxSize="50MB"
            onUploadComplete={() => setRefreshTrigger(prev => prev + 1)}
          />

          {/* Learning Materials List */}
          <FileList
            category="learning-materials"
            title="Learning Materials"
            refreshTrigger={refreshTrigger}
          />

          {/* Drill Guides List */}
          <FileList
            category="drill-guides"
            title="Drill & Marching Guides"
            refreshTrigger={refreshTrigger}
          />
        </div>
      )}

      {activeView === 'activities' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Activities & Events</h3>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors">
              <i className="fas fa-plus mr-2"></i>
              Create Activity
            </button>
          </div>

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">Weekly Drill Practice</h4>
                <span className="text-sm text-green-700 font-medium">Active</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Regular drill practice session for all students</p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Main Field • Every Friday • 2:00 PM - 4:00 PM</span>
                <div className="space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'analytics' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Analytics Dashboard</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Student Engagement</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Material Views</span>
                    <span className="text-sm font-medium">1,234</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Activity Participation</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Attendance Rate</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}