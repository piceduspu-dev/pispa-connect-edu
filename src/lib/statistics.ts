/**
 * Dashboard Statistics service for PISPA Connect
 * Provides unified statistics data for the admin dashboard
 */

import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, Timestamp } from 'firebase/firestore';
import { getDb } from './firebase';
import { getStudentStatistics, getActiveStudentsCount } from './students';
import { getMaterialStatistics } from './materials';
import { getActivityStatistics, getUpcomingActivities } from './activities';
import { getStudent } from './students';
import { getActivity } from './activities';
import type { Student, LearningMaterial, Activity } from '@/types';

/**
 * Recent Activity Registration interface for dashboard display
 */
export interface RecentActivityRegistration {
  id: string;
  studentName: string;
  studentId: string;
  studentProgramme?: string;
  activityId: string;
  activityTitle: string;
  activityType: string;
  activityDate: Date;
  registeredAt: Date;
  status: 'registered' | 'attended' | 'cancelled' | 'absent';
}

/**
 * Dashboard statistics interface
 */
export interface DashboardStatistics {
  totalStudents: number;
  activeStudents: number;
  totalMaterials: number;
  totalViews: number;
  upcomingActivities: number;
  attendanceRate: number;
  recentRegistrations: RecentActivityRegistration[];
  systemStatus: {
    isOperational: boolean;
    lastUpdated: Date;
  };
}

/**
 * Get comprehensive dashboard statistics
 */
export async function getDashboardStatistics(): Promise<DashboardStatistics> {
  try {
    console.log('Fetching dashboard statistics...');

    // Fetch all statistics in parallel for better performance
    const [
      studentStats,
      activeStudentsCount,
      materialStats,
      activityStats,
      upcomingActivitiesList,
      attendanceRate
    ] = await Promise.all([
      getStudentStatistics(),
      getActiveStudentsCount(),
      getMaterialStatistics(),
      getActivityStatistics(),
      getUpcomingActivities(),
      getAttendanceRate()
    ]);

    console.log('Statistics fetched:', {
      totalStudents: studentStats.totalStudents,
      activeStudents: activeStudentsCount,
      totalMaterials: materialStats.totalMaterials,
      totalViews: materialStats.totalViews,
      upcomingActivities: upcomingActivitiesList.length,
      attendanceRate: attendanceRate
    });

    // Get recent activity registrations
    console.log('Getting recent activity registrations...');
    const recentRegistrations = await getRecentActivityRegistrations(5);
    console.log('Recent registrations result:', recentRegistrations);

    const dashboardStats: DashboardStatistics = {
      totalStudents: studentStats.totalStudents,
      activeStudents: activeStudentsCount,
      totalMaterials: materialStats.totalMaterials,
      totalViews: materialStats.totalViews,
      upcomingActivities: upcomingActivitiesList.length,
      attendanceRate,
      recentRegistrations,
      systemStatus: {
        isOperational: true,
        lastUpdated: new Date()
      }
    };

    console.log('Dashboard statistics compiled successfully');
    return dashboardStats;

  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);

    // Return default stats with error status
    return {
      totalStudents: 0,
      activeStudents: 0,
      totalMaterials: 0,
      totalViews: 0,
      upcomingActivities: 0,
      attendanceRate: 0,
      recentRegistrations: [],
      systemStatus: {
        isOperational: false,
        lastUpdated: new Date()
      }
    };
  }
}

/**
 * Get summary statistics for quick overview
 */
export async function getSummaryStatistics() {
  try {
    const stats = await getDashboardStatistics();

    return {
      overview: {
        totalStudents: stats.totalStudents,
        activeStudents: stats.activeStudents,
        totalMaterials: stats.totalMaterials,
        totalViews: stats.totalViews,
        upcomingActivities: stats.upcomingActivities,
        attendanceRate: stats.attendanceRate
      },
      engagement: {
        studentActivityRate: stats.totalStudents > 0 ?
          Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0,
        systemHealth: stats.systemStatus.isOperational ? 'Operational' : 'Issues Detected'
      },
      lastUpdated: stats.systemStatus.lastUpdated
    };

  } catch (error) {
    console.error('Error fetching summary statistics:', error);

    return {
      overview: {
        totalStudents: 0,
        activeStudents: 0,
        totalMaterials: 0,
        totalViews: 0,
        upcomingActivities: 0,
        attendanceRate: 0
      },
      engagement: {
        studentActivityRate: 0,
        systemHealth: 'Error'
      },
      lastUpdated: new Date()
    };
  }
}

