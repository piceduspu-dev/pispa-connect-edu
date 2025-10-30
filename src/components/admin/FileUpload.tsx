'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadFile, validateFile, formatFileSize, getFileIcon, type FileCategory, type UploadOptions } from '@/lib/storage';

interface FileUploadProps {
  category: FileCategory;
  title: string;
  description?: string;
  allowedTypes: string[];
  maxSize: string;
  onUploadComplete?: () => void;
}

export function FileUpload({
  category,
  title,
  description,
  allowedTypes,
  maxSize,
  onUploadComplete
}: FileUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file immediately on selection
      const validation = validateFile(file, category);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      setSelectedFile(file);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    // Validate file
    const validation = validateFile(selectedFile, category);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const uploadOptions: UploadOptions = {
        category,
        description: fileDescription.trim(),
        tags: tags ? tags.split(',').map(tag => tag.trim()) : undefined,
        onProgress: (progress) => {
          setProgress(progress);
        },
        onError: (error) => {
          setError(error.message);
          setUploading(false);
        },
        onComplete: (metadata) => {
          setSuccess(`File "${metadata.name}" uploaded successfully!`);
          setUploading(false);
          setProgress(0);
          setSelectedFile(null);
          setFileDescription('');
          setTags('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          onUploadComplete?.();
        }
      };

      await uploadFile(selectedFile, user, uploadOptions);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mb-4">{description}</p>
      )}

      {/* File Selection */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept={allowedTypes.join(',')}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
          disabled={uploading}
        />
        <p className="text-xs text-gray-500 mt-1">
          Allowed types: {allowedTypes.join(', ')} (Max: {maxSize})
        </p>
      </div>

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className={`${getFileIcon(selectedFile.type)} text-gray-400`}></i>
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Description */}
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={fileDescription}
          onChange={(e) => setFileDescription(e.target.value)}
          placeholder="Enter a brief description of the file..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900"
          rows={3}
          disabled={uploading}
          required
        />
        {!fileDescription && !uploading && (
          <p className="text-xs text-red-500 mt-1">Description is required</p>
        )}
      </div>

      {/* Tags */}
      <div className="mb-4">
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
          Tags (Optional)
        </label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Enter tags separated by commas..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-gray-900"
          disabled={uploading}
        />
        <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Uploading...</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 rounded-lg border-l-4 border-red-600 bg-red-50 text-red-700">
          <div className="flex items-start gap-3">
            <i className="fas fa-exclamation-triangle mt-0.5"></i>
            <div>{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 rounded-lg border-l-4 border-orange-500 bg-orange-50 text-orange-700">
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle mt-0.5"></i>
            <div>{success}</div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || !fileDescription.trim() || uploading}
        className="w-full bg-orange-600 text-white py-2 px-4 rounded-md font-medium hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <i className="fas fa-spinner fa-spin"></i>
            Uploading...
          </>
        ) : (
          <>
            <i className="fas fa-upload"></i>
            Upload File
          </>
        )}
      </button>
    </div>
  );
}