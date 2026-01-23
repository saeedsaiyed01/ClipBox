"use client";

import { Download, Pause, Play, Trash2, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthUser } from "../../lib/useAuthUser";
import { checkJobStatus, startProcessing } from "../lib/api";
import { ProcessStatus, StudioSettings } from "../types";
import BackgroundPanel from "./BackgroundPanel";
import LayoutPanel from "./LayoutPanel";
import PreviewWindow from "./PreviewWindow";
import SettingsPanel from "./SettingsPanel";
import UploadDropzone from "./UploadDropzone";
import UserBadge from "./UserBadge";

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
  const { user, loading: loadingUser, signOut } = useAuthUser();
   
  const [status, setStatus] = useState<ProcessStatus>('idle');
  const [jobId, setJobId] = useState<string | null>(null);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);



  // --- Video Player State ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true); // AutoPlay defaults to true
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // --- Handlers ---

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const onTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const onPlay = () => setIsPlaying(true);
  const onPause = () => setIsPlaying(false);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };
 
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
      const error = err as Error;
      setStatus('error');

      // Handle rate limiting errors specifically
      if (error.message.includes('No credits remaining')) {
        setMessage('You have used all your credits for this month. Upgrade your plan for more credits.');
      } else {
        setMessage(error.message);
      }
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
          if (prev < 95) {
            return prev + Math.random() * 3; // Random increment for natural feel
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

  const handleLogout = () => {
    signOut();
    window.location.href = '/';
  };

 const handleLogin = () => {
  window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`;
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
    // Reset video state
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(true);
  };

  const isProcessing = status === 'uploading' || status === 'processing';

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
            Hang tight - longer clips can take a little more time to render.
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
        className="inline-flex items-center gap-2 rounded-full bg-[#f5c249] px-6 py-3 text-sm font-semibold text-black shadow-[0_10px_40px_rgba(245,194,73,0.45)] transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5c249]"
      >
        <Download className="h-4 w-4" />
        View / Download
      </a>
    ) : (
      <button
        onClick={handleSubmit}
        disabled={!file || isProcessing}
        className="inline-flex items-center gap-2 rounded-full bg-[#f5c249] px-6 py-3 text-sm font-semibold text-black shadow-[0_10px_40px_rgba(245,194,73,0.45)] transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5c249] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Download className="h-4 w-4" />
        Download / Export
      </button>
    );


  return (
    <div className="h-screen w-full overflow-hidden bg-[#0F0F0F] text-white">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col lg:grid lg:grid-cols-[28%_72%]">
        <aside className="border-b border-white/10 px-4 py-6 lg:flex lg:h-full lg:flex-col lg:gap-6 lg:border-b-0 lg:border-r lg:overflow-y-auto lg:px-6 lg:py-8 scrollbar-hidden">
          <div>
            <h1 className="text-2xl text-white serif-text">Clipbox Studio</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Shape your canvas, dial in styling, and export polished clips.
            </p>
          </div>

          <div className="flex-1 space-y-6">
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

        <section className="relative flex min-h-[60vh] flex-col bg-[#0F0F0F] lg:h-full lg:overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-white/10 bg-[#0F0F0F]/90 px-6 pb-4 pt-2 backdrop-blur lg:flex-row lg:items-center lg:justify-end lg:gap-6 lg:px-12 shrink-0 z-10">
            <div className="flex items-center gap-3 self-start lg:self-auto">
              {primaryAction}
            </div>
            <UserBadge
              user={user}
              loading={loadingUser}
              onSignOut={handleLogout}
              onSignIn={handleLogin}
            />
          </div>

          <div className="flex flex-1 flex-col items-center justify-start py-20 lg:overflow-y-auto w-full scrollbar-hidden">
            <div className="w-full max-w-6xl px-6 lg:px-12">
              {videoPreviewUrl ? (
                <div className="flex flex-col gap-6">
                  <PreviewWindow
                    settings={settings}
                    videoPreviewUrl={videoPreviewUrl}
                    videoRef={videoRef}
                    onTimeUpdate={onTimeUpdate}
                    onLoadedMetadata={onLoadedMetadata}
                    onPlay={onPlay}
                    onPause={onPause}
                  >
                    {/* Professional Video Controls */}
                    <div className="w-full max-w-5xl">
                      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/95 px-6 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-sm">
                        
                        {/* Progress Bar */}
                        <div className="group relative flex h-2 w-full items-center cursor-pointer">
                            {/* Track Background */}
                            <div className="absolute h-1 w-full rounded-full bg-white/10" />
                            
                            {/* Progress Fill */}
                            <div 
                              className="absolute h-1 rounded-full bg-gradient-to-r from-[#f5c249] to-[#ffb016]"
                              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                            />
                            
                            {/* Progress Handle */}
                            <div 
                               className="absolute h-3 w-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                               style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%`, transform: 'translateX(-50%)' }}
                            />
                            
                            {/* The Input Range (Invisible but clickable) */}
                            <input
                              type="range"
                              min={0}
                              max={duration || 100}
                              step={0.1}
                              value={currentTime}
                              onChange={handleSeek}
                              className="absolute h-full w-full opacity-0 cursor-pointer"
                            />
                        </div>

                        {/* Control Bar */}
                        <div className="flex items-center justify-between gap-4">
                          
                          {/* Left Side: Play + Time */}
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={togglePlay}
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/15 active:scale-95"
                            >
                              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                            </button>
                            
                            <span className="text-sm font-medium font-mono text-zinc-400 tabular-nums">
                              {formatTime(currentTime)} <span className="text-zinc-600 mx-1">/</span> {formatTime(duration)}
                            </span>
                          </div>

                          {/* Right Side: Actions */}
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={toggleMute} 
                              className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition"
                              title={isMuted ? "Unmute" : "Mute"}
                            >
                              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                            </button>

                            <button
                              onClick={handleRemoveVideo}
                              className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition"
                              title="Remove Video"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                        </div>
                      </div>
                    </div>
                  </PreviewWindow>
                  {/* Status moved here, below the video */}
                  {(status === 'processing' || status === 'uploading' || message) && (
                     <div className="rounded-2xl border border-white/10 bg-[#1A1A1A] p-6 shadow-inner">
                      {renderStatusContent()}
                    </div>
                  )}
                </div>
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

          {/* Fallback space if no video (maintains layout structure) */}
          {!videoPreviewUrl && (
             <div className="h-14 border-t border-white/5 bg-[#0F0F0F]/50 flex items-center justify-center text-xs text-zinc-600">
               Ready to upload
             </div>
          )}

          {/* Fallback space if no video (maintains layout structure) */}
          {!videoPreviewUrl && (
             <div className="h-14 border-t border-white/5 bg-[#0F0F0F]/50 flex items-center justify-center text-xs text-zinc-600">
               Ready to upload
             </div>
          )}
          
        </section>
      </div>
    </div>
  );
}
