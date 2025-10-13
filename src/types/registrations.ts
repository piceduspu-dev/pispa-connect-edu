/**
 * Registration types for PISPA Connect
 * Defines activity registration data structures
 */

import { Timestamp } from 'firebase/firestore';

export interface ActivityRegistration {
  id: string;                     // Primary Key (same as document ID)
  activityId: string;             // Foreign Key to activities
  studentId: string;              // Foreign Key to users
  registeredAt: Timestamp;        // When registered
  status: 'registered' | 'cancelled' | 'attended' | 'absent';
  notes?: string;                 // Optional notes from student
  createdAt: Timestamp;
}

export type RegistrationStatus = ActivityRegistration['status'];

// UI-related types
export interface RegistrationFormData {
  notes?: string;
}

export interface StudentRegistrationWithActivity extends ActivityRegistration {
  activity: {
    id: string;
    title: string;
    activityType: string;
    date: Timestamp;
    location?: string;
  };
}