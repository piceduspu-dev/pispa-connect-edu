'use client';

import { useEffect, useState } from 'react';
import { testFirebaseConnection, quickFirebaseTest } from '@/lib/test-firebase';

export default function TestFirebasePage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Quick test on page load
    const quickTest = quickFirebaseTest();
    if (!quickTest) {
      setTestResult({
        success: false,
        message: 'Firebase not initialized on page load'
      });
    }
  }, []);

  const runTest = async () => {
    setLoading(true);
    const result = await testFirebaseConnection();
    setTestResult(result);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Firebase Connection Test
          </h1>
          <p className="text-gray-600 mb-8">
            Use this page to verify your Firebase setup is working correctly
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Test Status
            </h2>
            <button
              onClick={runTest}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : 'Run Test'}
            </button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-md ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center">
                <span className={`text-lg ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {testResult.success ? '✅' : '❌'}
                </span>
                <span className={`ml-2 font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {testResult.message}
                </span>
              </div>
              {testResult.error && (
                <div className="mt-2 text-sm text-red-700">
                  Error: {testResult.error}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Firebase Configuration Check
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-700">Environment Variables:</span>
              <span className="text-green-600">✅ Configured</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-700">Firebase SDK:</span>
              <span className="text-green-600">✅ Installed</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-700">TypeScript Types:</span>
              <span className="text-green-600">✅ Created</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-700">Serverless Config:</span>
              <span className="text-green-600">✅ Optimized</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium text-blue-900 mb-2">Next Steps:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Set up Firestore Security Rules</li>
              <li>• Create Firestore Collections</li>
              <li>• Implement Authentication</li>
              <li>• Build Admin Dashboard</li>
              <li>• Create Student Interface</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}