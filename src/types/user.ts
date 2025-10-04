/**
 * User data types for PISPA Connect authentication and user management
 * Based on PRD Section 10: Data Requirements
 */

import { Timestamp } from 'firebase/firestore';

// User role definitions for PISPA Connect
export type UserRole = 'admin' | 'student';

// Registration form data
export interface RegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role: UserRole;
  // Student specific
  studentId?: string;
  programme?: string;
  phoneNumber?: string;
}

// Login form data
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// User profile (stored in Firestore - based on PRD Section 10.3)
export interface UserProfile {
  // Firebase Auth ID
  userId: string;

  // Basic Information
  email: string;
  displayName: string;
  role: UserRole;

  // Student-specific fields (from PRD Section 10.1)
  studentId?: string; // Reference to students collection
  programme?: string;
  semester?: number;
  phoneNumber?: string;
  emergencyContact?: string;
  profilePhotoURL?: string;
  trainingStatus?: string;

  // Admin-specific fields
  adminPermissions?: string[];

  // System Fields
  accountStatus: 'active' | 'inactive';
  lastLogin: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Optional Profile Data
  photoURL?: string;
}

// Simplified user data for UI components
export interface User {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  accountStatus: 'active' | 'inactive';
  photoURL?: string;

  // Student fields
  studentId?: string;
  programme?: string;
  semester?: number;

  // Admin fields
  adminPermissions?: string[];
}

// Auth context state
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Registration process states
export type RegistrationStatus =
  | 'idle'
  | 'validating'
  | 'registering'
  | 'success'
  | 'error';

// Login process states
export type LoginStatus =
  | 'idle'
  | 'logging-in'
  | 'success'
  | 'error';

// Form validation states
export interface ValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Firebase errors mapping
export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

// Common auth error codes
export const AUTH_ERROR_CODES = {
  EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',
  WEAK_PASSWORD: 'auth/weak-password',
  INVALID_EMAIL: 'auth/invalid-email',
  USER_NOT_FOUND: 'auth/user-not-found',
  WRONG_PASSWORD: 'auth/wrong-password',
  TOO_MANY_REQUESTS: 'auth/too-many-requests',
  NETWORK_REQUEST_FAILED: 'auth/network-request-failed'
} as const;

// User creation data for Firestore (based on PRD Section 10.3)
export interface CreateUserData {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  accountStatus: 'active' | 'inactive';
  lastLogin: null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  studentId?: string;
  programme?: string;
  semester?: number;
  phoneNumber?: string;
  emergencyContact?: string;
  profilePhotoURL?: string;
  trainingStatus?: string;
  adminPermissions?: string[];
  photoURL?: string;
}

// Helper type for form field names
export type RegistrationField = keyof RegistrationFormData;
export type LoginField = keyof LoginFormData;

// API response types
export interface RegistrationResponse {
  success: boolean;
  user?: User;
  error?: AuthError;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: AuthError;
}