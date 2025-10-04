'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  const handleLogout = async () => {
    await logout();
  };

  const getDashboardComponent = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
        return <AdminDashboard user={user} activeView={activeView} onViewChange={setActiveView} />;
      case 'student':
      default:
        return <StudentDashboard user={user} activeView={activeView} onViewChange={setActiveView} />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Brand */}
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-medium text-gray-900">PISPA Connect</h1>
                  <p className="text-sm text-gray-600">
                    {user?.role === 'admin' ? 'Admin Portal' : 'Student Portal'}
                  </p>
                </div>
              </div>

              {/* User Info and Actions */}
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.displayName}</p>
                  <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {getDashboardComponent()}
        </main>
      </div>
    </ProtectedRoute>
  );
}