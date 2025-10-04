'use client';

import { useState, useEffect } from 'react';
import { getUpcomingActivities } from '@/lib/activities';
import { type Activity } from '@/types/activities';
import { format } from 'date-fns';

interface ActivityBrowserProps {
  title?: string;
  description?: string;
}

export function ActivityBrowser({ title = "Upcoming Activities", description = "View upcoming PISPA activities, training sessions, and events" }: ActivityBrowserProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const upcomingActivities = await getUpcomingActivities();
      setActivities(upcomingActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const getActivityTypeColor = (type: string) => {
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

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';

    const diffDays = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays <= 30) return `In ${Math.floor(diffDays / 7)} weeks`;

    return format(date, 'MMM dd');
  };

  const getDateColor = (date: Date) => {
    if (isToday(date)) return 'text-green-700 bg-green-50 border-green-200';
    if (isTomorrow(date)) return 'text-blue-700 bg-blue-50 border-blue-200';

    const diffDays = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) return 'text-purple-700 bg-purple-50 border-purple-200';
    if (diffDays <= 30) return 'text-orange-700 bg-orange-50 border-orange-200';

    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Loading activities...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg border-l-4 border-red-500 bg-red-50 text-red-700">
          <div className="flex items-start gap-3">
            <i className="fas fa-exclamation-triangle mt-0.5"></i>
            <div>{error}</div>
          </div>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <i className="fas fa-calendar-alt text-gray-300 text-4xl mb-4"></i>
          <p className="text-gray-500">No upcoming activities scheduled</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => {
            const activityDate = activity.date.toDate();
            return (
              <div key={activity.activityId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <i className={`${getActivityTypeIcon(activity.activityType)} text-gray-600`}></i>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{activity.title}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(activity.activityType)}`}>
                          {activity.activityType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        {activity.location && (
                          <div className="flex items-center gap-1">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{activity.location}</span>
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
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getDateColor(activityDate)}`}>
                      {getDateLabel(activityDate)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}