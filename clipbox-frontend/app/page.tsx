"use client";
import React, { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [background, setBackground] = useState('#111827'); // Default dark gray
  const [status, setStatus] = useState('idle'); // 'idle', 'uploading', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a video file.');
      return;
    }

    setStatus('uploading');
    setMessage('Uploading video...');

    // 1. We use FormData to send the file and other data
    const formData = new FormData();
    formData.append('video', file);
    formData.append('background', background);

    try {
      // 2. Send the form to our backend
      const res = await fetch('http://localhost:4000/api/process', {
        method: 'POST',
        body: formData,
        // NOTE: Don't set 'Content-Type' header!
        // The browser sets it automatically for FormData (including the boundary)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Upload failed.');
      }
      
      // 3. This is the simple MVP success.
      // Phase 3 will involve polling with the jobId
      setStatus('success');
      setMessage(`Success! Your video (Job ID: ${data.jobId}) is processing. It will be available soon.`);

    } catch (err) {
      setStatus('error');
      setMessage(message);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', fontFamily: 'Arial' }}>
      <h1>ClipBox MVP 📦</h1>
      <p>Upload your video to frame it with a background color.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>1. Select Video File:</label><br/>
          <input 
            type="file" 
            accept="video/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const files = e.target.files;
              if (!files || files.length === 0) {
                setFile(null);
                return;
              }
              setFile(files[0]);
            }} 
            required
          />
        </div>

        <div>
          <label>2. Choose Background Color:</label><br/>
          <input 
            type="color" 
            value={background}
            onChange={(e) => setBackground(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          disabled={status === 'uploading'}
          style={{ padding: '10px', fontSize: '16px' }}
        >
          {status === 'uploading' ? 'Uploading...' : 'Process Video'}
        </button>
      </form>

      {message && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
          <strong>Status:</strong> {message}
        </div>
      )}
    </div>
  );
}