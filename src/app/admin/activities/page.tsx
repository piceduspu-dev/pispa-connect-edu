'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ActivityForm } from '@/components/admin/ActivityForm';
import { ActivityList } from '@/components/admin/ActivityList';
import { type Activity } from '@/types/activities';

export default function AdminActivitiesPage() {
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleActivitySaved = () => {
    setEditingActivity(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
  };

  const handleCancelEdit = () => {
    setEditingActivity(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Activity Management</h1>
          </div>
        </div>

        {editingActivity ? (
          <ActivityForm
            activity={editingActivity}
            onSuccess={handleActivitySaved}
            onCancel={handleCancelEdit}
          />
        ) : (
          <ActivityForm
            onSuccess={handleActivitySaved}
          />
        )}

        <ActivityList
          refreshTrigger={refreshTrigger}
          onEdit={handleEditActivity}
        />
      </div>
    </AdminLayout>
  );
}