/**
 * Get detailed analytics for export or reporting
 */
export async function getDetailedAnalytics() {
  try {
    const [
      studentStats,
      materialStats,
      activityStats
    ] = await Promise.all([
      getStudentStatistics(),
      getMaterialStatistics(),
      getActivityStatistics()
    ]);

    return {
      students: {
        ...studentStats,
        growthRate: studentStats.recentEnrollments > 0 ? 'Positive' : 'Stable'
      },
      materials: {
        ...materialStats,
        averageFileSize: materialStats.totalMaterials > 0 ?
          Math.round(materialStats.storageUsed / materialStats.totalMaterials) : 0,
        storageUsedFormatted: formatBytes(materialStats.storageUsed)
      },
      activities: {
        ...activityStats,
        completionRate: activityStats.totalActivities > 0 ?
          Math.round((activityStats.completedActivities / activityStats.totalActivities) * 100) : 0
      },
      generatedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching detailed analytics:', error);
    throw new Error('Failed to fetch detailed analytics');
  }
}

/**
 * Calculate attendance rate from activity registrations
 */
export async function getAttendanceRate(days: number = 30): Promise<number> {
  try {
    console.log('Calculating attendance rate...');

    const db = getDb();

    // Get registrations from the last N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const q = query(
      collection(db, 'activityRegistrations'),
      where('registeredAt', '>=', Timestamp.fromDate(startDate)),
      where('status', 'in', ['attended', 'absent']) // Only count attended/absent for rate calculation
    );

    const querySnapshot = await getDocs(q);
    const registrations = querySnapshot.docs.map(doc => doc.data() as any);

    console.log(`Found ${registrations.length} attendance records in last ${days} days`);

    if (registrations.length === 0) {
      return 0; // No attendance data available
    }

    // Count attended vs absent
    const attendedCount = registrations.filter(reg => reg.status === 'attended').length;
    const absentCount = registrations.filter(reg => reg.status === 'absent').length;
    const totalAttendanceRecords = attendedCount + absentCount;

    if (totalAttendanceRecords === 0) {
      return 0; // No definitive attendance records
    }

    const attendanceRate = Math.round((attendedCount / totalAttendanceRecords) * 100);

    console.log(`Attendance rate calculated: ${attendanceRate}% (${attendedCount}/${totalAttendanceRecords})`);

    return attendanceRate;

  } catch (error) {
    console.error('Error calculating attendance rate:', error);
    return 0; // Return 0 on error
  }
}

/**
 * Get recent activity registrations for dashboard
 */
