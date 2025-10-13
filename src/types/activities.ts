/**
 * PISPA Activities data types for PISPA Connect
 * Based on PRD Section 10.4: PISPA Activities Data (Cloud Firestore Collection: `activities`)
 */

import { Timestamp } from 'firebase/firestore';

// PISPA Activities document structure (from PRD Section 10.4)
export interface Activity {
  activityId: string; // Document ID / Primary Key
  title: string;
  description: string;
  activityType: ActivityType;
  date: Timestamp;
  location?: string; // optional
  mediaURLs?: string[]; // optional - Firebase Storage URLs
  createdBy: string; // Admin User ID
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  registeredCount?: number;       // Current registration count
  maxParticipants?: number;       // Optional capacity limit
}

// Activity creation data
export interface CreateActivityData {
  title: string;
  description: string;
  activityType: ActivityType;
  date: Timestamp;
  location?: string;
  mediaURLs?: string[];
  createdBy: string;
}

// Activity update data
export interface UpdateActivityData {
  title?: string;
  description?: string;
  activityType?: ActivityType;
  date?: Timestamp;
  location?: string;
  mediaURLs?: string[];
  updatedAt: Timestamp;
  isActive?: boolean;
}

// Activity filter options
export interface ActivityFilters {
  activityType?: ActivityType;
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
  location?: string;
  createdBy?: string;
  isActive?: boolean;
  searchQuery?: string;
}

// Activity query results with pagination
export interface ActivityQueryResult {
  activities: Activity[];
  totalCount: number;
  hasNextPage: boolean;
  lastVisible?: any; // Firestore document snapshot for pagination
}

// Activity types (from PRD Section 10.4)
export type ActivityType =
  | 'training'
  | 'event'
  | 'announcement'
  | 'competition'
  | 'ceremony'
  | 'workshop'
  | 'meeting'
  | 'exercise';

// Activity status
export type ActivityStatus =
  | 'upcoming'
  | 'ongoing'
  | 'completed'
  | 'cancelled';

// Activity statistics for admin dashboard
export interface ActivityStatistics {
  totalActivities: number;
  activitiesByType: Record<ActivityType, number>;
  upcomingActivities: number;
  ongoingActivities: number;
  completedActivities: number;
  activitiesThisMonth: number;
  activitiesByLocation: Record<string, number>;
}

// Activity calendar data
export interface CalendarActivity {
  activityId: string;
  title: string;
  date: Timestamp;
  activityType: ActivityType;
  location?: string;
  isActive: boolean;
}

// Upcoming activities (next 7/30 days)
export interface UpcomingActivities {
  next7Days: Activity[];
  next30Days: Activity[];
}

// Activity media metadata
export interface ActivityMedia {
  fileName: string;
  fileURL: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Timestamp;
}

// Activity participant (for future enhancement)
export interface ActivityParticipant {
  studentId: string;
  studentName: string;
  attendanceStatus: 'confirmed' | 'pending' | 'declined';
  registeredAt: Timestamp;
}

// Activity reminder settings
export interface ActivityReminder {
  activityId: string;
  reminderTime: Timestamp; // When to send reminder
  reminderMethod: 'email' | 'notification' | 'both';
  sent: boolean;
  sentAt?: Timestamp;
}

// Activity export data
export interface ActivityExportData {
  activityId: string;
  title: string;
  description: string;
  activityType: ActivityType;
  date: string; // formatted date
  location?: string;
  createdBy: string;
  createdAt: string; // formatted date
  isActive: boolean;
  mediaCount: number;
}

// Activity activity log
export interface ActivityActivityLog {
  action: 'create' | 'update' | 'delete' | 'publish' | 'cancel';
  activityId: string;
  activityTitle: string;
  userId: string;
  userEmail: string;
  timestamp: Timestamp;
  details?: string;
}

// Activity validation result
export interface ActivityValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}