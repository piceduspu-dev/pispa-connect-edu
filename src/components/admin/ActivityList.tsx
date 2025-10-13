'use client';

import { useState, useEffect } from 'react';
import {
  getActivities,
  deleteActivity,
  toggleActivityStatus
} from '@/lib/activities';
import {
  getRegistrationsByActivity,
  markAttendance,
  type ActivityRegistration
} from '@/lib/registrations';
import { type Activity, type ActivityType } from '@/types/activities';
import { format } from 'date-fns';
import { getDoc, doc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

interface ActivityListProps {
  refreshTrigger?: number;
  onEdit?: (activity: Activity) => void;
}

export function ActivityList({ refreshTrigger, onEdit }: ActivityListProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [filter, setFilter] = useState<ActivityType | 'all'>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [registrations, setRegistrations] = useState<Record<string, ActivityRegistration[]>>({});
  const [expandedActivities, setExpandedActivities] = useState<Record<string, boolean>>({});
  const [markingAttendance, setMarkingAttendance] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<Record<string, { email: string; displayName?: string }>>({});
  const [userInfo, setUserInfo] = useState<Record<string, { email: string; displayName?: string }>>({});

  useEffect(() => {
    loadActivities();
  }, [refreshTrigger, filter, showInactive]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const filters = {
        isActive: showInactive ? undefined : true,
        ...(filter !== 'all' && { activityType: filter })
      };

      const result = await getActivities(filters);
      setActivities(result.activities);

      // Load user info for activity creators
      await loadActivityCreatorsInfo(result.activities);

      // Load registrations for each activity
      await loadRegistrationsForActivities(result.activities);
    } catch (error) {
      console.error('Error loading activities:', error);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrationsForActivities = async (activitiesToLoad: Activity[]) => {
    const registrationsData: Record<string, ActivityRegistration[]> = {};
    const studentIds = new Set<string>();

    for (const activity of activitiesToLoad) {
      try {
        const activityRegistrations = await getRegistrationsByActivity(activity.activityId);
        registrationsData[activity.activityId] = activityRegistrations;

        // Collect all unique student IDs
        activityRegistrations.forEach(reg => studentIds.add(reg.studentId));
      } catch (error) {
        console.error(`Error loading registrations for ${activity.activityId}:`, error);
        registrationsData[activity.activityId] = [];
      }
    }

    setRegistrations(registrationsData);

    // Load student information for all registered students
    await loadStudentInfo(Array.from(studentIds));
  };

  const loadStudentInfo = async (studentIds: string[]) => {
    const db = getDb();
    const studentData: Record<string, { email: string; displayName?: string }> = {};

    for (const studentId of studentIds) {
      try {
        const userDoc = await getDoc(doc(db, 'users', studentId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          studentData[studentId] = {
            email: userData.email || 'Unknown Email',
            displayName: userData.displayName
          };
        } else {
          studentData[studentId] = {
            email: 'Unknown User',
            displayName: 'Unknown'
          };
        }
      } catch (error) {
        console.error(`Error loading student info for ${studentId}:`, error);
        studentData[studentId] = {
          email: 'Error Loading',
          displayName: 'Error'
        };
      }
    }

    setStudentInfo(studentData);
  };

  const loadActivityCreatorsInfo = async (activities: Activity[]) => {
    const db = getDb();
    const creatorIds = new Set<string>();
    const userData: Record<string, { email: string; displayName?: string }> = {};

    // Collect all unique creator IDs
    activities.forEach(activity => {
      if (activity.createdBy) {
        creatorIds.add(activity.createdBy);
      }
    });

    // Load user information for all creators
    for (const creatorId of Array.from(creatorIds)) {
      try {
        const userDoc = await getDoc(doc(db, 'users', creatorId));
        if (userDoc.exists()) {
          const userDataItem = userDoc.data();
          userData[creatorId] = {
            email: userDataItem.email || 'Unknown Email',
            displayName: userDataItem.displayName
          };
        } else {
          userData[creatorId] = {
            email: 'Unknown User',
            displayName: 'Unknown'
          };
        }
      } catch (error) {
        console.error(`Error loading creator info for ${creatorId}:`, error);
        userData[creatorId] = {
          email: 'Error Loading',
          displayName: 'Error'
        };
      }
    }

    setUserInfo(userData);
  };

  const toggleRegistrations = (activityId: string) => {
    setExpandedActivities(prev => ({
      ...prev,
      [activityId]: !prev[activityId]
    }));
  };

  const handleMarkAttendance = async (registrationId: string, attended: boolean) => {
    setMarkingAttendance(registrationId);
    setError(null);

    try {
      await markAttendance(registrationId, attended);

      // Refresh registrations for the activity
      const activityRegistrations = Object.keys(registrations).find(
        activityId => registrations[activityId].some(reg => reg.id === registrationId)
      );

      if (activityRegistrations) {
        const updatedRegistrations = await getRegistrationsByActivity(activityRegistrations);
        setRegistrations(prev => ({
          ...prev,
          [activityRegistrations]: updatedRegistrations
        }));
      }

      setSuccess(`Attendance marked successfully`);
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError('Failed to mark attendance');
    } finally {
      setMarkingAttendance(null);
    }
  };

  const handleDelete = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(activityId);
      setError(null);

      await deleteActivity(activityId);
      setActivities(activities.filter(activity => activity.activityId !== activityId));
      setSuccess('Activity deleted successfully');
    } catch (error) {
      console.error('Error deleting activity:', error);
      setError('Failed to delete activity. Please try again.');
      await loadActivities(); // Refresh to ensure UI matches actual state
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleStatus = async (activityId: string, isActive: boolean) => {
    try {
      setToggling(activityId);
      setError(null);

      await toggleActivityStatus(activityId, isActive);
      setActivities(activities.map(activity =>
        activity.activityId === activityId
          ? { ...activity, isActive }
          : activity
      ));
      setSuccess(`Activity ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling activity status:', error);
      setError('Failed to update activity status. Please try again.');
      await loadActivities(); // Refresh to ensure UI matches actual state
    } finally {
      setToggling(null);
    }
  };

  const getActivityTypeColor = (type: ActivityType) => {
    const colors = {
      training: 'bg-blue-100 text-blue-800',
      event: 'bg-purple-100 text-purple-800',
      announcement: 'bg-yellow-100 text-yellow-800',
      competition: 'bg-red-100 text-red-800',
      ceremony: 'bg-green-100 text-green-800',
      workshop: 'bg-indigo-100 text-indigo-800',
      meeting: 'bg-gray-100 text-gray-800',
      exercise: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const activityTypes: { value: ActivityType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'training', label: 'Training' },
    { value: 'event', label: 'Event' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'competition', label: 'Competition' },
    { value: 'ceremony', label: 'Ceremony' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'exercise', label: 'Exercise' },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Loading activities...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-medium text-gray-900">Activities</h3>

        <div className="flex flex-wrap gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ActivityType | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-900 text-sm"
          >
            {activityTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mr-2"
            />
            Show inactive
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg border-l-4 border-red-500 bg-red-50 text-red-700">
          <div className="flex items-start gap-3">
            <i className="fas fa-exclamation-triangle mt-0.5"></i>
            <div>{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 rounded-lg border-l-4 border-green-500 bg-green-50 text-green-700">
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle mt-0.5"></i>
            <div>{success}</div>
          </div>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <i className="fas fa-calendar-alt text-gray-300 text-4xl mb-4"></i>
          <p className="text-gray-500">No activities found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.activityId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(activity.activityType)}`}>
                      {activity.activityType}
                    </span>
                    {!activity.isActive && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <i className="fas fa-calendar"></i>
                      <span>{format(activity.date.toDate(), 'MMM dd, yyyy')}</span>
                    </div>

                    {activity.location && (
                      <div className="flex items-center gap-1">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{activity.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <i className="fas fa-user"></i>
                      <span>Created by: {userInfo[activity.createdBy]?.displayName || userInfo[activity.createdBy]?.email || activity.createdBy}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <i className="fas fa-users"></i>
                      <span>
                        {registrations[activity.activityId]?.length || 0} registered
                        {activity.maxParticipants && ` / ${activity.maxParticipants}`}
                      </span>
                    </div>
                  </div>

                  {/* Registration Management Button */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {registrations[activity.activityId]?.length > 0 ? (
                        <>
                          {registrations[activity.activityId]?.filter(r => r.status === 'registered').length} pending
                          {' • '}
                          {registrations[activity.activityId]?.filter(r => r.status === 'attended').length} attended
                        </>
                      ) : (
                        'No registrations yet'
                      )}
                    </span>
                    <button
                      onClick={() => toggleRegistrations(activity.activityId)}
                      className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      {expandedActivities[activity.activityId] ? 'Hide' : 'View'} Registrations
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => onEdit?.(activity)}
                    className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-md transition-colors"
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>

                  <button
                    onClick={() => handleToggleStatus(activity.activityId, !activity.isActive)}
                    disabled={toggling === activity.activityId}
                    className={`p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      activity.isActive
                        ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50'
                        : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                    }`}
                    title={activity.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {toggling === activity.activityId ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : activity.isActive ? (
                      <i className="fas fa-eye-slash"></i>
                    ) : (
                      <i className="fas fa-eye"></i>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(activity.activityId)}
                    disabled={deleting === activity.activityId}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete"
                  >
                    {deleting === activity.activityId ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-trash"></i>
                    )}
                  </button>
                </div>
              </div>

              {/* Registrations List (Expandable) */}
              {expandedActivities[activity.activityId] && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Registered Students</h5>
                  {registrations[activity.activityId]?.length > 0 ? (
                    <div className="space-y-2">
                      {registrations[activity.activityId].map((registration) => (
                        <div key={registration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <i className="fas fa-user text-gray-500 text-sm"></i>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {studentInfo[registration.studentId]?.displayName || studentInfo[registration.studentId]?.email || 'Loading...'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {studentInfo[registration.studentId]?.email || registration.studentId}
                              </p>
                              <p className="text-xs text-gray-500">
                                Registered: {format(registration.registeredAt.toDate(), 'MMM dd, yyyy')}
                              </p>
                              {registration.notes && (
                                <p className="text-xs text-gray-600 mt-1">Notes: {registration.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              registration.status === 'registered' ? 'bg-blue-100 text-blue-800' :
                              registration.status === 'attended' ? 'bg-green-100 text-green-800' :
                              registration.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {registration.status}
                            </span>

                            {registration.status === 'registered' && (
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleMarkAttendance(registration.id, true)}
                                  disabled={markingAttendance === registration.id}
                                  className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition-colors disabled:opacity-50"
                                >
                                  {markingAttendance === registration.id ? (
                                    <i className="fas fa-spinner fa-spin"></i>
                                  ) : (
                                    'Present'
                                  )}
                                </button>
                                <button
                                  onClick={() => handleMarkAttendance(registration.id, false)}
                                  disabled={markingAttendance === registration.id}
                                  className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                                >
                                  {markingAttendance === registration.id ? (
                                    <i className="fas fa-spinner fa-spin"></i>
                                  ) : (
                                    'Absent'
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No students registered for this activity yet
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}