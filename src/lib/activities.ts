/**
 * PISPA Activities utilities for PISPA Connect
 * Handles activity creation, management, and data operations
 */

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import { getDb } from './firebase';
import type {
  Activity,
  CreateActivityData,
  UpdateActivityData,
  ActivityFilters,
  ActivityQueryResult,
  ActivityType,
  ActivityStatistics
} from '@/types/activities';
import type { User } from '@/types/user';

/**
 * Create a new activity
 */
export async function createActivity(
  data: CreateActivityData,
  user: User
): Promise<Activity> {
  const db = getDb();

  // Generate activity ID
  const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create activity document
  const activity: Activity = {
    activityId,
    title: data.title,
    description: data.description,
    activityType: data.activityType,
    date: data.date,
    location: data.location,
    mediaURLs: data.mediaURLs || [],
    createdBy: user.userId,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
    isActive: true,
  };

  console.log('Creating activity:', {
    activityId,
    title: data.title,
    createdBy: user.userId,
    date: data.date.toDate().toLocaleDateString()
  });

  // Save to Firestore
  await setDoc(doc(db, 'activities', activityId), activity);
  console.log('Activity created successfully');

  return activity;
}

/**
 * Get activity by ID
 */
export async function getActivity(activityId: string): Promise<Activity | null> {
  const db = getDb();
  const docRef = doc(db, 'activities', activityId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Activity;
  }

  return null;
}

/**
 * Get all activities with optional filtering
 */
export async function getActivities(
  filters?: ActivityFilters,
  pageSize: number = 50,
  lastVisible?: any
): Promise<ActivityQueryResult> {
  const db = getDb();
  let q = query(collection(db, 'activities'));

  // Apply filters
  const constraints: QueryConstraint[] = [];

  if (filters?.activityType) {
    constraints.push(where('activityType', '==', filters.activityType));
  }

  if (filters?.createdBy) {
    constraints.push(where('createdBy', '==', filters.createdBy));
  }

  if (filters?.isActive !== undefined) {
    constraints.push(where('isActive', '==', filters.isActive));
  }

  if (filters?.dateRange) {
    constraints.push(where('date', '>=', filters.dateRange.start));
    constraints.push(where('date', '<=', filters.dateRange.end));
  }

  // Add ordering
  constraints.push(orderBy('date', 'desc'));

  // Add pagination
  constraints.push(limit(pageSize));

  q = query(collection(db, 'activities'), ...constraints);

  const querySnapshot = await getDocs(q);
  const activities = querySnapshot.docs.map(doc => doc.data() as Activity);

  // Apply search query filter (client-side)
  let filteredActivities = activities;
  if (filters?.searchQuery) {
    const searchLower = filters.searchQuery.toLowerCase();
    filteredActivities = activities.filter(activity =>
      activity.title.toLowerCase().includes(searchLower) ||
      activity.description.toLowerCase().includes(searchLower) ||
      (activity.location && activity.location.toLowerCase().includes(searchLower))
    );
  }

  // Apply location filter (client-side for flexibility)
  if (filters?.location) {
    const locationLower = filters.location.toLowerCase();
    filteredActivities = filteredActivities.filter(activity =>
      activity.location?.toLowerCase().includes(locationLower)
    );
  }

  return {
    activities: filteredActivities,
    totalCount: filteredActivities.length,
    hasNextPage: querySnapshot.docs.length === pageSize,
    lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1]
  };
}

/**
 * Get upcoming activities (next 30 days)
 */
export async function getUpcomingActivities(): Promise<Activity[]> {
  const db = getDb();
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const q = query(
    collection(db, 'activities'),
    where('date', '>=', Timestamp.fromDate(now)),
    where('date', '<=', Timestamp.fromDate(thirtyDaysFromNow)),
    where('isActive', '==', true),
    orderBy('date', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Activity);
}

/**
 * Update an activity
 */
export async function updateActivity(
  activityId: string,
  updates: UpdateActivityData
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'activities', activityId);

  console.log('Updating activity:', {
    activityId,
    updates
  });

  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });

  console.log('Activity updated successfully');
}

/**
 * Delete an activity
 */
export async function deleteActivity(activityId: string): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'activities', activityId);

  console.log('Deleting activity:', { activityId });

  await deleteDoc(docRef);
  console.log('Activity deleted successfully');
}

/**
 * Get activity statistics for admin dashboard
 */
