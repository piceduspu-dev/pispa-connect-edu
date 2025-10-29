'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  // Handle URL hash for tab navigation
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && ['dashboard', 'materials', 'activities', 'analytics'].includes(hash)) {
      setActiveView(hash);
    }
  }, []);

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