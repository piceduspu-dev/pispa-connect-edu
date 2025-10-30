'use client';

import { useState, useRef, useEffect } from 'react';
import type { FileMetadata } from '@/lib/storage';

interface VideoPlayerProps {
  file: FileMetadata;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoPlayer({ file, isOpen, onClose }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleLoadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load video. The file may be corrupted or not supported.');
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
    }
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const speed = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
      <div className="relative w-full max-w-6xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
          title="Close (Esc)"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        {/* Video Container */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          {/* Video Element */}
          <video
            ref={videoRef}
            src={file.downloadURL}
            className="w-full h-auto max-h-[70vh] object-contain"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onLoadStart={handleLoadStart}
            onCanPlay={handleCanPlay}
            onError={handleError}
            preload="metadata"
          />

          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90">
              <div className="text-center text-white p-6">
                <i className="fas fa-exclamation-triangle text-4xl mb-4 text-red-400"></i>
                <p className="text-lg mb-2">Video Error</p>
                <p className="text-sm text-gray-300">{error}</p>
                <button
                  onClick={() => window.open(file.downloadURL, '_blank')}
                  className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  Download Instead
                </button>
              </div>
            </div>
          )}

          {/* Custom Video Controls */}
          {!isLoading && !error && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <div className="space-y-3">
                {/* Progress Bar */}
                <div className="flex items-center space-x-2">
                  <span className="text-white text-xs">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #ea580c 0%, #ea580c ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
                    }}
                  />
                  <span className="text-white text-xs">{formatTime(duration)}</span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Play/Pause Button */}
                    <button
                      onClick={isPlaying ? handlePause : handlePlay}
                      className="text-white hover:text-orange-400 transition-colors"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <i className="fas fa-pause text-xl"></i>
                      ) : (
                        <i className="fas fa-play text-xl"></i>
                      )}
                    </button>

                    {/* Volume Control */}
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-volume-up text-white text-sm"></i>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #ea580c 0%, #ea580c ${volume * 100}%, #4b5563 ${volume * 100}%, #4b5563 100%)`
                        }}
                      />
                    </div>

                    {/* Speed Control */}
                    <select
                      value={playbackSpeed}
                      onChange={handleSpeedChange}
                      className="bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600 focus:outline-none focus:border-orange-500"
                    >
                      <option value="0.5">0.5x</option>
                      <option value="0.75">0.75x</option>
                      <option value="1">1x</option>
                      <option value="1.25">1.25x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2x</option>
                    </select>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => window.open(file.downloadURL, '_blank')}
                    className="text-white hover:text-orange-400 transition-colors text-sm flex items-center gap-2 px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
                    title="Download video"
                  >
                    <i className="fas fa-download text-xs"></i>
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="mt-4 text-center text-white">
          <h3 className="text-lg font-medium mb-1">{file.name}</h3>
          {file.description && (
            <p className="text-sm text-gray-300 mb-2">{file.description}</p>
          )}
          <p className="text-xs text-gray-400">
            {file.type.split('/')[1]?.toUpperCase()} • {(file.size / (1024 * 1024)).toFixed(1)} MB
          </p>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background: #ea580c;
          cursor: pointer;
          border-radius: 50%;
        }

        .slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: #ea580c;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
      `}</style>
    </div>
  );
}