"use client";

import { useCallback, useEffect, useState } from "react";
import { checkJobStatus, startProcessing } from "../lib/api";
import { ProcessStatus, StudioSettings } from "../types";
import BackgroundPanel from "./BackgroundPanel";
import LayoutPanel from "./LayoutPanel";
import PreviewWindow from "./PreviewWindow";
import SettingsPanel from "./SettingsPanel";
import UploadDropzone from "./UploadDropzone";

/**
 * Custom Hook for polling the job status
 * This runs in the background to check when the video is done.
 */
const usePolling = (
  jobId: string | null,
  status: ProcessStatus,
  onSuccess: (url: string) => void,
  onError: (message: string) => void
) => {
  useEffect(() => {
    // Only poll if we are in the 'processing' state and have a job ID
    if (status !== 'processing' || !jobId) return;

    const poll = async () => {
      try {
        const res = await checkJobStatus(jobId);
        
        if (res.status === 'completed' && res.url) {
          onSuccess(res.url); // Call success callback
        } else if (res.status === 'failed') {
          onError(res.message || 'Job failed.'); // Call error callback
        }
        // If status is 'processing' or 'queued', do nothing and wait for the next poll
      } catch (err) {
        onError((err as Error).message);
      }
    };

    const intervalId = setInterval(poll, 3000); // Poll every 3 seconds
    
    // Cleanup function to stop polling when the component unmounts
    return () => clearInterval(intervalId);
  }, [status, jobId, onSuccess, onError]);
};


/**
 * Default settings for the studio when the page loads.
 */
const defaultSettings: StudioSettings = {
  background: { type: 'solid', value: '#1E293B' }, // Default solid dark blue
  aspectRatio: '16:9',
  borderRadius: 16,
  zoom: 100,
  position: { x: 0, y: 0 },
};

/**
 * This is the "brain" of your entire frontend.
 * It holds all the state and connects all the panels together.
 */
export default function Studio() {
  // --- State ---
  const [file, setFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<StudioSettings>(defaultSettings);
  
  const [status, setStatus] = useState<ProcessStatus>('idle');
  const [jobId, setJobId] = useState<string | null>(null);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  // --- Handlers ---
 
  /**
   * Called by the UploadDropzone component when a file is selected.
   */
  const onFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setStatus('error');
      setMessage('Please upload a valid video file.');
      return;
    }
    setFile(file);
    setFinalUrl(null); // Clear any previous results
    setStatus('idle');
    setMessage('');
    
    // Create a local URL so the <video> tag can play the file instantly
    // This is for the LIVE PREVIEW
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl); // Clean up the old URL
    }
    setVideoPreviewUrl(URL.createObjectURL(file));
  };

  /**
   * Called when the main "Export Video" button is clicked.
   */
  const handleSubmit = async () => {
    if (!file) {
      setMessage('Please select a video file first.');
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setMessage('Uploading video...');
    setFinalUrl(null);
    setJobId(null);

    try {
      // Call our API library function
      const { jobId } = await startProcessing(file, settings);
      setJobId(jobId);
      setStatus('processing');
      setMessage('Processing... this may take a moment.');
    } catch (err) {
      setStatus('error');
      setMessage((err as Error).message);
    }
  };

  // --- Polling Callbacks ---

  /**
   * Called by the usePolling hook on success.
   */
  const onJobSuccess = useCallback((url: string) => {
    setFinalUrl(url);
    setStatus('success');
    setMessage('Your video is ready!');
    setJobId(null); // Stop polling
  }, []);

  /**
   * Called by the usePolling hook on failure.
   */
  const onJobError = useCallback((msg: string) => {
    setStatus('error');
    setMessage(msg);
    setJobId(null); // Stop polling
  }, []);

  // --- Progress Animation ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'processing') {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) {
            return prev + Math.random() * 5; // Random increment for natural feel
          }
          return prev;
        });
      }, 500);
    } else if (status === 'success') {
      setProgress(100);
    } else {
      setProgress(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  // --- Init Polling Hook ---
  usePolling(jobId, status, onJobSuccess, onJobError);

  /**
   * A generic function passed to all panels to update the settings state.
   */
  const updateSettings = (newSettings: Partial<StudioSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };
  
  const isProcessing = status === 'uploading' || status === 'processing';

  // --- Render ---
  return (
    <div className="app-layout">
      
      {/* --- Left Panel --- */}
      <div className="panel panel-left">
        <LayoutPanel 
          settings={settings}
          setSettings={updateSettings} 
          disabled={isProcessing}
        />
      </div>

      {/* --- Center Panel --- */}
      <div className="panel-center">
        {videoPreviewUrl ? (
          // If we have a video, show the live preview
          <PreviewWindow
            settings={settings}
            videoPreviewUrl={videoPreviewUrl}
          />
        ) : (
          // Otherwise, show the dropzone
          <UploadDropzone
            onFileSelect={onFileSelect}
            disabled={isProcessing}
          />
        )}

        {/* Export Button Overlay - Only show when file selected and not processing */}
        {file && !isProcessing && (
          <div className="export-button-overlay">
            <button
              onClick={handleSubmit}
              className="export-button"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Export Video
            </button>
          </div>
        )}

        {/* --- Status & Progress Bar --- */}
        <div className="status-bar">
          {status === 'processing' && (
            <div className="status-card">
              <div className="status-content">
                <div className="progress-header">
                  <h4>Processing Video</h4>
                  <span className="progress-percent">{Math.round(progress)}%</span>
                </div>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
                <p className="progress-note">
                  This may take a few moments depending on video length
                </p>
              </div>
            </div>
          )}
          {status === 'uploading' && (
            <div className="status-card">
              <div className="status-content">
                <div className="flex items-center space-x-4">
                  <div className="spinner"></div>
                  <p>{message}</p>
                </div>
              </div>
            </div>
          )}
          {status !== 'processing' && status !== 'uploading' && message && (
            <div className="status-card">
              <div className="status-content">
                <p className="text-center">{message}</p>
              </div>
            </div>
          )}
        </div>

        {finalUrl && status === 'success' && (
          <div className="download-corner">
            <a href={finalUrl} download="clipbox-video.mp4" className="download-minimal" title="Download Video">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </a>
          </div>
        )}
      </div>

      {/* --- Right Panel --- */}
      <div className="panel panel-right">
        <BackgroundPanel
          settings={settings}
          setSettings={updateSettings}
          disabled={isProcessing}
        />
        <SettingsPanel
          settings={settings}
          setSettings={updateSettings}
          disabled={isProcessing}
        />
      </div>
    </div>
  );
}