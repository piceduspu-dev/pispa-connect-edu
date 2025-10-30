'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { registerUser, loginUser } from '@/lib/auth';
import type { RegistrationFormData, LoginFormData } from '@/types/user';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (formData: LoginFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await loginUser(formData);

      if (result.success && result.user) {
        const user = result.user;
        login(user);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          router.push(user.role === 'admin' ? '/admin' : '/dashboard');
        }, 1000);
      } else {
        setError(result.error?.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (formData: RegistrationFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await registerUser(formData);

      if (result.success && result.user) {
        setSuccess('Registration successful! You can now sign in with your credentials.');
        setTimeout(() => {
          setMode('login');
        }, 2000);
      } else {
        setError(result.error?.message || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-10 mb-4">
            {/* Politeknik Seberang Perai Logo */}
            <div className="w-48 h-48">
              <img
                src="/assets/images/poli-seberang-perai.png"
                alt="Politeknik Seberang Perai Logo"
                className="w-full h-full object-contain"
              />
            </div>

            {/* APM Logo */}
            <div className="w-48 h-48">
              <img
                src="/assets/images/apmlogo.png"
                alt="APM Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-2xl font-medium text-gray-900 mb-1">PISPA Connect</h1>
          <p className="text-gray-600">Educational Platform for PISPA Students</p>
        </div>

        {/* Mode Toggle */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-6">
          <div className="flex">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-orange-50 text-orange-700 border border-green-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'register'
                  ? 'bg-orange-50 text-orange-700 border border-green-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border-l-4 border-red-600 bg-red-50 text-red-700 flex items-start gap-3">
            <span className="alert-icon"><i className="fas fa-exclamation-triangle"></i></span>
            <div>{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg border-l-4 border-orange-500 bg-orange-50 text-orange-700 flex items-start gap-3">
            <span className="alert-icon"><i className="fas fa-check-circle"></i></span>
            <div>{success}</div>
          </div>
        )}

        {/* Forms */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {mode === 'login' ? (
            <LoginForm onSubmit={handleLogin} loading={loading} />
          ) : (
            <RegisterForm
              onSubmit={handleRegister}
              loading={loading}
              role={role}
              onRoleChange={setRole}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Login Form Component
function LoginForm({ onSubmit, loading }: {
  onSubmit: (data: LoginFormData) => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-gray-900 mb-6">Welcome Back</h2>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-envelope text-gray-400"></i>
            </div>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder=" "
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors peer text-gray-900"
              required
            />
            <label
              htmlFor="email"
              className="absolute left-10 top-3 text-gray-600 text-sm transition-all duration-200 peer-focus:-top-2 peer-focus:bg-white peer-focus:px-1 peer-focus:text-orange-600 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
            >
              Email Address
            </label>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-lock text-gray-400"></i>
            </div>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder=" "
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors peer text-gray-900"
              required
            />
            <label
              htmlFor="password"
              className="absolute left-10 top-3 text-gray-600 text-sm transition-all duration-200 peer-focus:-top-2 peer-focus:bg-white peer-focus:px-1 peer-focus:text-orange-600 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
            >
              Password
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}

// Register Form Component
function RegisterForm({
  onSubmit,
  loading,
  role,
  onRoleChange
}: {
  onSubmit: (data: RegistrationFormData) => void;
  loading: boolean;
  role: 'student' | 'admin';
  onRoleChange: (role: 'student' | 'admin') => void;
}) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    ...(role === 'student' && { studentId: '', programme: '', phoneNumber: '' })
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, role });
  };

  const handleRoleChange = (newRole: 'student' | 'admin') => {
    onRoleChange(newRole);
    setFormData(prev => ({
      ...prev,
      role: newRole,
      ...(newRole === 'student' && {
        studentId: '',
        programme: '',
        phoneNumber: ''
      }),
      ...(newRole === 'admin' && {
        studentId: undefined,
        programme: undefined,
        phoneNumber: undefined
      })
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-medium text-gray-900 mb-6">Create Account</h2>

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            I am a:
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`flex-1 py-2 px-4 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                role === 'student'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <i className="fas fa-user-graduate"></i>
              Student
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex-1 py-2 px-4 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                role === 'admin'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <i className="fas fa-user-shield"></i>
              Admin
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-user text-gray-400"></i>
            </div>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder=" "
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors peer text-gray-900"
              required
            />
            <label
              htmlFor="fullName"
              className="absolute left-10 top-3 text-gray-600 text-sm transition-all duration-200 peer-focus:-top-2 peer-focus:bg-white peer-focus:px-1 peer-focus:text-orange-600 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
            >
              Full Name
            </label>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-envelope text-gray-400"></i>
            </div>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder=" "
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors peer text-gray-900"
              required
            />
            <label
              htmlFor="email"
              className="absolute left-10 top-3 text-gray-600 text-sm transition-all duration-200 peer-focus:-top-2 peer-focus:bg-white peer-focus:px-1 peer-focus:text-orange-600 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
            >
              Email Address
            </label>
          </div>

          {role === 'student' && (
            <>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-id-card text-gray-400"></i>
                </div>
                <input
                  type="text"
                  id="studentId"
                  value={formData.studentId || ''}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder=" "
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors peer text-gray-900"
                  required
                />
                <label
                  htmlFor="studentId"
                  className="absolute left-10 top-3 text-gray-600 text-sm transition-all duration-200 peer-focus:-top-2 peer-focus:bg-white peer-focus:px-1 peer-focus:text-orange-600 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
                >
                  Student ID
                </label>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-book text-gray-400"></i>
                </div>
                <input
                  type="text"
                  id="programme"
                  value={formData.programme || ''}
                  onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
                  placeholder=" "
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors peer text-gray-900"
                />
                <label
                  htmlFor="programme"
                  className="absolute left-10 top-3 text-gray-600 text-sm transition-all duration-200 peer-focus:-top-2 peer-focus:bg-white peer-focus:px-1 peer-focus:text-orange-600 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
                >
                  Programme (Optional)
                </label>
              </div>
            </>
          )}

          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-lock text-gray-400"></i>
            </div>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder=" "
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors peer text-gray-900"
              required
            />
            <label
              htmlFor="password"
              className="absolute left-10 top-3 text-gray-600 text-sm transition-all duration-200 peer-focus:-top-2 peer-focus:bg-white peer-focus:px-1 peer-focus:text-orange-600 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
            >
              Password (min 6 characters)
            </label>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-lock text-gray-400"></i>
            </div>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder=" "
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors peer text-gray-900"
              required
            />
            <label
              htmlFor="confirmPassword"
              className="absolute left-10 top-3 text-gray-600 text-sm transition-all duration-200 peer-focus:-top-2 peer-focus:bg-white peer-focus:px-1 peer-focus:text-orange-600 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1"
            >
              Confirm Password
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}