'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { getStudentRegistrations, cancelRegistration, type StudentRegistrationWithActivity } from '@/lib/registrations';
import { format } from 'date-fns';

export default function MyRegistrationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [registrations, setRegistrations] = useState<StudentRegistrationWithActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadRegistrations();
  }, [user, authLoading]); // Add user and authLoading as dependencies

  const loadRegistrations = async () => {
    console.log('🚀 loadRegistrations called, user:', user?.userId, 'authLoading:', authLoading);
    if (!user || authLoading) {
      console.log('❌ No user found or auth still loading, returning');
      return;
    }

    try {
      console.log('🔄 Setting loading state to true');
      setLoading(true);
      setError(null);
      console.log('📞 Calling getStudentRegistrations...');
      const studentRegistrations = await getStudentRegistrations(user.userId);
      console.log('📊 Got registrations:', studentRegistrations.length);
      setRegistrations(studentRegistrations);
    } catch (error) {
      console.error('❌ Error loading registrations:', error);
      setError('Failed to load your registrations');
    } finally {
      console.log('✅ Setting loading state to false');
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (registrationId: string) => {
    if (!confirm('Are you sure you want to cancel this registration?')) {
      return;
    }

    setProcessing(registrationId);
    setError(null);

    try {
      await cancelRegistration(registrationId);
      await loadRegistrations(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling registration:', error);
      setError('Failed to cancel registration. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

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

  if (loading || authLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="ml-3 text-gray-600">
                {authLoading ? 'Authenticating...' : 'Loading your registrations...'}
              </span>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Registrations</h1>
                <p className="text-gray-600 mt-1">View and manage your activity registrations</p>
              </div>
              <a
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Back to Dashboard
              </a>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg border-l-4 border-red-600 bg-red-50 text-red-700">
              <div className="flex items-start gap-3">
                <i className="fas fa-exclamation-triangle mt-0.5"></i>
                <div>{error}</div>
              </div>
            </div>
          )}

          {registrations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <i className="fas fa-calendar-times text-gray-300 text-6xl mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations yet</h3>
              <p className="text-gray-600 mb-6">You haven't registered for any activities.</p>
              <a
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                <i className="fas fa-search mr-2"></i>
                Browse Activities
              </a>
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
      </div>
    </ProtectedRoute>
  );
}