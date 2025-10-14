'use client';

import { useState, useEffect } from 'react';
import { listFilesByCategory, type FileMetadata, type FileCategory, incrementViewCount, trackFileDownload } from '@/lib/storage';
import { formatFileSize, getFileIcon } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { logUserView } from '@/lib/userActivity';

interface FileBrowserProps {
  category: FileCategory;
  title: string;
  description?: string;
}

export function FileBrowser({ category, title, description }: FileBrowserProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFiles();
  }, [category]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const fileList = await listFilesByCategory(category);
      setFiles(fileList);
    } catch (error) {
      console.error('Error loading files:', error);
      setError('Failed to load files. Please check your Firebase security rules.');
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDownload = async (file: FileMetadata) => {
    if (!user) {
      alert('Please log in to download files.');
      return;
    }

    try {
      // Track the download and get the download URL
      const result = await trackFileDownload(file.id, user);

      if (result.success && result.downloadURL) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = result.downloadURL;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Failed to prepare download. Please try again.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('An error occurred while downloading the file.');
    }
  };

  const handleView = async (file: FileMetadata) => {
    if (!user) {
      alert('Please log in to view files.');
      return;
    }

    try {
      // Log the user view activity
      await logUserView(user.userId, user.email, file.id, file.name);

      // Increment the view count
      await incrementViewCount(file.id);

      console.log(`User view tracked: ${user.email} viewed ${file.name}`);

      // Open the file in a new window
      window.open(file.downloadURL, '_blank');

    } catch (error) {
      console.error('View error:', error);
      alert('An error occurred while viewing the file.');
    }
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
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mb-4">{description}</p>
        )}

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-gray-400"></i>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search files by name, description, or tags..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-gray-900"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg border-l-4 border-red-500 bg-red-50 text-red-700">
          <div className="flex items-start gap-3">
            <i className="fas fa-exclamation-triangle mt-0.5"></i>
            <div>{error}</div>
          </div>
        </div>
      )}

      {filteredFiles.length === 0 ? (
        <div className="text-center py-8">
          <i className="fas fa-folder-open text-gray-300 text-4xl mb-4"></i>
          <p className="text-gray-500">
            {searchTerm ? 'No files match your search criteria.' : 'No files available yet.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-green-600 hover:text-green-800"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFiles.map((file) => (
            <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <i className={`${getFileIcon(file.type)} text-gray-600 text-lg`}></i>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{file.name}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFileCategoryColor(file.category)}`}>
                        {file.category.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{formatFileSize(file.size)}</p>
                    {file.description && (
                      <p className="text-sm text-gray-700 mb-3">{file.description}</p>
                    )}
                    {file.tags && file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {file.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        <i className="fas fa-calendar-alt mr-1"></i>
                        {file.uploadedAt.toDate().toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-2">
                        {/* View button for supported file types */}
                        {(file.type.startsWith('image/') || file.type.includes('pdf')) && (
                          <button
                            onClick={() => handleView(file)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                          >
                            <i className="fas fa-eye"></i>
                            View
                          </button>
                        )}
                        {/* Download button */}
                        <button
                          onClick={() => handleDownload(file)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1 px-3 py-1 rounded-md hover:bg-green-50 transition-colors"
                        >
                          <i className="fas fa-download"></i>
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results count */}
      {searchTerm && filteredFiles.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing {filteredFiles.length} of {files.length} files
        </div>
      )}
    </div>
  );
}