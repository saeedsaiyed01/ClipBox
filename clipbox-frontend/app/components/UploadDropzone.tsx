"use client";
import React, { useCallback, useState } from 'react';

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

/**
 * Renders the "Drag & Drop" file input area.
 */
export default function UploadDropzone({ onFileSelect, disabled }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  // Memoized callbacks for drag-and-drop events
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [onFileSelect]);

  // Handle file selection from the hidden input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`dropzone ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        id="file-upload" 
        className="file-input" 
        accept="video/*"
        onChange={handleFileChange}
        disabled={disabled}
      />
      <label htmlFor="file-upload" className="file-label">
        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="43" viewBox="0 0 50 43"><path d="M48.4 26.5c-.9 0-1.7.7-1.7 1.7v11.6c0 .9-.7 1.7-1.7 1.7H5c-.9 0-1.7-.7-1.7-1.7V28.2c0-.9-.7-1.7-1.7-1.7s-1.7.7-1.7 1.7v11.6c0 2.8 2.2 5 5 5h40c2.8 0 5-2.2 5-5V28.2c0-.9-.7-1.7-1.7-1.7zM24.1 3.4c.7-.7 1.7-.7 2.4 0L39.9 17c.7.7.7 1.7 0 2.4s-1.7.7-2.4 0L27.1 9v24.2c0 .9-.7 1.7-1.7 1.7s-1.7-.7-1.7-1.7V9L13.2 19.4c-.7.7-1.7.7-2.4 0s-.7-1.7 0-2.4L24.1 3.4z"></path></svg>
        <strong>Drag & drop your video here</strong>
        <span>or click to browse</span>
      </label>
    </div>
  );
}