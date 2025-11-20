import { ApiJobResponse, ApiStatusResponse, StudioSettings } from '../types';

// This is your backend server URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

/**
 * Uploads the video and starts the processing job.
 */
export const startProcessing = async (
  file: File, 
  settings: StudioSettings
): Promise<ApiJobResponse> => {
  const formData = new FormData();
  formData.append('video', file);
  // Send the complex settings object as a JSON string
  formData.append('settings', JSON.stringify(settings));

  const response = await fetch(`${API_BASE_URL}/process`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to start processing job.');
  }

  return response.json() as Promise<ApiJobResponse>;
};

/**
 * Polls the backend for the status of a job.
 */
export const checkJobStatus = async (jobId: string): Promise<ApiStatusResponse> => {
  const response = await fetch(`${API_BASE_URL}/status/${jobId}`);
  
  if (!response.ok) {
    throw new Error('Failed to check job status.');
  }

  return response.json() as Promise<ApiStatusResponse>;
};