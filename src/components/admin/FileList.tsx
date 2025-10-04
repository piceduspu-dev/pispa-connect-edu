'use client';

import { useState, useEffect } from 'react';
import { listFilesByCategory, deleteFile, updateFileMetadata, type FileMetadata, type FileCategory } from '@/lib/storage';
import { formatFileSize, getFileIcon } from '@/lib/storage';

interface FileListProps {
  category: FileCategory;
  title: string;
  refreshTrigger?: number;
}

export function FileList({ category, title, refreshTrigger }: FileListProps) {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    tags: ''
  });

  useEffect(() => {
    loadFiles();
  }, [category, refreshTrigger]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const fileList = await listFilesByCategory(category);
      setFiles(fileList);
    } catch (error) {
      console.error('Error loading files:', error);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(fileId);
      setError(null);

      // Call deleteFile and wait for complete success
      await deleteFile(fileId);

      // Only remove from UI state AFTER successful deletion
      setFiles(files.filter(file => file.id !== fileId));
      setSuccess('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete file. Please try again.');

      // Refresh the file list to ensure UI matches actual state
      await loadFiles();
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (file: FileMetadata) => {
    setEditingFile(file.id);
    setEditForm({
      name: file.name,
      description: file.description || '',
      tags: file.tags?.join(', ') || ''
    });
  };

  const handleSaveEdit = async (fileId: string) => {
    try {
      await updateFileMetadata(fileId, {
        name: editForm.name,
        description: editForm.description || undefined,
        tags: editForm.tags ? editForm.tags.split(',').map(tag => tag.trim()) : undefined
      });

      setFiles(files.map(file =>
        file.id === fileId
          ? {
              ...file,
              name: editForm.name,
              description: editForm.description || undefined,
              tags: editForm.tags ? editForm.tags.split(',').map(tag => tag.trim()) : undefined
            }
          : file
      ));

      setEditingFile(null);
      setEditForm({ name: '', description: '', tags: '' });
    } catch (error) {
      console.error('Error updating file:', error);
      setError('Failed to update file');
    }
  };

  const handleCancelEdit = () => {
    setEditingFile(null);
    setEditForm({ name: '', description: '', tags: '' });
  };

  const getFileCategoryColor = (category: FileCategory) => {
    switch (category) {
      case 'learning-materials': return 'bg-blue-100 text-blue-800';
      case 'drill-guides': return 'bg-green-100 text-green-800';
      case 'activity-files': return 'bg-purple-100 text-purple-800';
      case 'profile-photos': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Loading files...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>

      {error && (
        <div className="mb-4 p-4 rounded-lg border-l-4 border-red-500 bg-red-50 text-red-700">
          <div className="flex items-start gap-3">
            <i className="fas fa-exclamation-triangle mt-0.5"></i>
            <div>{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 rounded-lg border-l-4 border-green-500 bg-green-50 text-green-700">
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle mt-0.5"></i>
            <div>{success}</div>
          </div>
        </div>
      )}

      {files.length === 0 ? (
        <div className="text-center py-8">
          <i className="fas fa-folder-open text-gray-300 text-4xl mb-4"></i>
          <p className="text-gray-500">No files uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {files.map((file) => (
            <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {editingFile === file.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">File Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-900"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <input
                      type="text"
                      value={editForm.tags}
                      onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                      placeholder="Enter tags separated by commas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-900"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(file.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <i className={`${getFileIcon(file.type)} text-gray-600`}></i>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{file.name}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFileCategoryColor(file.category)}`}>
                          {file.category.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{formatFileSize(file.size)}</p>
                      {file.description && (
                        <p className="text-sm text-gray-700 mb-2">{file.description}</p>
                      )}
                      {file.tags && file.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {file.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Uploaded: {file.uploadedAt.toDate().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <a
                      href={file.downloadURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-md transition-colors"
                      title="Download"
                    >
                      <i className="fas fa-download"></i>
                    </a>
                    <button
                      onClick={() => handleEdit(file)}
                      className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      disabled={deleting === file.id}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete"
                    >
                      {deleting === file.id ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-trash"></i>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}