export async function getRecentActivityRegistrations(limitCount: number = 5): Promise<RecentActivityRegistration[]> {
  try {
    console.log('Fetching recent activity registrations...');

    const db = getDb();

    // Debug: Check if the collection exists and has data
    console.log('Checking activityRegistrations collection...');

    // Let's also try to check if we can access the students collection to verify our connection
    try {
      const studentsQuery = query(collection(db, 'students'), limit(1));
      const studentsSnapshot = await getDocs(studentsQuery);
      console.log(`Students collection test: Found ${studentsSnapshot.docs.length} students`);
    } catch (error) {
      console.error('Error accessing students collection:', error);
    }

    const q = query(
      collection(db, 'activityRegistrations'),
      orderBy('registeredAt', 'desc'),
      limit(limitCount * 2) // Get more than needed to account for filtered results
    );

    const querySnapshot = await getDocs(q);
    const allRegistrations = querySnapshot.docs.map(doc => doc.data() as any);

    console.log(`Found ${allRegistrations.length} activity registrations`);
    console.log('Raw registrations data:', allRegistrations);
    console.log('First registration data structure:', allRegistrations[0] ? Object.keys(allRegistrations[0]) : 'No registrations found');

    // Process each registration to get complete details
    const recentRegistrations: RecentActivityRegistration[] = [];

    for (const registration of allRegistrations) {
      try {
        // Get student details - try students collection first
        let student = await getStudent(registration.studentId);

        // If not found in students collection, try users collection
        if (!student) {
          console.log(`Student not found in students collection, trying users collection for: ${registration.studentId}`);
          try {
            const userDoc = await getDoc(doc(db, 'users', registration.studentId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log('Found user in users collection:', userData);

              // Create a student-like object from user data
              student = {
                studentId: userData.studentId || 'N/A',
                fullName: userData.displayName || 'Unknown User',
                programme: userData.programme || 'N/A',
                // Use fallback values for other fields
                semester: userData.semester || 1,
                email: userData.email || 'N/A',
                phoneNumber: userData.phoneNumber || 'N/A',
                emergencyContact: userData.emergencyContact || 'N/A',
                profilePhotoURL: userData.profilePhotoURL || '',
                trainingStatus: userData.trainingStatus || 'active',
                enrollmentDate: Timestamp.now(),
                createdAt: userData.createdAt || Timestamp.now(),
                updatedAt: userData.updatedAt || Timestamp.now()
              };
              console.log('Created student object from user data:', student);
            }
          } catch (userError) {
            console.error('Error accessing users collection:', userError);
          }
        }

        if (!student) {
          console.warn(`Student not found in either collection for registration: ${registration.studentId}`);
          continue;
        }

        // Get activity details
        const activity = await getActivity(registration.activityId);

        // Create activity registration object
        const activityRegistration: RecentActivityRegistration = {
          id: registration.id,
          studentName: student.fullName,
          studentId: registration.studentId,
          studentProgramme: student.programme,
          activityId: registration.activityId,
          activityTitle: activity?.title || 'Unknown Activity',
          activityType: activity?.activityType || 'unknown',
          activityDate: activity?.date.toDate() || new Date(),
          registeredAt: registration.registeredAt.toDate(),
          status: registration.status as 'registered' | 'attended' | 'cancelled' | 'absent'
        };

        recentRegistrations.push(activityRegistration);
      } catch (error) {
        console.error(`Error processing registration ${registration.id}:`, error);
        // Continue with other registrations
      }
    }

    // Sort by registration date (newest first)
    recentRegistrations.sort((a, b) => b.registeredAt.getTime() - a.registeredAt.getTime());

    console.log(`Successfully processed ${recentRegistrations.length} recent activity registrations`);
    return recentRegistrations.slice(0, limitCount);

  } catch (error) {
    console.error('Error fetching recent activity registrations:', error);
    return [];
  }
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check system health status
 */
export async function checkSystemHealth(): Promise<{
  status: 'healthy' | 'warning' | 'error';
  issues: string[];
  lastChecked: Date;
}> {
  const issues: string[] = [];

  try {
    // Test database connectivity by fetching basic stats
    const stats = await getSummaryStatistics();

    // Check for potential issues
    if (stats.overview.totalStudents === 0) {
      issues.push('No students found in the system');
    }

    if (stats.overview.totalMaterials === 0) {
      issues.push('No learning materials found in the system');
    }

    if (stats.engagement.studentActivityRate < 50) {
      issues.push('Low student activity rate detected');
    }

    // Determine overall status
    let status: 'healthy' | 'warning' | 'error' = 'healthy';

    if (issues.length >= 2 || stats.engagement.systemHealth === 'Error') {
      status = 'error';
    } else if (issues.length > 0) {
      status = 'warning';
    }

    return {
      status,
      issues,
      lastChecked: new Date()
    };

  } catch (error) {
    console.error('System health check failed:', error);

    return {
      status: 'error',
      issues: ['Failed to connect to database or services'],
      lastChecked: new Date()
    };
  }
}

/**
 * Get statistics for a specific date range
 */
export async function getStatisticsForDateRange(
  startDate: Date,
  endDate: Date
): Promise<{
  newStudents: number;
  newMaterials: number;
  newActivities: number;
}> {
  try {
    // This would require extending the other services to support date filtering
    // For now, return placeholder implementation
    console.log(`Fetching statistics for date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // TODO: Implement actual date range queries in students.ts, materials.ts, activities.ts

    return {
      newStudents: 0,
      newMaterials: 0,
      newActivities: 0
    };

  } catch (error) {
    console.error('Error fetching date range statistics:', error);

    return {
      newStudents: 0,
      newMaterials: 0,
      newActivities: 0
    };
  }
}