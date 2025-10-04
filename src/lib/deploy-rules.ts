/**
 * Firebase Security Rules Deployment Helper
 * This file contains instructions and commands to deploy security rules
 */

/**
 * FIRESTORE SECURITY RULES DEPLOYMENT
 *
 * To deploy Firestore security rules, run:
 * firebase deploy --only firestore:rules
 *
 * OR use the Firebase Console:
 * 1. Go to Firebase Console → Your Project → Firestore Database
 * 2. Click on "Rules" tab
 * 3. Copy the contents of firestore.rules and paste it
 * 4. Click "Publish"
 */

/**
 * FIREBASE STORAGE SECURITY RULES DEPLOYMENT
 *
 * To deploy Storage security rules, run:
 * firebase deploy --only storage:rules
 *
 * OR use the Firebase Console:
 * 1. Go to Firebase Console → Your Project → Storage
 * 2. Click on "Rules" tab
 * 3. Copy the contents of storage.rules and paste it
 * 4. Click "Publish"
 */

// Firebase CLI commands for deployment
export const FIREBASE_DEPLOY_COMMANDS = {
  firestore: 'firebase deploy --only firestore:rules',
  storage: 'firebase deploy --only storage:rules',
  both: 'firebase deploy --only firestore:rules,storage:rules',
} as const;

// Security rules summary for documentation
export const SECURITY_RULES_SUMMARY = {
  firestore: {
    users: 'Admin read/write, users read own data',
    students: 'Admin full access, student read access',
    learningMaterials: 'Admin full access, student read access',
    activities: 'Admin full access, student read access',
    categories: 'Admin full access, student read access',
    systemLogs: 'Admin only',
  },
  storage: {
    'learning-materials': 'Admin write, all authenticated users read',
    'drill-guides': 'Admin write, all authenticated users read',
    'student-photos': 'Admin write, students read own photos',
    'activity-media': 'Admin write, all authenticated users read',
    fileSizeLimits: {
      documents: '10MB',
      images: '10MB',
      videos: '50MB',
    },
  },
} as const;

// Testing checklist for security rules
export const SECURITY_RULES_TEST_CHECKLIST = [
  'Admin can create, read, update, delete students',
  'Student can read student data but not modify',
  'Admin can upload and manage learning materials',
  'Student can read learning materials but not upload',
  'Admin can create and manage activities',
  'Student can read activities but not create',
  'Users can only access their own profile data',
  'File size limits are enforced',
  'Only authenticated users can access files',
] as const;