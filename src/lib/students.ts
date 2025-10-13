/**
 * Students data service for PISPA Connect
 * Handles student data operations and statistics
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
  Student,
  UpdateStudentData,
  StudentFilters,
  StudentQueryResult,
  StudentStatistics,
  TrainingStatus
} from '@/types/student';
import type { User } from '@/types/user';


/**
 * Get student by ID
 */
export async function getStudent(studentId: string): Promise<Student | null> {
  const db = getDb();
  const docRef = doc(db, 'students', studentId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Student;
  }

  return null;
}

/**
 * Get all students with optional filtering
 */
export async function getStudents(
  filters?: StudentFilters,
  pageSize: number = 50,
  lastVisible?: any
): Promise<StudentQueryResult> {
  const db = getDb();
  let q = query(collection(db, 'students'));

  // Apply filters
  const constraints: QueryConstraint[] = [];

  if (filters?.programme) {
    constraints.push(where('programme', '==', filters.programme));
  }

  if (filters?.semester) {
    constraints.push(where('semester', '==', filters.semester));
  }

  if (filters?.trainingStatus) {
    constraints.push(where('trainingStatus', '==', filters.trainingStatus));
  }

  // Add ordering
  constraints.push(orderBy('createdAt', 'desc'));

  // Add pagination
  constraints.push(limit(pageSize));

  q = query(collection(db, 'students'), ...constraints);

  const querySnapshot = await getDocs(q);
  const students = querySnapshot.docs.map(doc => doc.data() as Student);

  // Apply search query filter (client-side)
  let filteredStudents = students;
  if (filters?.searchQuery) {
    const searchLower = filters.searchQuery.toLowerCase();
    filteredStudents = students.filter(student =>
      student.fullName.toLowerCase().includes(searchLower) ||
      student.studentId.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower)
    );
  }

  return {
    students: filteredStudents,
    totalCount: filteredStudents.length,
    hasNextPage: querySnapshot.docs.length === pageSize,
    lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1]
  };
}

/**
 * Update a student
 */
export async function updateStudent(
  studentId: string,
  updates: UpdateStudentData
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'students', studentId);

  console.log('Updating student:', {
    studentId,
    updates
  });

  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });

  console.log('Student updated successfully');
}

/**
 * Delete a student
 */
export async function deleteStudent(studentId: string): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'students', studentId);

  console.log('Deleting student:', { studentId });

  await deleteDoc(docRef);
  console.log('Student deleted successfully');
}

/**
 * Get student statistics for admin dashboard
 */
export async function getStudentStatistics(): Promise<StudentStatistics> {
  const db = getDb();
  const q = query(collection(db, 'students'));
  const querySnapshot = await getDocs(q);
  const students = querySnapshot.docs.map(doc => doc.data() as Student);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Initialize statistics
  const stats: StudentStatistics = {
    totalStudents: students.length,
    studentsByProgramme: {},
    studentsBySemester: {},
    studentsByTrainingStatus: {},
    recentEnrollments: 0
  };

  // Calculate statistics
  students.forEach(student => {
    // Count by programme
    stats.studentsByProgramme[student.programme] = (stats.studentsByProgramme[student.programme] || 0) + 1;

    // Count by semester
    stats.studentsBySemester[student.semester] = (stats.studentsBySemester[student.semester] || 0) + 1;

    // Count by training status
    const status = student.trainingStatus || 'active';
    stats.studentsByTrainingStatus[status] = (stats.studentsByTrainingStatus[status] || 0) + 1;

    // Count recent enrollments (last 30 days)
    const enrollmentDate = student.enrollmentDate.toDate();
    if (enrollmentDate >= thirtyDaysAgo) {
      stats.recentEnrollments++;
    }
  });

  return stats;
}

/**
 * Get recent student registrations for dashboard
 */
export async function getRecentRegistrations(limitCount: number = 10): Promise<Student[]> {
  const db = getDb();
  const q = query(
    collection(db, 'students'),
    orderBy('enrollmentDate', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Student);
}

/**
 * Get students by training status
 */
export async function getStudentsByTrainingStatus(status: TrainingStatus): Promise<Student[]> {
  const db = getDb();
  const q = query(
    collection(db, 'students'),
    where('trainingStatus', '==', status),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Student);
}

/**
 * Get active students count
 */
export async function getActiveStudentsCount(): Promise<number> {
  const db = getDb();
  const q = query(
    collection(db, 'students'),
    where('trainingStatus', '==', 'active')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.length;
}

/**
 * Search students
 */
export async function searchStudents(searchQuery: string): Promise<Student[]> {
  const db = getDb();
  const q = query(
    collection(db, 'students'),
    orderBy('fullName', 'asc')
  );

  const querySnapshot = await getDocs(q);
  const students = querySnapshot.docs.map(doc => doc.data() as Student);

  // Client-side search
  const searchLower = searchQuery.toLowerCase();
  return students.filter(student =>
    student.fullName.toLowerCase().includes(searchLower) ||
    student.studentId.toLowerCase().includes(searchLower) ||
    student.email.toLowerCase().includes(searchLower) ||
    (student.programme && student.programme.toLowerCase().includes(searchLower))
  );
}

/**
 * Toggle student training status
 */
export async function toggleStudentStatus(studentId: string, status: TrainingStatus): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'students', studentId);

  await updateDoc(docRef, {
    trainingStatus: status,
    updatedAt: serverTimestamp()
  });
}