/**
 * Student data types for PISPA Connect
 * Based on PRD Section 10.1: Student Data (Cloud Firestore Collection: `students`)
 */

import { Timestamp } from 'firebase/firestore';

// Student document structure (from PRD Section 10.1)
export interface Student {
  studentId: string; // Document ID / Primary Key
  fullName: string;
  programme: string;
  semester: number;
  email: string;
  phoneNumber?: string; // optional
  emergencyContact?: string; // optional
  profilePhotoURL?: string; // optional - Firebase Storage URL
  trainingStatus?: string; // optional
  enrollmentDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}


// Student update data (partial updates allowed)
export interface UpdateStudentData {
  fullName?: string;
  programme?: string;
  semester?: number;
  email?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  profilePhotoURL?: string;
  trainingStatus?: string;
  updatedAt: Timestamp;
}

// Student filter options for queries
export interface StudentFilters {
  programme?: string;
  semester?: number;
  trainingStatus?: string;
  searchQuery?: string; // For searching by name or student ID
}

// Student query results with pagination
export interface StudentQueryResult {
  students: Student[];
  totalCount: number;
  hasNextPage: boolean;
  lastVisible?: any; // Firestore document snapshot for pagination
}

// Student statistics for admin dashboard
export interface StudentStatistics {
  totalStudents: number;
  studentsByProgramme: Record<string, number>;
  studentsBySemester: Record<number, number>;
  studentsByTrainingStatus: Record<string, number>;
  recentEnrollments: number; // Last 30 days
}

// Student export data formats
export interface StudentExportData {
  studentId: string;
  fullName: string;
  programme: string;
  semester: number;
  email: string;
  phoneNumber?: string;
  emergencyContact?: string;
  trainingStatus?: string;
  enrollmentDate: string; // Formatted date
}

// Student import data (for bulk upload)
export interface StudentImportData {
  studentId: string;
  fullName: string;
  programme: string;
  semester: number;
  email: string;
  phoneNumber?: string;
  emergencyContact?: string;
}

// Import validation result
export interface StudentImportResult {
  success: boolean;
  importedCount: number;
  errorCount: number;
  errors: Array<{
    row: number;
    studentId: string;
    error: string;
  }>;
}

// Student training status options
export type TrainingStatus =
  | 'active'
  | 'inactive'
  | 'completed'
  | 'suspended'
  | 'on-leave';

// Programme options for PISPA students
export type PISPAProgramme =
  | 'Diploma in Logistics and Supply Chain'
  | 'Diploma in Mechanical Engineering'
  | 'Diploma in Electrical Engineering'
  | 'Diploma in Civil Engineering'
  | 'Diploma in Computer Science'
  | 'Other';

// Semester options
export type PISPASemester = 1 | 2 | 3 | 4 | 5 | 6;