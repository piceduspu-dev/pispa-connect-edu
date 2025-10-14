/**
 * User Activity tracking service for PISPA Connect
 * Handles user download tracking and activity logging
 */

import {
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { getDb } from './firebase';
import type { MaterialActivity } from '@/types/materials';

/**
 * Log a user download activity
 */
export async function logUserDownload(
  userId: string,
  userEmail: string,
  materialId: string,
  materialTitle: string,
  materialFileName: string
): Promise<void> {
  try {
    const db = getDb();

    // Generate activity ID
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create activity document
    const activity: MaterialActivity = {
      action: 'download',
      materialId,
      materialTitle,
      userId,
      userEmail,
      timestamp: serverTimestamp() as Timestamp,
      details: `Downloaded file: ${materialFileName}`
    };

    console.log('Logging user download:', {
      activityId,
      userId,
      userEmail,
      materialId,
      materialTitle,
      materialFileName
    });

    // Save to Firestore
    await setDoc(doc(db, 'userActivities', activityId), activity);
    console.log('User download logged successfully');

  } catch (error) {
    console.error('Error logging user download:', error);
    // Don't throw error - logging failures shouldn't break the download experience
  }
}

/**
 * Log a user view activity
 */
export async function logUserView(
  userId: string,
  userEmail: string,
  materialId: string,
  materialTitle: string
): Promise<void> {
  try {
    const db = getDb();

    // Generate activity ID
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create activity document
    const activity: MaterialActivity = {
      action: 'view',
      materialId,
      materialTitle,
      userId,
      userEmail,
      timestamp: serverTimestamp() as Timestamp,
      details: `Viewed material: ${materialTitle}`
    };

    console.log('Logging user view:', {
      activityId,
      userId,
      userEmail,
      materialId,
      materialTitle
    });

    // Save to Firestore
    await setDoc(doc(db, 'userActivities', activityId), activity);
    console.log('User view logged successfully');

  } catch (error) {
    console.error('Error logging user view:', error);
    // Don't throw error - logging failures shouldn't break the view experience
  }
}

/**
 * Get total download count for a specific user
 */
export async function getUserDownloadCount(userId: string): Promise<number> {
  try {
    const db = getDb();

    const q = query(
      collection(db, 'userActivities'),
      where('userId', '==', userId),
      where('action', '==', 'download')
    );

    const querySnapshot = await getDocs(q);
    const count = querySnapshot.docs.length;

    console.log(`Found ${count} downloads for user: ${userId}`);
    return count;

  } catch (error) {
    console.error('Error getting user download count:', error);
    return 0;
  }
}

/**
 * Get recent downloads for a specific user
 */
export async function getUserRecentDownloads(
  userId: string,
  limitCount: number = 10
): Promise<MaterialActivity[]> {
  try {
    const db = getDb();

    const q = query(
      collection(db, 'userActivities'),
      where('userId', '==', userId),
      where('action', '==', 'download'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const activities = querySnapshot.docs.map(doc => doc.data() as MaterialActivity);

    console.log(`Found ${activities.length} recent downloads for user: ${userId}`);
    return activities;

  } catch (error) {
    console.error('Error getting user recent downloads:', error);
    return [];
  }
}

/**
 * Get all recent activities for a specific user (downloads + views)
 */
export async function getUserRecentActivities(
  userId: string,
  limitCount: number = 10
): Promise<MaterialActivity[]> {
  try {
    const db = getDb();

    const q = query(
      collection(db, 'userActivities'),
      where('userId', '==', userId),
      where('action', 'in', ['download', 'view']),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const activities = querySnapshot.docs.map(doc => doc.data() as MaterialActivity);

    console.log(`Found ${activities.length} recent activities for user: ${userId}`);
    return activities;

  } catch (error) {
    console.error('Error getting user recent activities:', error);
    return [];
  }
}

/**
 * Get user activity statistics
 */
export async function getUserActivityStats(userId: string): Promise<{
  totalDownloads: number;
  recentActivityCount: number;
  lastActivityDate: Date | null;
}> {
  try {
    const db = getDb();

    const q = query(
      collection(db, 'userActivities'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(100) // Get recent activities for stats
    );

    const querySnapshot = await getDocs(q);
    const activities = querySnapshot.docs.map(doc => doc.data() as MaterialActivity);

    // Calculate statistics
    const downloadActivities = activities.filter(activity => activity.action === 'download');
    const lastActivity = activities.length > 0 ? activities[0] : null;

    // Count recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivityCount = activities.filter(
      activity => activity.timestamp.toDate() >= sevenDaysAgo
    ).length;

    console.log(`User activity stats for ${userId}:`, {
      totalDownloads: downloadActivities.length,
      recentActivityCount,
      lastActivityDate: lastActivity?.timestamp.toDate() || null
    });

    return {
      totalDownloads: downloadActivities.length,
      recentActivityCount,
      lastActivityDate: lastActivity?.timestamp.toDate() || null
    };

  } catch (error) {
    console.error('Error getting user activity stats:', error);
    return {
      totalDownloads: 0,
      recentActivityCount: 0,
      lastActivityDate: null
    };
  }
}

/**
 * Get all user activities (for admin analytics)
 */
export async function getAllUserActivities(limitCount: number = 100): Promise<MaterialActivity[]> {
  try {
    const db = getDb();

    const q = query(
      collection(db, 'userActivities'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const activities = querySnapshot.docs.map(doc => doc.data() as MaterialActivity);

    console.log(`Found ${activities.length} total user activities`);
    return activities;

  } catch (error) {
    console.error('Error getting all user activities:', error);
    return [];
  }
}

/**
 * Clean up old activities (maintenance function)
 */
export async function cleanupOldActivities(daysToKeep: number = 90): Promise<number> {
  try {
    const db = getDb();

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Get old activities
    const q = query(
      collection(db, 'userActivities'),
      where('timestamp', '<', Timestamp.fromDate(cutoffDate))
    );

    const querySnapshot = await getDocs(q);
    const oldActivities = querySnapshot.docs;

    // Delete old activities
    let deletedCount = 0;
    for (const docSnapshot of oldActivities) {
      await deleteDoc(doc(db, 'userActivities', docSnapshot.id));
      deletedCount++;
    }

    console.log(`Cleaned up ${deletedCount} old user activities`);
    return deletedCount;

  } catch (error) {
    console.error('Error cleaning up old activities:', error);
    return 0;
  }
}