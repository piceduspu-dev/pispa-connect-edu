'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/user';
import { FileUpload } from '@/components/admin/FileUpload';
import { FileList } from '@/components/admin/FileList';
import { getDashboardStatistics, DashboardStatistics, RecentActivityRegistration } from '@/lib/statistics';

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

  // State for dashboard statistics
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching dashboard statistics...');
        const dashboardStats = await getDashboardStatistics();

        setStats(dashboardStats);
        console.log('Dashboard statistics loaded successfully');
        console.log('Recent registrations in dashboard:', dashboardStats.recentRegistrations);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
        setError('Failed to load dashboard statistics');

        // Set fallback stats
        setStats({
          totalStudents: 0,
          activeStudents: 0,
          totalMaterials: 0,
          totalViews: 0,
          upcomingActivities: 0,
          attendanceRate: 0,
          recentRegistrations: [],
          systemStatus: {
            isOperational: false,
            lastUpdated: new Date()
          }
        });
      } finally {
        setLoading(false);
      }
    };

    // Fetch stats when dashboard view is active
    if (activeView === 'dashboard') {
      fetchStats();
    }
  }, [activeView, refreshTrigger]);

  // Format relative time for display
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  };

  // Get activity type badge color
  const getActivityTypeBadgeColor = (activityType: string): string => {
    switch (activityType.toLowerCase()) {
      case 'training': return 'bg-blue-100 text-blue-800';
      case 'event': return 'bg-purple-100 text-purple-800';
      case 'competition': return 'bg-orange-100 text-orange-800';
      case 'ceremony': return 'bg-pink-100 text-pink-800';
      case 'workshop': return 'bg-indigo-100 text-indigo-800';
      case 'meeting': return 'bg-gray-100 text-gray-800';
      case 'exercise': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get registration status color
  const getRegistrationStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'registered': return 'bg-green-100 text-green-800';
      case 'attended': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'absent': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            <div className={`flex items-center ${stats?.systemStatus.isOperational ? 'text-green-600' : 'text-red-600'}`}>
              <i className={`fas fa-circle text-xs mr-2`}></i>
              {stats?.systemStatus.isOperational ? 'All Systems Operational' : 'System Issues Detected'}
            </div>
            {stats && (
              <div className="text-xs text-gray-500 mt-1">
                Last updated: {formatRelativeTime(stats.systemStatus.lastUpdated)}
              </div>
            )}
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
        <>
          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-red-600 mr-3"></i>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => setRefreshTrigger(prev => prev + 1)}
                  className="ml-auto text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dashboard Stats */}
          {!loading && stats && (
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
            </div>
          )}

          {/* Recent Activity Registrations */}
          {!loading && stats && (
            <div className="md:col-span-2 lg:col-span-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity Registrations</h3>
              <div className="overflow-x-auto">
                {stats.recentRegistrations.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recentRegistrations.map((registration) => (
                        <tr key={registration.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {registration.studentName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {registration.activityTitle}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getActivityTypeBadgeColor(registration.activityType)}`}>
                              {registration.activityType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatRelativeTime(registration.registeredAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getRegistrationStatusColor(registration.status)}`}>
                              {registration.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-calendar-check text-gray-300 text-4xl mb-3"></i>
                    <p className="text-gray-500">No recent activity registrations found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {!loading && stats && (
            <div className="md:col-span-2 lg:col-span-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          )}
        </>
      )}

      {activeView === 'students' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900">Student Management</h3>
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
          <div className="text-center py-12">
            <i className="fas fa-calendar-alt text-gray-300 text-6xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Activity Management</h3>
            <p className="text-gray-600 mb-6">Manage PISPA activities, training sessions, and events</p>
            <a
              href="/admin/activities"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              <i className="fas fa-arrow-right mr-2"></i>
              Go to Activity Management
            </a>
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
                    <span className="text-sm font-medium">{stats?.totalViews || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${stats?.totalMaterials && stats.totalMaterials > 0 ? Math.min((stats.totalViews / stats.totalMaterials) * 10, 100) : 0}%`
                      }}
                    ></div>
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
                    <span className="text-sm font-medium">{stats?.attendanceRate || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats?.attendanceRate || 0}%` }}
                    ></div>
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