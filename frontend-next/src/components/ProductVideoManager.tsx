'use client';
import React, { useState, useRef } from 'react';
import { Upload, Play, Trash2, Eye, Video, FileVideo, AlertCircle } from 'lucide-react';

interface VideoFile {
  file: File;
  url: string;
  size: number;
  duration?: number;
  isExisting?: boolean;
}

interface ProductVideoManagerProps {
  video: VideoFile | null;
  onVideoChange: (video: VideoFile | null) => void;
  maxSize?: number; // in bytes (default 100MB)
  acceptedFormats?: string[];
  disabled?: boolean;
  hideUploadZone?: boolean;
}

const ProductVideoManager: React.FC<ProductVideoManagerProps> = ({
  video,
  onVideoChange,
  maxSize = 100 * 1024 * 1024, // 100MB default
  acceptedFormats = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
  disabled = false,
  hideUploadZone = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState<'thumbnail' | 'playing'>('thumbnail');
  const [error, setError] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateVideo = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return `Invalid video format. Supported formats: ${acceptedFormats.join(', ')}`;
    }
    
    if (file.size > maxSize) {
      return `Video size exceeds ${formatFileSize(maxSize)} limit`;
    }

    return null;
  };

  const handleVideoSelect = async (file: File) => {
    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      const validationError = validateVideo(file);
      if (validationError) {
        setError(validationError);
        setUploading(false);
        return;
      }

      // Create video URL for preview
      const videoUrl = URL.createObjectURL(file);
      
      // Get video duration
      const videoElement = document.createElement('video');
      videoElement.src = videoUrl;
      
      const duration = await new Promise<number>((resolve) => {
        videoElement.addEventListener('loadedmetadata', () => {
          resolve(videoElement.duration);
        });
      });

      // Simulate upload progress (since this is handled by the parent form)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90; // Don't complete until actual upload finishes
          }
          return prev + 10;
        });
      }, 200);

      const newVideo: VideoFile = {
        file,
        url: videoUrl,
        size: file.size,
        duration,
        isExisting: false
      };

      onVideoChange(newVideo);
      
      // Complete progress
      setTimeout(() => {
        setUploadProgress(100);
        setUploading(false);
        clearInterval(progressInterval);
      }, 500);

    } catch (error) {
      console.error('Error processing video:', error);
      setError('Error processing video file');
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoSelect(file);
    }
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));
    
    if (videoFile) {
      handleVideoSelect(videoFile);
    } else {
      setError('Please drop a valid video file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeVideo = () => {
    if (video?.url && !video.isExisting) {
      URL.revokeObjectURL(video.url);
    }
    onVideoChange(null);
    setError('');
    setPreviewMode('thumbnail');
  };

  const togglePreview = () => {
    if (previewMode === 'thumbnail') {
      setPreviewMode('playing');
      videoPreviewRef.current?.play();
    } else {
      setPreviewMode('thumbnail');
      videoPreviewRef.current?.pause();
    }
  };

  if (video) {
    return (
      <div className="space-y-3">
        <div className="relative bg-gray-50 border-2 border-gray-200 rounded-lg overflow-hidden">
          {/* Video Preview */}
          <div className="relative">
            <video
              ref={videoPreviewRef}
              src={video.url}
              className="w-full h-48 object-cover"
              controls={previewMode === 'playing'}
              muted
              onEnded={() => setPreviewMode('thumbnail')}
            />
            
            {previewMode === 'thumbnail' && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <button
                  onClick={togglePreview}
                  className="p-4 bg-white/90 hover:bg-white rounded-full transition-colors"
                  disabled={disabled}
                >
                  <Play className="w-8 h-8 text-blue-600" />
                </button>
              </div>
            )}

            {/* Upload Progress Overlay */}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 mx-auto mb-2 relative">
                    <div className="w-16 h-16 border-4 border-white/30 rounded-full"></div>
                    <div 
                      className="absolute top-0 left-0 w-16 h-16 border-4 border-white border-r-transparent rounded-full animate-spin"
                      style={{
                        background: `conic-gradient(from 0deg, white ${uploadProgress * 3.6}deg, transparent ${uploadProgress * 3.6}deg)`
                      }}
                    ></div>
                  </div>
                  <p className="text-sm font-medium">Uploading... {uploadProgress}%</p>
                </div>
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="p-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileVideo className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900 truncate">
                  {video.file.name}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {previewMode === 'thumbnail' ? (
                  <button
                    onClick={togglePreview}
                    className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                    title="Play video"
                    disabled={disabled}
                  >
                    <Play className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={togglePreview}
                    className="p-1 text-gray-600 hover:text-gray-700 transition-colors"
                    title="Stop preview"
                    disabled={disabled}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={removeVideo}
                  className="p-1 text-red-600 hover:text-red-700 transition-colors"
                  title="Remove video"
                  disabled={disabled || uploading}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>{formatFileSize(video.size)}</span>
              {video.duration && <span>{formatDuration(video.duration)}</span>}
              {video.isExisting && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                  Current Video
                </span>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    );
  }

  if (hideUploadZone) {
    return (
      <>
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg transition-all duration-200 ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : disabled
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="p-8 text-center">
          <div className={`mx-auto mb-4 ${disabled ? 'text-gray-300' : 'text-gray-400'}`}>
            {uploading ? (
              <div className="w-12 h-12 mx-auto">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              </div>
            ) : (
              <Video className="w-12 h-12 mx-auto" />
            )}
          </div>

          <div className="space-y-2">
            <p className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
              {uploading ? 'Processing video...' : 'Upload product video'}
            </p>
            <p className={`text-xs ${disabled ? 'text-gray-300' : 'text-gray-500'}`}>
              Drop a video file here or click to browse
            </p>
            <p className={`text-xs ${disabled ? 'text-gray-300' : 'text-gray-400'}`}>
              Supported: MP4, WebM, OGG, AVI, MOV (max {formatFileSize(maxSize)})
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ProductVideoManager;