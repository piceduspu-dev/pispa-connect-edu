'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/user';
import { FileBrowser } from '@/components/student/FileBrowser';
import { ActivityBrowser } from '@/components/student/ActivityBrowser';
import { getUpcomingActivities } from '@/lib/activities';
import { getUserDownloadCount, getUserRecentActivities } from '@/lib/userActivity';
import { getStudentRegistrations, cancelRegistration, type StudentRegistrationWithActivity } from '@/lib/registrations';
import { getMaterialStatistics } from '@/lib/materials';
import { format } from 'date-fns';

interface StudentDashboardProps {
  user: User;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function StudentDashboard({ user, activeView, onViewChange }: StudentDashboardProps) {
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [materialsCount, setMaterialsCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<StudentRegistrationWithActivity[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registrationsError, setRegistrationsError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const loadActivityCount = async () => {
      try {
        const activities = await getUpcomingActivities();
        setUpcomingCount(activities.length);
      } catch (error) {
        console.error('Error loading activity count:', error);
      }
    };
    loadActivityCount();
  }, []);

  useEffect(() => {
    const loadMaterialsCount = async () => {
      try {
        const stats = await getMaterialStatistics();
        setMaterialsCount(stats.totalMaterials);
      } catch (error) {
        console.error('Error loading materials count:', error);
      }
    };
    loadMaterialsCount();
  }, []);

  useEffect(() => {
    const loadDownloadCount = async () => {
      try {
        const count = await getUserDownloadCount(user.userId);
        setDownloadCount(count);
      } catch (error) {
        console.error('Error loading download count:', error);
      }
    };
    loadDownloadCount();
  }, [user.userId]);

  useEffect(() => {
    const loadRecentActivities = async () => {
      try {
        const activities = await getUserRecentActivities(user.userId, 5);
        setRecentActivities(activities);
      } catch (error) {
        console.error('Error loading recent activities:', error);
      }
    };
    loadRecentActivities();
  }, [user.userId]);

  // Load registrations when the registrations tab is active
  useEffect(() => {
    if (activeView === 'registrations') {
      loadRegistrations();
    }
  }, [activeView, user.userId]);

  const loadRegistrations = async () => {
    try {
      setRegistrationsLoading(true);
      setRegistrationsError(null);
      const studentRegistrations = await getStudentRegistrations(user.userId);
      setRegistrations(studentRegistrations);
    } catch (error) {
      console.error('Error loading registrations:', error);
      setRegistrationsError('Failed to load your registrations');
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId: string) => {
    if (!confirm('Are you sure you want to cancel this registration?')) {
      return;
    }

    setProcessing(registrationId);
    setRegistrationsError(null);

    try {
      await cancelRegistration(registrationId);
      await loadRegistrations(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling registration:', error);
      setRegistrationsError('Failed to cancel registration. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  // Helper function to format relative time
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

  // Helper function to get activity icon and color
  const getActivityDisplay = (action: string) => {
    switch (action) {
      case 'download':
        return {
          icon: 'fas fa-download',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600'
        };
      case 'view':
        return {
          icon: 'fas fa-eye',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-600'
        };
      default:
        return {
          icon: 'fas fa-circle',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600'
        };
    }
  };

  // Helper functions for registration display
  const getActivityTypeColor = (type: string) => {
    const colors = {
      training: 'bg-blue-100 text-blue-800',
      event: 'bg-purple-100 text-purple-800',
      announcement: 'bg-yellow-100 text-yellow-800',
      competition: 'bg-red-100 text-red-800',
      ceremony: 'bg-orange-100 text-orange-800',
      workshop: 'bg-indigo-100 text-indigo-800',
      meeting: 'bg-gray-100 text-gray-800',
      exercise: 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getActivityTypeIcon = (type: string) => {
    const icons = {
      training: 'fas fa-dumbbell',
      event: 'fas fa-calendar-star',
      announcement: 'fas fa-bullhorn',
      competition: 'fas fa-trophy',
      ceremony: 'fas fa-medal',
      workshop: 'fas fa-chalkboard-teacher',
      meeting: 'fas fa-users',
      exercise: 'fas fa-running',
    };
    return icons[type as keyof typeof icons] || 'fas fa-calendar';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-orange-100 text-orange-800';
      case 'attended':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isUpcoming = (date: Date) => {
    return date > new Date();
  };

  // Navigation tabs for student dashboard
  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' },
    { id: 'materials', label: 'PISPA Materials', icon: 'fas fa-book' },
    { id: 'activities', label: 'Activities', icon: 'fas fa-calendar' },
    { id: 'registrations', label: 'My Registrations', icon: 'fas fa-list-check' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-medium text-gray-900">
              Welcome back, {user.displayName}!
            </h2>
            <p className="text-gray-600 mt-1">
              {user.studentId && `Student ID: ${user.studentId}`}
              {user.programme && ` • Programme: ${user.programme}`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Current Semester</div>
            <div className="text-2xl font-bold text-orange-600">{user.semester || 1}</div>
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
                  ? 'border-orange-500 text-orange-600'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-book text-orange-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">PISPA Materials</p>
                <p className="text-2xl font-semibold text-gray-900">{materialsCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-calendar text-blue-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Activities</p>
                <p className="text-2xl font-semibold text-gray-900">{upcomingCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-download text-purple-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Downloaded Files</p>
                <p className="text-2xl font-semibold text-gray-900">{downloadCount}</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="md:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => {
                  const display = getActivityDisplay(activity.action);
                  return (
                    <div key={activity.materialId || index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 ${display.bgColor} rounded-full flex items-center justify-center`}>
                          <i className={`${display.icon} ${display.textColor} text-sm`}></i>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.action === 'download' ? `Downloaded "${activity.materialTitle}"` : `Viewed "${activity.materialTitle}"`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatRelativeTime(activity.timestamp.toDate())}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-history text-gray-300 text-4xl mb-3"></i>
                  <p className="text-gray-500">No recent activity yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Start viewing or downloading materials to see your activity here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeView === 'materials' && (
        <div className="space-y-6">
          {/* PISPA 1 */}
          <FileBrowser
            category="learning-materials"
            title="PISPA 1"
            description="Access official APM learning materials and study resources for your PISPA training"
          />

          {/* PISPA 2 */}
          <FileBrowser
            category="drill-guides"
            title="PISPA 2"
            description="View drill instructions, marching techniques, and training demonstrations"
          />
        </div>
      )}

      {activeView === 'activities' && (
        <ActivityBrowser />
      )}

      {activeView === 'registrations' && (
        <div className="space-y-6">
          {registrationsError && (
            <div className="p-4 rounded-lg border-l-4 border-red-600 bg-red-50 text-red-700">
              <div className="flex items-start gap-3">
                <i className="fas fa-exclamation-triangle mt-0.5"></i>
                <div>{registrationsError}</div>
              </div>
            </div>
          )}

          {registrationsLoading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your registrations...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <i className="fas fa-calendar-times text-gray-300 text-6xl mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations yet</h3>
              <p className="text-gray-600 mb-6">You haven't registered for any activities.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-calendar-check text-orange-600"></i>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                      <p className="text-2xl font-semibold text-gray-900">{registrations.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-clock text-blue-600"></i>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Upcoming</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {registrations.filter(r => isUpcoming(r.activity.date.toDate())).length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-check-double text-purple-600"></i>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Attended</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {registrations.filter(r => r.status === 'attended').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registrations List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Your Registrations</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {registrations.map((registration) => {
                    const activityDate = registration.activity.date.toDate();
                    const upcoming = isUpcoming(activityDate);

                    return (
                      <div key={registration.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <i className={`${getActivityTypeIcon(registration.activity.activityType)} text-gray-600`}></i>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {registration.activity.title}
                                </h4>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(registration.activity.activityType)}`}>
                                  {registration.activity.activityType}
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(registration.status)}`}>
                                  {registration.status}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-2">
                                {registration.activity.location && (
                                  <div className="flex items-center gap-1">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>{registration.activity.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <i className="fas fa-calendar"></i>
                                  <span>{format(activityDate, 'MMM dd, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <i className="fas fa-clock"></i>
                                  <span>{format(activityDate, 'h:mm a')}</span>
                                </div>
                              </div>

                              {registration.notes && (
                                <p className="text-sm text-gray-600 mb-2">
                                  <span className="font-medium">Notes:</span> {registration.notes}
                                </p>
                              )}

                              <p className="text-xs text-gray-500">
                                Registered: {format(registration.registeredAt.toDate(), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 ml-4">
                            {upcoming && registration.status === 'registered' && (
                              <button
                                onClick={() => handleCancelRegistration(registration.id)}
                                disabled={processing === registration.id}
                                className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processing === registration.id ? (
                                  <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                  'Cancel'
                                )}
                              </button>
                            )}

                            {!upcoming && registration.status === 'attended' && (
                              <span className="text-xs text-orange-600 font-medium">
                                <i className="fas fa-check-circle mr-1"></i>
                                Attended
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}