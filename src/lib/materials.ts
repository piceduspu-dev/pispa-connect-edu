/**
 * Learning Materials data service for PISPA Connect
 * Handles material data operations and statistics
 * Updated to work with existing file system (files collection)
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
  LearningMaterial,
  CreateMaterialData,
  UpdateMaterialData,
  MaterialFilters,
  MaterialQueryResult,
  MaterialStatistics,
  MaterialCategory,
  FileType
} from '@/types/materials';
import type { User } from '@/types/user';
import { listFilesByCategory, type FileMetadata, type FileCategory } from './storage';

/**
 * Create a new learning material
 */
export async function createMaterial(
  data: CreateMaterialData,
  user: User
): Promise<LearningMaterial> {
  const db = getDb();

  // Generate material ID
  const materialId = `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create material document
  const material: LearningMaterial = {
    materialId,
    title: data.title,
    description: data.description,
    category: data.category,
    fileName: data.fileName,
    fileURL: data.fileURL,
    fileType: data.fileType,
    fileSize: data.fileSize,
    uploadDate: serverTimestamp() as Timestamp,
    lastUpdated: serverTimestamp() as Timestamp,
    uploadedBy: data.uploadedBy,
    downloadCount: 0,
    isActive: true
  };

  console.log('Creating material:', {
    materialId,
    title: data.title,
    category: data.category,
    uploadedBy: user.userId,
    fileSize: data.fileSize
  });

  // Save to Firestore
  await setDoc(doc(db, 'learningMaterials', materialId), material);
  console.log('Material created successfully');

  return material;
}

/**
 * Get material by ID
 */
export async function getMaterial(materialId: string): Promise<LearningMaterial | null> {
  const db = getDb();
  const docRef = doc(db, 'learningMaterials', materialId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as LearningMaterial;
  }

  return null;
}

/**
 * Get all materials with optional filtering
 * Updated to work with files collection
 */
export async function getMaterials(
  filters?: MaterialFilters,
  pageSize: number = 50,
  lastVisible?: any
): Promise<MaterialQueryResult> {
  const db = getDb();

  try {
    // Get files from both learning-materials and drill-guides categories
    const learningMaterialsFiles = await listFilesByCategory('learning-materials');
    const drillGuidesFiles = await listFilesByCategory('drill-guides');

    // Combine all materials
    let allFiles = [...learningMaterialsFiles, ...drillGuidesFiles];

    // Apply filters
    if (filters?.uploadedBy) {
      allFiles = allFiles.filter(file => file.uploadedBy === filters.uploadedBy);
    }

    if (filters?.dateRange) {
      allFiles = allFiles.filter(file =>
        file.uploadedAt.toDate() >= filters.dateRange!.start.toDate() &&
        file.uploadedAt.toDate() <= filters.dateRange!.end.toDate()
      );
    }

    // Apply search query filter (client-side)
    if (filters?.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      allFiles = allFiles.filter(file =>
        file.name.toLowerCase().includes(searchLower) ||
        (file.description && file.description.toLowerCase().includes(searchLower)) ||
        file.type.toLowerCase().includes(searchLower)
      );
    }

    // Sort by upload date (newest first)
    allFiles.sort((a, b) => b.uploadedAt.toDate().getTime() - a.uploadedAt.toDate().getTime());

    // Apply pagination
    const paginatedFiles = allFiles.slice(0, pageSize);

    // Convert to LearningMaterial format for compatibility
    const materials: LearningMaterial[] = paginatedFiles.map(file => ({
      materialId: file.id,
      title: file.name,
      description: file.description || '',
      category: mapCategoryToMaterialCategory(file.category),
      fileName: file.name,
      fileURL: file.downloadURL,
      fileType: mapFileType(file.type),
      fileSize: file.size,
      uploadDate: file.uploadedAt,
      lastUpdated: file.uploadedAt, // Use uploadedAt as lastUpdated since we don't have separate field
      uploadedBy: file.uploadedBy,
      downloadCount: 0, // Not tracked in current system
      isActive: true // All files are considered active
    }));

    return {
      materials,
      totalCount: allFiles.length,
      hasNextPage: allFiles.length > pageSize,
      lastVisible: undefined // No pagination cursor in this implementation
    };
  } catch (error) {
    console.error('Error fetching materials:', error);
    return {
      materials: [],
      totalCount: 0,
      hasNextPage: false,
      lastVisible: undefined
    };
  }
}

/**
 * Map FileCategory to MaterialCategory
 */
function mapCategoryToMaterialCategory(category: FileCategory): MaterialCategory {
  switch (category) {
    case 'learning-materials': return 'Learning Notes';
    case 'drill-guides': return 'Drill Guide';
    default: return 'Reference Materials';
  }
}

/**
 * Map MIME type to FileType
 */
function mapFileType(mimeType: string): FileType {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'docx';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'pptx';
  if (mimeType.includes('video/mp4')) return 'mp4';
  if (mimeType.includes('video/quicktime')) return 'mov';
  if (mimeType.includes('jpeg')) return 'jpg';
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('text/plain')) return 'txt';
  return 'other';
}

/**
 * Update a material
 */
export async function updateMaterial(
  materialId: string,
  updates: UpdateMaterialData
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'learningMaterials', materialId);

  console.log('Updating material:', {
    materialId,
    updates
  });

  await updateDoc(docRef, {
    ...updates,
    lastUpdated: serverTimestamp()
  });

  console.log('Material updated successfully');
}

/**
 * Delete a material
 */
export async function deleteMaterial(materialId: string): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'learningMaterials', materialId);

  console.log('Deleting material:', { materialId });

  await deleteDoc(docRef);
  console.log('Material deleted successfully');
}

/**
 * Get material statistics for admin dashboard
 * Updated to work with files collection
 */
export async function getMaterialStatistics(): Promise<MaterialStatistics> {
  try {
    console.log('Fetching material statistics from files collection...');

    // Get files from both learning-materials and drill-guides categories
    const learningMaterialsFiles = await listFilesByCategory('learning-materials');
    const drillGuidesFiles = await listFilesByCategory('drill-guides');

    // Combine all materials
    const allFiles = [...learningMaterialsFiles, ...drillGuidesFiles];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log(`Found ${allFiles.length} total files:`, {
      learningMaterials: learningMaterialsFiles.length,
      drillGuides: drillGuidesFiles.length
    });

    // Initialize statistics
    const stats: MaterialStatistics = {
      totalMaterials: allFiles.length,
      materialsByCategory: {
        'Learning Notes': 0,
        'Drill Guide': 0,
        'Marching Guide': 0,
        'Activity Information': 0,
        'Training Schedule': 0,
        'Reference Materials': 0
      },
      materialsByFileType: {
        pdf: 0,
        doc: 0,
        docx: 0,
        ppt: 0,
        pptx: 0,
        jpg: 0,
        png: 0,
        mp4: 0,
        mov: 0,
        txt: 0,
        other: 0
      },
      totalDownloads: 0,
      recentUploads: 0,
      storageUsed: 0,
      totalViews: 0
    };

    // Calculate statistics
    allFiles.forEach(file => {
      // Count by category (map FileCategory to MaterialCategory)
      const materialCategory = mapCategoryToMaterialCategory(file.category);
      stats.materialsByCategory[materialCategory] = (stats.materialsByCategory[materialCategory] || 0) + 1;

      // Count by file type (map MIME type to FileType)
      const fileType = mapFileType(file.type);
      stats.materialsByFileType[fileType] = (stats.materialsByFileType[fileType] || 0) + 1;

      // Sum storage used
      stats.storageUsed += file.size;

      // Count recent uploads (last 30 days)
      const uploadDate = file.uploadedAt.toDate();
      if (uploadDate >= thirtyDaysAgo) {
        stats.recentUploads++;
      }

      // Sum total views
      stats.totalViews += file.viewCount || 0;
    });

    console.log('Material statistics calculated:', {
      totalMaterials: stats.totalMaterials,
      byCategory: stats.materialsByCategory,
      byFileType: stats.materialsByFileType,
      recentUploads: stats.recentUploads,
      storageUsed: stats.storageUsed,
      totalViews: stats.totalViews
    });

    return stats;
  } catch (error) {
    console.error('Error fetching material statistics:', error);

    // Return empty stats on error
    return {
      totalMaterials: 0,
      materialsByCategory: {
        'Learning Notes': 0,
        'Drill Guide': 0,
        'Marching Guide': 0,
        'Activity Information': 0,
        'Training Schedule': 0,
        'Reference Materials': 0
      },
      materialsByFileType: {
        pdf: 0,
        doc: 0,
        docx: 0,
        ppt: 0,
        pptx: 0,
        jpg: 0,
        png: 0,
        mp4: 0,
        mov: 0,
        txt: 0,
        other: 0
      },
      totalDownloads: 0,
      recentUploads: 0,
      storageUsed: 0,
      totalViews: 0
    };
  }
}

/**
 * Get materials by category
 * Updated to work with files collection
 */
export async function getMaterialsByCategory(category: MaterialCategory): Promise<LearningMaterial[]> {
  try {
    // Map MaterialCategory back to FileCategory
    let fileCategory: FileCategory;
    switch (category) {
      case 'Learning Notes':
        fileCategory = 'learning-materials';
        break;
      case 'Drill Guide':
        fileCategory = 'drill-guides';
        break;
      default:
        fileCategory = 'learning-materials'; // Default fallback
    }

    const files = await listFilesByCategory(fileCategory);

    // Convert to LearningMaterial format
    return files.map(file => ({
      materialId: file.id,
      title: file.name,
      description: file.description || '',
      category: mapCategoryToMaterialCategory(file.category),
      fileName: file.name,
      fileURL: file.downloadURL,
      fileType: mapFileType(file.type),
      fileSize: file.size,
      uploadDate: file.uploadedAt,
      lastUpdated: file.uploadedAt,
      uploadedBy: file.uploadedBy,
      downloadCount: 0,
      isActive: true
    })).sort((a, b) => b.uploadDate.toDate().getTime() - a.uploadDate.toDate().getTime());
  } catch (error) {
    console.error('Error getting materials by category:', error);
    return [];
  }
}

/**
 * Get materials by file type
 * Updated to work with files collection
 */
export async function getMaterialsByFileType(fileType: FileType): Promise<LearningMaterial[]> {
  try {
    // Get all files from both categories
    const learningMaterialsFiles = await listFilesByCategory('learning-materials');
    const drillGuidesFiles = await listFilesByCategory('drill-guides');
    const allFiles = [...learningMaterialsFiles, ...drillGuidesFiles];

    // Filter by file type
    const filteredFiles = allFiles.filter(file => mapFileType(file.type) === fileType);

    // Convert to LearningMaterial format
    return filteredFiles.map(file => ({
      materialId: file.id,
      title: file.name,
      description: file.description || '',
      category: mapCategoryToMaterialCategory(file.category),
      fileName: file.name,
      fileURL: file.downloadURL,
      fileType: mapFileType(file.type),
      fileSize: file.size,
      uploadDate: file.uploadedAt,
      lastUpdated: file.uploadedAt,
      uploadedBy: file.uploadedBy,
      downloadCount: 0,
      isActive: true
    })).sort((a, b) => b.uploadDate.toDate().getTime() - a.uploadDate.toDate().getTime());
  } catch (error) {
    console.error('Error getting materials by file type:', error);
    return [];
  }
}

/**
 * Search materials
 * Updated to work with files collection
 */
export async function searchMaterials(searchQuery: string): Promise<LearningMaterial[]> {
  try {
    // Get all files from both categories
    const learningMaterialsFiles = await listFilesByCategory('learning-materials');
    const drillGuidesFiles = await listFilesByCategory('drill-guides');
    const allFiles = [...learningMaterialsFiles, ...drillGuidesFiles];

    // Client-side search
    const searchLower = searchQuery.toLowerCase();
    const filteredFiles = allFiles.filter(file =>
      file.name.toLowerCase().includes(searchLower) ||
      (file.description && file.description.toLowerCase().includes(searchLower)) ||
      file.type.toLowerCase().includes(searchLower)
    );

    // Convert to LearningMaterial format
    return filteredFiles.map(file => ({
      materialId: file.id,
      title: file.name,
      description: file.description || '',
      category: mapCategoryToMaterialCategory(file.category),
      fileName: file.name,
      fileURL: file.downloadURL,
      fileType: mapFileType(file.type),
      fileSize: file.size,
      uploadDate: file.uploadedAt,
      lastUpdated: file.uploadedAt,
      uploadedBy: file.uploadedBy,
      downloadCount: 0,
      isActive: true
    })).sort((a, b) => b.uploadDate.toDate().getTime() - a.uploadDate.toDate().getTime());
  } catch (error) {
    console.error('Error searching materials:', error);
    return [];
  }
}

/**
 * Get popular materials (most downloaded)
 * Updated to work with files collection (returns most recent since download tracking not available)
 */
export async function getPopularMaterials(limitCount: number = 10): Promise<LearningMaterial[]> {
  try {
    // Get all files from both categories
    const learningMaterialsFiles = await listFilesByCategory('learning-materials');
    const drillGuidesFiles = await listFilesByCategory('drill-guides');
    const allFiles = [...learningMaterialsFiles, ...drillGuidesFiles];

    // Sort by upload date (newest first) as a proxy for "popular"
    const sortedFiles = allFiles.sort((a, b) => b.uploadedAt.toDate().getTime() - a.uploadedAt.toDate().getTime());

    // Get top files
    const topFiles = sortedFiles.slice(0, limitCount);

    // Convert to LearningMaterial format
    return topFiles.map(file => ({
      materialId: file.id,
      title: file.name,
      description: file.description || '',
      category: mapCategoryToMaterialCategory(file.category),
      fileName: file.name,
      fileURL: file.downloadURL,
      fileType: mapFileType(file.type),
      fileSize: file.size,
      uploadDate: file.uploadedAt,
      lastUpdated: file.uploadedAt,
      uploadedBy: file.uploadedBy,
      downloadCount: 0,
      isActive: true
    }));
  } catch (error) {
    console.error('Error getting popular materials:', error);
    return [];
  }
}

/**
 * Get recent uploads
 * Updated to work with files collection
 */
export async function getRecentUploads(limitCount: number = 10): Promise<LearningMaterial[]> {
  try {
    // Get all files from both categories
    const learningMaterialsFiles = await listFilesByCategory('learning-materials');
    const drillGuidesFiles = await listFilesByCategory('drill-guides');
    const allFiles = [...learningMaterialsFiles, ...drillGuidesFiles];

    // Sort by upload date (newest first)
    const sortedFiles = allFiles.sort((a, b) => b.uploadedAt.toDate().getTime() - a.uploadedAt.toDate().getTime());

    // Get top files
    const recentFiles = sortedFiles.slice(0, limitCount);

    // Convert to LearningMaterial format
    return recentFiles.map(file => ({
      materialId: file.id,
      title: file.name,
      description: file.description || '',
      category: mapCategoryToMaterialCategory(file.category),
      fileName: file.name,
      fileURL: file.downloadURL,
      fileType: mapFileType(file.type),
      fileSize: file.size,
      uploadDate: file.uploadedAt,
      lastUpdated: file.uploadedAt,
      uploadedBy: file.uploadedBy,
      downloadCount: 0,
      isActive: true
    }));
  } catch (error) {
    console.error('Error getting recent uploads:', error);
    return [];
  }
}

/**
 * Toggle material active status
 */
export async function toggleMaterialStatus(materialId: string, isActive: boolean): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'learningMaterials', materialId);

  await updateDoc(docRef, {
    isActive,
    lastUpdated: serverTimestamp()
  });
}

/**
 * Increment material download count
 */
export async function incrementDownloadCount(materialId: string): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'learningMaterials', materialId);

  // Get current download count
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const currentCount = docSnap.data().downloadCount || 0;
    await updateDoc(docRef, {
      downloadCount: currentCount + 1
    });
  }
}