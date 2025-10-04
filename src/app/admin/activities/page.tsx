'use client';

import { useState } from 'react';
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
          <h1 className="text-2xl font-bold text-gray-900">Activity Management</h1>
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