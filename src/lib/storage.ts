/**
 * Firebase Storage utilities for PISPA Connect
 * Handles file upload, download, and management operations
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  StorageReference
} from 'firebase/storage';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { getStorageInstance, getDb } from './firebase';
import type { User } from '@/types/user';

// File type definitions
export interface FileMetadata {
  id: string;
  name: string;
  type: string;
  size: number;
  category: FileCategory;
  uploadedBy: string;
  uploadedAt: Timestamp;
  downloadURL: string;
  storagePath: string;
  description?: string;
  tags?: string[];
}

export type FileCategory = 'learning-materials' | 'drill-guides' | 'activity-files' | 'profile-photos';

export interface UploadOptions {
  category: FileCategory;
  description?: string;
  tags?: string[];
  onProgress?: (progress: number) => void;
  onError?: (error: Error) => void;
  onComplete?: (metadata: FileMetadata) => void;
}

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  'learning-materials': 10 * 1024 * 1024, // 10MB
  'drill-guides': 50 * 1024 * 1024, // 50MB (for videos)
  'activity-files': 10 * 1024 * 1024, // 10MB
  'profile-photos': 5 * 1024 * 1024, // 5MB
} as const;

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  'learning-materials': [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  'drill-guides': [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4',
    'video/quicktime',
    'image/jpeg',
    'image/png',
  ],
  'activity-files': [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'video/mp4',
  ],
  'profile-photos': [
    'image/jpeg',
    'image/png',
  ],
} as const;

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
  file: File,
  user: User,
  options: UploadOptions
): Promise<FileMetadata> {
  const storage = getStorageInstance();
  const db = getDb();

  // Validate file size
  const maxSize = FILE_SIZE_LIMITS[options.category];
  if (file.size > maxSize) {
    throw new Error(`File size exceeds limit of ${maxSize / (1024 * 1024)}MB for ${options.category}`);
  }

  // Validate file type
  const allowedTypes = ALLOWED_FILE_TYPES[options.category];
  if (!(allowedTypes as readonly string[]).includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed for ${options.category}`);
  }

  // Generate unique file ID and filename
  const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const fileName = `${fileId}-${file.name}`;
  const storagePath = `${options.category}/${user.userId}/${fileName}`;

  console.log('Upload debug info:', {
    category: options.category,
    userId: user.userId,
    userEmail: user.email,
    fileName: fileName,
    storagePath: storagePath,
    fileSize: file.size,
    fileType: file.type,
    fullStoragePath: `gs://${storage.app.options.storageBucket}/${storagePath}`
  });

  const storageRef = ref(storage, storagePath);

  // Create file metadata
  const metadata: Omit<FileMetadata, 'downloadURL'> = {
    id: fileId,
    name: file.name,
    type: file.type,
    size: file.size,
    category: options.category,
    uploadedBy: user.userId,
    uploadedAt: serverTimestamp() as Timestamp,
    storagePath,
    description: options.description,
    tags: options.tags || [],
  };

  // Upload file with progress tracking
  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        options.onProgress?.(progress);
        console.log(`Upload progress: ${progress.toFixed(1)}% (${snapshot.bytesTransferred}/${snapshot.totalBytes} bytes)`);
      },
      (error) => {
        console.error('Upload error:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          serverResponse: error.customData?.serverResponse,
          storagePath: storagePath
        });
        options.onError?.(error as Error);
        reject(error);
      },
      async () => {
        try {
          console.log('Upload completed successfully, getting download URL...');
          // Get download URL
          const downloadURL = await getDownloadURL(storageRef);
          console.log('Download URL obtained:', downloadURL ? 'SUCCESS' : 'FAILED');

          // Complete metadata with download URL
          const completeMetadata: FileMetadata = {
            ...metadata,
            downloadURL,
          };

          console.log('Saving metadata to Firestore...');
          // Save metadata to Firestore only after successful upload
          await setDoc(doc(db, 'files', fileId), completeMetadata);
          console.log('Firestore document saved successfully');

          options.onComplete?.(completeMetadata);
          resolve(completeMetadata);
        } catch (error) {
          console.error('Error in upload completion:', {
            error: error,
            errorCode: (error as any).code,
            errorMessage: (error as any).message,
            fileId: fileId,
            storagePath: storagePath
          });
          options.onError?.(error as Error);
          reject(error);
        }
      }
    );
  });
}

/**
 * Get file metadata from Firestore
 */
export async function getFileMetadata(fileId: string): Promise<FileMetadata | null> {
  const db = getDb();
  const docRef = doc(db, 'files', fileId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as FileMetadata;
  }

  return null;
}

/**
 * List files by category
 */
export async function listFilesByCategory(category: FileCategory): Promise<FileMetadata[]> {
  const db = getDb();
  const q = query(
    collection(db, 'files'),
    where('category', '==', category)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as FileMetadata);
}

/**
 * List files uploaded by a specific user
 */
export async function listFilesByUser(userId: string): Promise<FileMetadata[]> {
  const db = getDb();
  const q = query(
    collection(db, 'files'),
    where('uploadedBy', '==', userId)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as FileMetadata);
}

/**
 * Delete a file from Storage and Firestore
 */
export async function deleteFile(fileId: string): Promise<void> {
  const storage = getStorageInstance();
  const db = getDb();

  // Get file metadata
  const metadata = await getFileMetadata(fileId);
  if (!metadata) {
    throw new Error('File not found');
  }

  console.log('Deleting file with metadata:', {
    fileId: metadata.id,
    fileName: metadata.name,
    storagePath: metadata.storagePath,
    category: metadata.category,
    uploadedBy: metadata.uploadedBy
  });

  // Delete from Storage
  const storageRef = ref(storage, metadata.storagePath);
  console.log('Full Storage URL:', `gs://${storage.app.options.storageBucket}/${metadata.storagePath}`);
  try {
    await deleteObject(storageRef);
    console.log('File deleted from Storage successfully');
  } catch (error) {
    console.error('Error deleting from Storage:', error);
    // If file doesn't exist in Storage, continue with Firestore cleanup
    if ((error as any).code === 'storage/object-not-found') {
      console.log('File already deleted from Storage, cleaning up metadata');
    } else {
      throw error; // Re-throw other errors
    }
  }

  // Delete from Firestore
  await deleteDoc(doc(db, 'files', fileId));
  console.log('Metadata deleted from Firestore successfully');
}

/**
 * Update file metadata
 */
export async function updateFileMetadata(
  fileId: string,
  updates: Partial<Pick<FileMetadata, 'description' | 'tags' | 'name'>>
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, 'files', fileId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get download URL for a file
 */
export async function getFileDownloadURL(fileId: string): Promise<string | null> {
  const metadata = await getFileMetadata(fileId);
  return metadata?.downloadURL || null;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return 'fas fa-image';
  if (type.startsWith('video/')) return 'fas fa-video';
  if (type.includes('pdf')) return 'fas fa-file-pdf';
  if (type.includes('word') || type.includes('document')) return 'fas fa-file-word';
  if (type.includes('powerpoint') || type.includes('presentation')) return 'fas fa-file-powerpoint';
  return 'fas fa-file';
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, category: FileCategory): { valid: boolean; error?: string } {
  // Check file size
  const maxSize = FILE_SIZE_LIMITS[category];
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds limit of ${maxSize / (1024 * 1024)}MB for ${category}`
    };
  }

  // Check file type
  const allowedTypes = ALLOWED_FILE_TYPES[category];
  if (!(allowedTypes as readonly string[]).includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed for ${category}`
    };
  }

  return { valid: true };
}