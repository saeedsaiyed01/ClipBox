"use client";
import React, { useState } from 'react';
import { uploadImage } from '../lib/api';
import { AppBackground, StudioSettings } from '../types';

interface BackgroundPanelProps {
  settings: StudioSettings;
  setSettings: (settings: Partial<StudioSettings>) => void;
  disabled?: boolean;
}

// Define your gradient presets
const PRESET_GRADIENTS: { name: string, value: string }[] = [
  { name: 'Purple', value: 'linear-gradient(to right, #8e2de2, #4a00e0)' },
  { name: 'Blue', value: 'linear-gradient(to right, #00c6ff, #0072ff)' },
  { name: 'Green', value: 'linear-gradient(to right, #56ab2f, #a8e063)' },
  { name: 'Orange', value: 'linear-gradient(to right, #ff9966, #ff5e62)' },
  { name: 'Pink', value: 'linear-gradient(to right, #f857a6, #ff5858)' },
  { name: 'Aqua', value: 'linear-gradient(to right, #43e97b, #38f9d7)' },
  { name: 'Yellow', value: 'linear-gradient(to right, #f12711, #f5af19)' },
  { name: 'Gray', value: 'linear-gradient(to right, #434343, #000000)' },
];

/**
 * Renders the "Background" controls (Gradient/Solid tabs)
 */
export default function BackgroundPanel({ settings, setSettings, disabled }: BackgroundPanelProps) {
  const [uploading, setUploading] = useState(false);

  const setBackground = (bg: AppBackground) => {
    setSettings({ background: bg });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    setUploading(true);
    try {
      const { imageUrl } = await uploadImage(file);
      setBackground({ type: 'image', value: imageUrl });
    } catch (error) {
      alert('Failed to upload image. Please try again.');
      console.error('Image upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="settings-group">
      <h4>Background</h4>
      
      {/* --- Tab Buttons --- */}
      <div className="button-group">
        <button
          className={`btn-toggle ${settings.background.type === 'gradient' ? 'active' : ''}`}
          onClick={() => setBackground({ type: 'gradient', value: PRESET_GRADIENTS[0].value })} // Default to first gradient
          disabled={disabled}
        >
          Gradient
        </button>
        <button
          className={`btn-toggle ${settings.background.type === 'solid' ? 'active' : ''}`}
          onClick={() => setBackground({ type: 'solid', value: '#1E293B' })}
          disabled={disabled}
        >
          Solid
        </button>
        <button
          className={`btn-toggle ${settings.background.type === 'image' ? 'active' : ''}`}
          onClick={() => setBackground({ type: 'image', value: '' })}
          disabled={disabled}
        >
          Image
        </button>
      </div>

      {/* --- Gradient Panel --- */}
      {settings.background.type === 'gradient' && (
        <div className="preset-grid">
          {PRESET_GRADIENTS.map((gradient) => (
            <button
              key={gradient.name}
              className="preset-btn"
              style={{ background: gradient.value }}
              onClick={() => setBackground({ type: 'gradient', value: gradient.value })}
              disabled={disabled}
            />
          ))}
        </div>
      )}
      
      {/* --- Solid Color Panel --- */}
      {settings.background.type === 'solid' && (
        <input
          type="color"
          className="color-picker"
          value={settings.background.value}
          onChange={(e) => setBackground({ type: 'solid', value: e.target.value })}
          disabled={disabled}
        />
      )}

      {/* --- Image Upload Panel --- */}
      {settings.background.type === 'image' && (
        <div className="image-upload-panel">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={disabled || uploading}
            className="file-input"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="file-label">
            {uploading ? 'Uploading...' : 'Choose Image'}
          </label>
          {settings.background.value && (
            <div className="image-preview">
              <img
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}${settings.background.value}`}
                alt="Background preview"
                style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: '4px' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}