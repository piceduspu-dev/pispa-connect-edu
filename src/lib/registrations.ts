/**
 * Activity Registration utilities for PISPA Connect
 * Handles student registration for activities
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
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { getDb } from './firebase';
import {
  ActivityRegistration,
  StudentRegistrationWithActivity
} from '@/types/registrations';
import { Activity } from '@/types/activities';

/**
 * Register a student for an activity
 */
export async function registerForActivity(
  activityId: string,
  studentId: string,
  notes?: string
): Promise<ActivityRegistration> {
  const db = getDb();

  // Generate registration ID
  const registrationId = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create registration document
  const registration: ActivityRegistration = {
    id: registrationId,
    activityId,
    studentId,
    registeredAt: serverTimestamp() as Timestamp,
    status: 'registered',
    notes: notes || '', // Convert undefined to empty string
    createdAt: serverTimestamp() as Timestamp,
  };

  console.log('Creating registration:', {
    registrationId,
    activityId,
    studentId,
    status: 'registered',
    notes: notes || ''
  });

  // Save to Firestore
  await setDoc(doc(db, 'activityRegistrations', registrationId), registration);
  console.log('Registration created successfully');

  // Update activity registration count
  await updateActivityRegistrationCount(activityId);

  return registration;
}

/**
 * Cancel a student's registration
 */
export async function cancelRegistration(
  registrationId: string,
  reason?: string
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'activityRegistrations', registrationId);

  console.log('Cancelling registration:', { registrationId, reason });

  // Get registration to get activityId
  const registrationDoc = await getDoc(docRef);
  if (!registrationDoc.exists()) {
    throw new Error('Registration not found');
  }

  const registration = registrationDoc.data() as ActivityRegistration;
  const activityId = registration.activityId;

  // Update registration status
  await updateDoc(docRef, {
    status: 'cancelled',
    notes: reason || registration.notes,
    updatedAt: serverTimestamp()
  });

  console.log('Registration cancelled successfully');

  // Update activity registration count
  await updateActivityRegistrationCount(activityId);
}

/**
 * Get all registrations for a specific activity
 */
export async function getRegistrationsByActivity(
  activityId: string
): Promise<ActivityRegistration[]> {
  const db = getDb();
  const q = query(
    collection(db, 'activityRegistrations'),
    where('activityId', '==', activityId),
    where('status', 'in', ['registered', 'attended']),
    orderBy('registeredAt', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as ActivityRegistration);
}

/**
 * Get all registrations for a specific student
 */
export async function getStudentRegistrations(
  studentId: string
): Promise<StudentRegistrationWithActivity[]> {
  console.log('🔍 getStudentRegistrations called with studentId:', studentId);

  try {
    const db = getDb();
    console.log('🔍 Database instance obtained');

    const q = query(
      collection(db, 'activityRegistrations'),
      where('studentId', '==', studentId),
      where('status', 'in', ['registered', 'attended']),
      orderBy('registeredAt', 'desc')
    );
    console.log('🔍 Query created for activityRegistrations');

    const querySnapshot = await getDocs(q);
    console.log('🔍 Query executed, found', querySnapshot.size, 'registrations');

    const registrations = querySnapshot.docs.map(doc => doc.data() as ActivityRegistration);
    console.log('🔍 Registrations mapped:', registrations.length);

    // Get activity details for each registration
    const registrationsWithActivities: StudentRegistrationWithActivity[] = [];
    console.log('🔍 Starting to fetch activity details for', registrations.length, 'registrations');

    for (let i = 0; i < registrations.length; i++) {
      const registration = registrations[i];
      console.log(`🔍 Processing registration ${i + 1}/${registrations.length}:`, registration.activityId);

      try {
        const activityDoc = await getDoc(doc(db, 'activities', registration.activityId));
        console.log(`🔍 Activity doc exists:`, activityDoc.exists());

        if (activityDoc.exists()) {
          const activity = activityDoc.data() as Activity;
          console.log(`🔍 Activity data retrieved:`, activity.title);
          registrationsWithActivities.push({
            ...registration,
            activity: {
              id: activity.activityId,
              title: activity.title,
              activityType: activity.activityType,
              date: activity.date,
              location: activity.location
            }
          });
        } else {
          console.warn(`⚠️ Activity not found for ID: ${registration.activityId}`);
        }
      } catch (error) {
        console.error(`❌ Error fetching activity for registration ${registration.activityId}:`, error);
      }
    }

    console.log('🔍 Final result:', registrationsWithActivities.length, 'registrations with activities');
    return registrationsWithActivities;
  } catch (error) {
    console.error('❌ Error in getStudentRegistrations:', error);
    throw error;
  }
}

/**
 * Check if a student is already registered for an activity
 */
export async function getStudentRegistrationForActivity(
  activityId: string,
  studentId: string
): Promise<ActivityRegistration | null> {
  const db = getDb();
  const q = query(
    collection(db, 'activityRegistrations'),
    where('activityId', '==', activityId),
    where('studentId', '==', studentId),
    where('status', '==', 'registered')
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return doc.data() as ActivityRegistration;
}

/**
 * Mark attendance for a registration
 */
export async function markAttendance(
  registrationId: string,
  attended: boolean
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'activityRegistrations', registrationId);

  console.log('Marking attendance:', { registrationId, attended });

  await updateDoc(docRef, {
    status: attended ? 'attended' : 'absent',
    updatedAt: serverTimestamp()
  });

  console.log('Attendance marked successfully');
}

/**
 * Update activity registration count
 */
export async function updateActivityRegistrationCount(
  activityId: string
): Promise<void> {
  const db = getDb();

  try {
    // Get current registration count
    const q = query(
      collection(db, 'activityRegistrations'),
      where('activityId', '==', activityId),
      where('status', '==', 'registered')
    );

    const querySnapshot = await getDocs(q);
    const registrationCount = querySnapshot.size;

    // Update activity document
    const activityRef = doc(db, 'activities', activityId);
    await updateDoc(activityRef, {
      registeredCount: registrationCount,
      updatedAt: serverTimestamp()
    });

    console.log(`Updated registration count for activity ${activityId}: ${registrationCount}`);
  } catch (error) {
    console.error('Error updating activity registration count:', error);
    // Don't throw error to prevent breaking the registration flow
  }
}

/**
 * Get available slots for an activity
 */
export async function getAvailableActivitySlots(
  activityId: string
): Promise<{ available: number; total: number; registered: number }> {
  const db = getDb();

  try {
    // Get activity details
    const activityDoc = await getDoc(doc(db, 'activities', activityId));
    if (!activityDoc.exists()) {
      throw new Error('Activity not found');
    }

    const activity = activityDoc.data() as Activity;
    const maxParticipants = activity.maxParticipants;

    // Get current registration count
    const q = query(
      collection(db, 'activityRegistrations'),
      where('activityId', '==', activityId),
      where('status', '==', 'registered')
    );

    const querySnapshot = await getDocs(q);
    const registeredCount = querySnapshot.size;

    if (maxParticipants) {
      return {
        available: Math.max(0, maxParticipants - registeredCount),
        total: maxParticipants,
        registered: registeredCount
      };
    } else {
      // No capacity limit
      return {
        available: 999, // Unlimited
        total: 999,
        registered: registeredCount
      };
    }
  } catch (error) {
    console.error('Error getting available slots:', error);
    return {
      available: 0,
      total: 0,
      registered: 0
    };
  }
}

// Re-export types for convenience
export type { ActivityRegistration, StudentRegistrationWithActivity } from '@/types/registrations';