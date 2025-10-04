/**
 * Security Rules Testing Utility
 * Use this to verify your Firestore and Storage security rules are working correctly
 */

import { getDb, getStorageInstance } from './firebase';
import { doc, collection, addDoc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Test Firestore Security Rules
 * This will test basic CRUD operations with different scenarios
 */
export async function testFirestoreSecurityRules() {
  console.log('🔒 Testing Firestore Security Rules...');

  const db = getDb();
  const testResults = [];

  try {
    // Test 1: Try to read students collection (should fail for unauthenticated)
    try {
      const studentsRef = collection(db, 'students');
      const testDoc = await getDoc(doc(studentsRef, 'test'));
      testResults.push({
        test: 'Read students collection (unauthenticated)',
        success: false,
        expected: 'Should fail',
        actual: 'Needs authentication check'
      });
    } catch (error) {
      testResults.push({
        test: 'Read students collection (unauthenticated)',
        success: true,
        expected: 'Should fail',
        actual: 'Failed as expected'
      });
    }

    // Test 2: Try to write to students collection (should fail for students)
    try {
      const studentsRef = collection(db, 'students');
      await addDoc(studentsRef, {
        test: 'data'
      });
      testResults.push({
        test: 'Write to students collection (student role)',
        success: false,
        expected: 'Should fail for students',
        actual: 'Succeeded (security issue!)'
      });
    } catch (error) {
      testResults.push({
        test: 'Write to students collection (student role)',
        success: true,
        expected: 'Should fail for students',
        actual: 'Failed as expected'
      });
    }

    console.log('📋 Firestore Security Rules Test Results:');
    testResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.test}`);
      console.log(`   Expected: ${result.expected}`);
      console.log(`   Actual: ${result.actual}`);
    });

    return { success: true, results: testResults };

  } catch (error) {
    console.error('❌ Firestore security rules test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Test Storage Security Rules
 * This will test basic file operations
 */
export async function testStorageSecurityRules() {
  console.log('🔒 Testing Storage Security Rules...');

  const storage = getStorageInstance();
  const testResults = [];

  try {
    // Test 1: Try to upload to learning-materials (should fail for students)
    try {
      const testFile = new Blob(['test content'], { type: 'text/plain' });
      const storageRef = ref(storage, 'learning-materials/test.txt');
      await uploadBytes(storageRef, testFile);
      testResults.push({
        test: 'Upload to learning-materials (student role)',
        success: false,
        expected: 'Should fail for students',
        actual: 'Succeeded (security issue!)'
      });
    } catch (error) {
      testResults.push({
        test: 'Upload to learning-materials (student role)',
        success: true,
        expected: 'Should fail for students',
        actual: 'Failed as expected'
      });
    }

    console.log('📋 Storage Security Rules Test Results:');
    testResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.test}`);
      console.log(`   Expected: ${result.expected}`);
      console.log(`   Actual: ${result.actual}`);
    });

    return { success: true, results: testResults };

  } catch (error) {
    console.error('❌ Storage security rules test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Manual Testing Checklist
 * Use this to manually verify security rules after deployment
 */
export const MANUAL_TESTING_CHECKLIST = [
  {
    category: 'Admin Operations',
    tests: [
      'Admin can create student records',
      'Admin can read all student records',
      'Admin can update student records',
      'Admin can delete student records',
      'Admin can upload learning materials',
      'Admin can manage activities',
    ]
  },
  {
    category: 'Student Operations',
    tests: [
      'Student can read student records',
      'Student cannot modify student records',
      'Student can read learning materials',
      'Student cannot upload learning materials',
      'Student can read activities',
      'Student cannot create activities',
    ]
  },
  {
    category: 'File Operations',
    tests: [
      'Students can download learning materials',
      'Students cannot upload to learning-materials',
      'File size limits are enforced',
      'File type validation works',
    ]
  }
];

/**
 * Deployment Instructions
 */
export const DEPLOYMENT_INSTRUCTIONS = `
🚀 Deploying Security Rules

1. Install Firebase CLI if not already installed:
   npm install -g firebase-tools

2. Login to Firebase:
   firebase login

3. Deploy Firestore Rules:
   firebase deploy --only firestore:rules

4. Deploy Storage Rules:
   firebase deploy --only storage:rules

5. Or deploy both at once:
   firebase deploy --only firestore:rules,storage:rules

📝 After Deployment:
- Test the rules using the test functions above
- Verify admin and student permissions work correctly
- Check Firebase Console for any rule errors
- Monitor Firebase Console for rule violations
`;