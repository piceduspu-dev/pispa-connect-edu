/**
 * Learning Materials data types for PISPA Connect
 * Based on PRD Section 10.2: Learning Materials Data (Cloud Firestore Collection: `learningMaterials`)
 */

import { Timestamp } from 'firebase/firestore';

// Learning Materials document structure (from PRD Section 10.2)
export interface LearningMaterial {
  materialId: string; // Document ID / Primary Key
  title: string;
  description: string;
  category: MaterialCategory;
  fileName: string;
  fileURL: string; // Firebase Storage URL
  fileType: FileType;
  fileSize: number;
  uploadDate: Timestamp;
  lastUpdated: Timestamp;
  uploadedBy: string; // Admin User ID
  downloadCount?: number; // optional
  isActive: boolean;
}

// Material creation data
export interface CreateMaterialData {
  title: string;
  description: string;
  category: MaterialCategory;
  fileName: string;
  fileURL: string;
  fileType: FileType;
  fileSize: number;
  uploadedBy: string;
}

// Material update data
export interface UpdateMaterialData {
  title?: string;
  description?: string;
  category?: MaterialCategory;
  fileName?: string;
  fileURL?: string;
  fileType?: FileType;
  fileSize?: number;
  lastUpdated: Timestamp;
  isActive?: boolean;
}

// Material filter options
export interface MaterialFilters {
  category?: MaterialCategory;
  fileType?: FileType;
  searchQuery?: string;
  uploadedBy?: string;
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };
  isActive?: boolean;
}

// Material query results with pagination
export interface MaterialQueryResult {
  materials: LearningMaterial[];
  totalCount: number;
  hasNextPage: boolean;
  lastVisible?: any; // Firestore document snapshot for pagination
}

// Material categories (from PRD Section 6.1.1)
export type MaterialCategory =
  | 'Learning Notes'
  | 'Drill Guide'
  | 'Marching Guide'
  | 'Activity Information'
  | 'Training Schedule'
  | 'Reference Materials';

// File types supported (from PRD Section 6.1.1)
export type FileType =
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'ppt'
  | 'pptx'
  | 'jpg'
  | 'png'
  | 'mp4'
  | 'mov'
  | 'txt'
  | 'other';

// File upload metadata
export interface FileUploadMetadata {
  fileName: string;
  fileSize: number;
  fileType: FileType;
  category: MaterialCategory;
  description: string;
}

// File size limits (from PRD Section 6.1.1)
export const FILE_SIZE_LIMITS = {
  DOCUMENTS: 10 * 1024 * 1024, // 10MB
  VIDEOS: 50 * 1024 * 1024, // 50MB
  IMAGES: 5 * 1024 * 1024, // 5MB
} as const;

// Supported file types mapping
export const SUPPORTED_FILE_TYPES: Record<string, FileType> = {
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'text/plain': 'txt',
};

// Material statistics for admin dashboard
export interface MaterialStatistics {
  totalMaterials: number;
  materialsByCategory: Record<MaterialCategory, number>;
  materialsByFileType: Record<FileType, number>;
  totalDownloads: number;
  recentUploads: number; // Last 30 days
  storageUsed: number; // in bytes
  totalViews: number;
}

// Popular materials (most downloaded)
export interface PopularMaterial {
  material: LearningMaterial;
  downloadCount: number;
  viewCount?: number;
}

// Material search result
export interface MaterialSearchResult {
  material: LearningMaterial;
  relevanceScore: number; // For search ranking
  matchedFields: string[];
}

// Material export data
export interface MaterialExportData {
  materialId: string;
  title: string;
  description: string;
  category: MaterialCategory;
  fileName: string;
  fileType: FileType;
  fileSize: number; // in bytes
  fileSizeFormatted: string; // human readable
  uploadDate: string; // formatted date
  uploadedBy: string;
  downloadCount: number;
  isActive: boolean;
}

// Material activity log
export interface MaterialActivity {
  action: 'upload' | 'update' | 'delete' | 'download' | 'view';
  materialId: string;
  materialTitle: string;
  userId: string;
  userEmail: string;
  timestamp: Timestamp;
  details?: string;
}

// Material validation result
export interface MaterialValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}