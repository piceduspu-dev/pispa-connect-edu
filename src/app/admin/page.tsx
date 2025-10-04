'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <AdminDashboard
          user={user!}
          activeView={activeView}
          onViewChange={setActiveView}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}