'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/user';
import { FileBrowser } from '@/components/student/FileBrowser';
import { ActivityBrowser } from '@/components/student/ActivityBrowser';
import { getUpcomingActivities } from '@/lib/activities';

interface StudentDashboardProps {
  user: User;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function StudentDashboard({ user, activeView, onViewChange }: StudentDashboardProps) {
  const [upcomingCount, setUpcomingCount] = useState(0);

  useEffect(() => {
    const loadActivityCount = async () => {
      try {
        const activities = await getUpcomingActivities();
        setUpcomingCount(activities.length);
      } catch (error) {
        console.error('Error loading activity count:', error);
      }
    };
    loadActivityCount();
  }, []);
  // Navigation tabs for student dashboard
  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' },
    { id: 'materials', label: 'Learning Materials', icon: 'fas fa-book' },
    { id: 'activities', label: 'Activities', icon: 'fas fa-calendar' },
    { id: 'progress', label: 'My Progress', icon: 'fas fa-chart-line' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-medium text-gray-900">
              Welcome back, {user.displayName}!
            </h2>
            <p className="text-gray-600 mt-1">
              {user.studentId && `Student ID: ${user.studentId}`}
              {user.programme && ` • Programme: ${user.programme}`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Current Semester</div>
            <div className="text-2xl font-bold text-green-600">{user.semester || 1}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`${
                activeView === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Content Based on Active View */}
      {activeView === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-book text-green-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Learning Materials</p>
                <p className="text-2xl font-semibold text-gray-900">24</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-calendar text-blue-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Activities</p>
                <p className="text-2xl font-semibold text-gray-900">{upcomingCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-trophy text-purple-600"></i>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-semibold text-gray-900">18</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="md:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-check text-green-600 text-sm"></i>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Completed Drill Guide Module 1</p>
                  <p className="text-sm text-gray-600">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-download text-blue-600 text-sm"></i>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Downloaded APM Learning Materials</p>
                  <p className="text-sm text-gray-600">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-star text-purple-600 text-sm"></i>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Achieved Excellence in March Training</p>
                  <p className="text-sm text-gray-600">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'materials' && (
        <div className="space-y-6">
          {/* Learning Materials */}
          <FileBrowser
            category="learning-materials"
            title="Learning Materials"
            description="Access official APM learning materials and study resources for your PISPA training"
          />

          {/* Drill & Marching Guides */}
          <FileBrowser
            category="drill-guides"
            title="Drill & Marching Guides"
            description="View drill instructions, marching techniques, and training demonstrations"
          />
        </div>
      )}

      {activeView === 'activities' && (
        <ActivityBrowser />
      )}

      {activeView === 'progress' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">My Progress</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">APM Training</span>
                <span className="text-sm text-gray-600">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Drill Practice</span>
                <span className="text-sm text-gray-600">90%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Leadership Skills</span>
                <span className="text-sm text-gray-600">60%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}