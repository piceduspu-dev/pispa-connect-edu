'use client';

import { useState, useEffect } from 'react';
import {
  getActivities,
  deleteActivity,
  toggleActivityStatus
} from '@/lib/activities';
import { type Activity, type ActivityType } from '@/types/activities';
import { format } from 'date-fns';

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
    } catch (error) {
      console.error('Error loading activities:', error);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
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
                      <span>Created by: {activity.createdBy}</span>
                    </div>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}