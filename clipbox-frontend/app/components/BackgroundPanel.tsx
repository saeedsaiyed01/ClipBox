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

// Custom Color Picker Component
interface CustomColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

function CustomColorPicker({ color, onChange }: CustomColorPickerProps) {
  const [hsl, setHsl] = useState(() => hexToHsl(color));
  const [rgb, setRgb] = useState(() => hexToRgb(color));

  const handleHueChange = (value: number) => {
    const newHsl = { ...hsl, h: value };
    setHsl(newHsl);
    const hex = hslToHex(newHsl);
    onChange(hex);
  };

  const handleSaturationChange = (value: number) => {
    const newHsl = { ...hsl, s: value };
    setHsl(newHsl);
    const hex = hslToHex(newHsl);
    onChange(hex);
  };

  const handleLightnessChange = (value: number) => {
    const newHsl = { ...hsl, l: value };
    setHsl(newHsl);
    const hex = hslToHex(newHsl);
    onChange(hex);
  };

  // Utility functions for color conversion
  function hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  function hslToHex(hsl: { h: number; s: number; l: number }): string {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    const r = hue2rgb(p, q, h + 1/3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1/3);

    return `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;
  }

  return (
    <div className="custom-color-picker">
      <div className="color-preview-large" style={{ backgroundColor: color }} />
      
      <div className="sliders-container">
        {/* Hue Slider */}
        <div className="slider-group">
          <label className="slider-label">Hue</label>
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="360"
              value={hsl.h}
              onChange={(e) => handleHueChange(Number(e.target.value))}
              className="hue-slider"
              style={{
                background: `linear-gradient(to right, 
                  #ff0000 0%, #ffff00 16.67%, #00ff00 33.33%, 
                  #00ffff 50%, #0000ff 66.67%, #ff00ff 83.33%, #ff0000 100%)`
              }}
            />
            <span className="slider-value">{hsl.h}</span>
          </div>
        </div>

        {/* Saturation Slider */}
        <div className="slider-group">
          <label className="slider-label">Saturation</label>
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="100"
              value={hsl.s}
              onChange={(e) => handleSaturationChange(Number(e.target.value))}
              className="saturation-slider"
              style={{
                background: `linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l}%) 0%, hsl(${hsl.h}, 100%, ${hsl.l}%) 100%)`
              }}
            />
            <span className="slider-value">{hsl.s}%</span>
          </div>
        </div>

        {/* Lightness Slider */}
        <div className="slider-group">
          <label className="slider-label">Lightness</label>
          <div className="slider-wrapper">
            <input
              type="range"
              min="0"
              max="100"
              value={hsl.l}
              onChange={(e) => handleLightnessChange(Number(e.target.value))}
              className="lightness-slider"
              style={{
                background: `linear-gradient(to right, hsl(${hsl.h}, ${hsl.s}%, 0%) 0%, hsl(${hsl.h}, ${hsl.s}%, 50%) 50%, hsl(${hsl.h}, ${hsl.s}%, 100%) 100%)`
              }}
            />
            <span className="slider-value">{hsl.l}%</span>
          </div>
        </div>
      </div>

      <div className="rgb-display">
        <div className="rgb-group">
          <span>R: {rgb.r}</span>
          <span>G: {rgb.g}</span>
          <span>B: {rgb.b}</span>
        </div>
      </div>
    </div>
  );
}

// Define preset solid colors
const PRESET_COLORS: { name: string, value: string, color: string }[] = [
  { name: 'White', value: '#FFFFFF', color: '#FFFFFF' },
  { name: 'Black', value: '#000000', color: '#000000' },
  { name: 'Gray', value: '#6B7280', color: '#6B7280' },
  { name: 'Dark Gray', value: '#1F2937', color: '#1F2937' },
  { name: 'Blue', value: '#3B82F6', color: '#3B82F6' },
  { name: 'Red', value: '#EF4444', color: '#EF4444' },
  { name: 'Green', value: '#10B981', color: '#10B981' },
  { name: 'Yellow', value: '#F59E0B', color: '#F59E0B' },
  { name: 'Purple', value: '#8B5CF6', color: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899', color: '#EC4899' },
  { name: 'Indigo', value: '#6366F1', color: '#6366F1' },
  { name: 'Orange', value: '#F97316', color: '#F97316' },
];

/**
 * Renders the "Background" controls (Gradient/Solid tabs)
 */
export default function BackgroundPanel({ settings, setSettings, disabled }: BackgroundPanelProps) {
  const [uploading, setUploading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState(settings.background.type === 'solid' ? settings.background.value : '#1E293B');

  const setBackground = (bg: AppBackground) => {
    setSettings({ background: bg });
    if (bg.type === 'solid') {
      setTempColor(bg.value);
    }
  };

  const handleColorChange = (color: string) => {
    setTempColor(color);
    setBackground({ type: 'solid', value: color });
  };

  const handleHexInputChange = (hex: string) => {
    // Validate hex color format
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(hex) || hex === '') {
      setTempColor(hex);
      if (hexRegex.test(hex)) {
        setBackground({ type: 'solid', value: hex });
      }
    }
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
    <div className="panel-section">
      <h4 className="ui-label">Background</h4>
      
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
        <div className="solid-color-panel">
          {/* Color Preview and Hex Input */}
          <div className="color-preview-container">
            <div 
              className="color-preview"
              style={{ backgroundColor: tempColor }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            <div className="hex-input-container">
              <input
                type="text"
                className="hex-input"
                value={tempColor}
                onChange={(e) => handleHexInputChange(e.target.value)}
                placeholder="#000000"
                disabled={disabled}
              />
              <span className="hex-label">HEX</span>
            </div>
          </div>

          {/* Preset Color Palette */}
          <div className="preset-colors-grid">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.name}
                className={`preset-color-btn ${tempColor.toLowerCase() === color.value.toLowerCase() ? 'active' : ''}`}
                style={{ backgroundColor: color.color }}
                onClick={() => handleColorChange(color.value)}
                title={color.name}
                disabled={disabled}
              />
            ))}
          </div>

          {/* Advanced Color Picker */}
          {showColorPicker && (
            <div className="color-picker-popup">
              <CustomColorPicker
                color={tempColor}
                onChange={handleColorChange}
              />
            </div>
          )}
        </div>
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