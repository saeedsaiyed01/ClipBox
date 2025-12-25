"use client";

import { Download, Trash2 } from "lucide-react";
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
  borderRadius: 24, // Increased for more rounded corners
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

  /**
   * Remove the current video and go back to dropzone
   */
  const handleRemoveVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setFile(null);
    setVideoPreviewUrl(null);
    setFinalUrl(null);
    setStatus('idle');
    setMessage('');
    setJobId(null);
    setProgress(0);
  };

  const isProcessing = status === 'uploading' || status === 'processing';

  // --- Render ---
  const renderStatusContent = () => {
    if (status === 'processing') {
      return (
        <>
          <div className="flex items-center justify-between text-sm font-semibold text-zinc-300">
            <span className="text-white">Processing video</span>
            <span className="text-amber-300">{Math.round(progress)}%</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Hang tight—longer clips can take a little more time to render.
          </p>
        </>
      );
    }

    if (status === 'uploading') {
      return (
        <div className="flex items-center gap-3 text-sm text-zinc-300">
          <span className="h-3 w-3 animate-pulse rounded-full bg-amber-300" />
          {message || 'Uploading video...'}
        </div>
      );
    }

    if (message) {
      return (
        <p className="text-sm text-zinc-300">
          {message}
        </p>
      );
    }

    return (
      <p className="text-sm text-zinc-500">
        Select a video to begin editing, then export whenever you are ready.
      </p>
    );
  };

  const primaryAction =
    finalUrl && status === 'success' ? (
      <a
        href={finalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black shadow-[0_10px_40px_rgba(251,191,36,0.45)] transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
      >
        <Download className="h-4 w-4" />
        View / Download
      </a>
    ) : (
      <button
        onClick={handleSubmit}
        disabled={!file || isProcessing}
        className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-black shadow-[0_10px_40px_rgba(251,191,36,0.45)] transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Download className="h-4 w-4" />
        Download / Export
      </button>
    );

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto flex max-w-[2000px] flex-col lg:grid lg:min-h-screen lg:grid-cols-[35%_65%]">
        <aside className="border-b border-white/5 px-6 py-8 lg:flex lg:flex-col lg:gap-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-600">Studio</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Clipbox Studio</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Shape your canvas, dial in styling, and export polished clips.
            </p>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto pr-2 lg:max-h-[calc(100vh-8rem)]">
            <LayoutPanel
              settings={settings}
              setSettings={updateSettings}
              disabled={isProcessing}
            />
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
        </aside>

        <section className="relative flex min-h-[60vh] flex-col bg-zinc-950 lg:sticky lg:top-0 lg:h-screen">
          <div className="absolute right-6 top-6 z-20">
            {primaryAction}
          </div>

          <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-12">
            <div className="w-full max-w-5xl">
              {videoPreviewUrl ? (
                <PreviewWindow
                  settings={settings}
                  videoPreviewUrl={videoPreviewUrl}
                />
              ) : (
                <div className="rounded-[30px] border border-dashed border-white/15 bg-white/5 p-8 text-center shadow-[0_25px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                  <UploadDropzone
                    onFileSelect={onFileSelect}
                    disabled={isProcessing}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/5 bg-black/30 px-6 py-6 backdrop-blur lg:px-12">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="text-xs uppercase tracking-[0.4em] text-zinc-600">
                Playback Toolbar
              </div>
              {videoPreviewUrl && (
                <button
                  onClick={handleRemoveVideo}
                  className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-transparent px-4 py-2 text-sm font-medium text-red-300 transition hover:border-red-400 hover:bg-red-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Video
                </button>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-5 shadow-inner">
              {renderStatusContent()}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
