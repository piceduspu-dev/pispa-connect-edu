'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createActivity, updateActivity } from '@/lib/activities';
import { type Activity, type ActivityType } from '@/types/activities';
import { Timestamp } from 'firebase/firestore';

interface ActivityFormProps {
  activity?: Activity;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ActivityForm({ activity, onSuccess, onCancel }: ActivityFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: activity?.title || '',
    description: activity?.description || '',
    activityType: activity?.activityType || 'training' as ActivityType,
    date: activity?.date ? activity.date.toDate().toISOString().split('T')[0] : '',
    location: activity?.location || '',
    isActive: activity?.isActive ?? true,
  });

  const activityTypes: { value: ActivityType; label: string }[] = [
    { value: 'training', label: 'Training' },
    { value: 'event', label: 'Event' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'competition', label: 'Competition' },
    { value: 'ceremony', label: 'Ceremony' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'exercise', label: 'Exercise' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate form
      if (!formData.title.trim() || !formData.description.trim() || !formData.date) {
        setError('Please fill in all required fields');
        return;
      }

      const activityData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        activityType: formData.activityType,
        date: Timestamp.fromDate(new Date(formData.date)),
        location: formData.location.trim() || undefined,
        isActive: formData.isActive,
        updatedAt: Timestamp.now(),
      };

      if (activity) {
        // Update existing activity
        await updateActivity(activity.activityId, activityData);
        setSuccess('Activity updated successfully!');
      } else {
        // Create new activity
        await createActivity(
          {
            ...activityData,
            createdBy: user.userId,
          },
          user
        );
        setSuccess('Activity created successfully!');

        // Reset form for new activity
        setFormData({
          title: '',
          description: '',
          activityType: 'training',
          date: '',
          location: '',
          isActive: true,
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving activity:', error);
      setError('Failed to save activity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {activity ? 'Edit Activity' : 'Create New Activity'}
      </h3>

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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Activity Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-900"
            placeholder="Enter activity title"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-900"
            placeholder="Enter activity description"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="activityType" className="block text-sm font-medium text-gray-700 mb-1">
              Activity Type *
            </label>
            <select
              id="activityType"
              value={formData.activityType}
              onChange={(e) => handleInputChange('activityType', e.target.value as ActivityType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-900"
              disabled={loading}
            >
              {activityTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-900"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-900"
            placeholder="Enter location (optional)"
            disabled={loading}
          />
        </div>

        {activity && (
          <div className="flex items-center">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              disabled={loading}
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Activity is active (visible to students)
            </label>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !formData.title.trim() || !formData.description.trim() || !formData.date}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {activity ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                {activity ? 'Update Activity' : 'Create Activity'}
              </>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-times mr-2"></i>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}