/**
 * PISPA Connect Types Index
 * Centralized export of all TypeScript types
 */

// User and Authentication types
export * from './user';

// Student data types
export * from './student';

// Learning Materials types
export * from './materials';

// Activities types
export * from './activities';

// Common utility types
export type ID = string;
export type Timestamp = import('firebase/firestore').Timestamp;

// Common response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  hasNextPage: boolean;
  lastVisible?: any;
}

// Common form types
export interface FormState<T> {
  data: T;
  isValid: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

// Common UI types
export interface SelectOption {
  value: string;
  label: string;
}

export interface FileUploadProgress {
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}