export async function getActivityStatistics(): Promise<ActivityStatistics> {
  const db = getDb();
  const q = query(collection(db, 'activities'));
  const querySnapshot = await getDocs(q);
  const activities = querySnapshot.docs.map(doc => doc.data() as Activity);

  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Initialize statistics
  const stats: ActivityStatistics = {
    totalActivities: activities.length,
    activitiesByType: {
      training: 0,
      event: 0,
      announcement: 0,
      competition: 0,
      ceremony: 0,
      workshop: 0,
      meeting: 0,
      exercise: 0
    },
    upcomingActivities: 0,
    ongoingActivities: 0,
    completedActivities: 0,
    activitiesThisMonth: 0,
    activitiesByLocation: {}
  };

  // Calculate statistics
  activities.forEach(activity => {
    // Count by type
    stats.activitiesByType[activity.activityType]++;

    // Count by location
    if (activity.location) {
      stats.activitiesByLocation[activity.location] = (stats.activitiesByLocation[activity.location] || 0) + 1;
    }

    // Count by status based on date
    const activityDate = activity.date.toDate();
    if (activityDate > now) {
      stats.upcomingActivities++;
    } else if (activityDate.toDateString() === now.toDateString()) {
      stats.ongoingActivities++;
    } else {
      stats.completedActivities++;
    }

    // Count activities this month
    if (activityDate >= thisMonth && activityDate < nextMonth) {
      stats.activitiesThisMonth++;
    }
  });

  return stats;
}

/**
 * Get activities by type
 */
export async function getActivitiesByType(type: ActivityType): Promise<Activity[]> {
  const db = getDb();
  const q = query(
    collection(db, 'activities'),
    where('activityType', '==', type),
    where('isActive', '==', true),
    orderBy('date', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Activity);
}

/**
 * Toggle activity active status
 */
export async function toggleActivityStatus(activityId: string, isActive: boolean): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'activities', activityId);

  await updateDoc(docRef, {
    isActive,
    updatedAt: serverTimestamp()
  });
}

/**
 * Search activities
 */
export async function searchActivities(searchQuery: string): Promise<Activity[]> {
  const db = getDb();
  const q = query(
    collection(db, 'activities'),
    where('isActive', '==', true),
    orderBy('date', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const activities = querySnapshot.docs.map(doc => doc.data() as Activity);

  // Client-side search
  const searchLower = searchQuery.toLowerCase();
  return activities.filter(activity =>
    activity.title.toLowerCase().includes(searchLower) ||
    activity.description.toLowerCase().includes(searchLower) ||
    (activity.location && activity.location.toLowerCase().includes(searchLower))
  );
}

/**
 * Get activities with registration counts
 */
export async function getActivitiesWithRegistrationCounts(
  filters?: ActivityFilters,
  pageSize: number = 50
): Promise<ActivityQueryResult> {
  const db = getDb();
  let q = query(collection(db, 'activities'));

  // Apply filters
  const constraints: QueryConstraint[] = [];

  if (filters?.activityType) {
    constraints.push(where('activityType', '==', filters.activityType));
  }

  if (filters?.createdBy) {
    constraints.push(where('createdBy', '==', filters.createdBy));
  }

  if (filters?.isActive !== undefined) {
    constraints.push(where('isActive', '==', filters.isActive));
  }

  if (filters?.dateRange) {
    constraints.push(where('date', '>=', filters.dateRange.start));
    constraints.push(where('date', '<=', filters.dateRange.end));
  }

  // Add ordering
  constraints.push(orderBy('date', 'desc'));

  // Add pagination
  constraints.push(limit(pageSize));

  q = query(collection(db, 'activities'), ...constraints);

  const querySnapshot = await getDocs(q);
  const activities = querySnapshot.docs.map(doc => doc.data() as Activity);

  // Initialize all activities with 0 registered count
  const activitiesWithCounts = activities.map(activity => ({
    ...activity,
    registeredCount: 0
  }));

  // Apply search query filter (client-side)
  let filteredActivities = activitiesWithCounts;
  if (filters?.searchQuery) {
    const searchLower = filters.searchQuery.toLowerCase();
    filteredActivities = activitiesWithCounts.filter(activity =>
      activity.title.toLowerCase().includes(searchLower) ||
      activity.description.toLowerCase().includes(searchLower) ||
      (activity.location && activity.location.toLowerCase().includes(searchLower))
    );
  }

  // Apply location filter (client-side for flexibility)
  if (filters?.location) {
    const locationLower = filters.location.toLowerCase();
    filteredActivities = filteredActivities.filter(activity =>
      activity.location?.toLowerCase().includes(locationLower)
    );
  }

  return {
    activities: filteredActivities,
    totalCount: filteredActivities.length,
    hasNextPage: querySnapshot.docs.length === pageSize,
    lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1]
  };
}