"use client";
import React, { useEffect, useState } from 'react';
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

const PRESET_IMAGES = [
  { name: 'Preset 1', value: '/image1.jpg' },
  { name: 'Preset 2', value: '/image2.jpeg' },
];

// Custom Color Picker Component
interface CustomColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

function CustomColorPicker({ color, onChange }: CustomColorPickerProps) {
  const [hsl, setHsl] = useState(() => hexToHsl(color));

  const [rgb, setRgb] = useState(() => hexToRgb(color));

  // Sync internal state when prop changes
  useEffect(() => {
    // Only update if the color is a valid hex to avoid breaking the UI with NaNs
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(color)) {
      setHsl(hexToHsl(color));
      setRgb(hexToRgb(color));
    }
  }, [color]);

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
  // tempColor tracks exactly what the user types in the input
  const [tempColor, setTempColor] = useState(settings.background.type === 'solid' ? settings.background.value : '#1E293B');

  // safeColor is used for the ColorPicker and Previews.
  // If tempColor is valid, use it. Otherwise, fall back to the committed settings value.
  // This prevents the UI from breaking or flashing while typing incomplete hex codes.
  const isValidHex = (hex: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  const safeColor = isValidHex(tempColor) ? tempColor : (settings.background.type === 'solid' ? settings.background.value : '#1E293B');

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

  const handleHexInputChange = (input: string) => {
    let hex = input;
    // Auto-add hash if missing and it looks like a hex code
    if (!hex.startsWith('#') && /^[0-9A-Fa-f]+$/.test(hex)) {
        hex = '#' + hex;
    }
    
    setTempColor(input); // Clean valid typing is hard, better to let them type freely, but process logic on 'hex'
    
    // Check validity of the processed 'hex'
    if (isValidHex(hex)) {
      setBackground({ type: 'solid', value: hex });
    }
  };

  const handleInputBlur = () => {
    // When leaving the field, either format the valid hex or revert to safe color
    let hex = tempColor;
    if (!hex.startsWith('#') && /^[0-9A-Fa-f]+$/.test(hex)) {
        hex = '#' + hex;
    }

    if (isValidHex(hex)) {
        // Normalize to uppercase 6-digit (optional, but nice) or just keep as is
        setTempColor(hex.toUpperCase());
        setBackground({ type: 'solid', value: hex.toUpperCase() });
    } else {
        // Revert to last known good color
        setTempColor(safeColor);
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
    <div className="flex flex-col gap-4">
      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Background</h4>
      
      {/* --- Tab Buttons --- */}
      {/* --- Tab Buttons --- */}
      <div className="grid grid-cols-3 gap-2">
        <button
          className={`flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition ${
            settings.background.type === 'gradient'
              ? 'bg-[#f5c249] text-black border-[#f5c249]'
              : 'bg-[#1c1c23] text-zinc-400 border-zinc-800 hover:bg-zinc-700 hover:text-white'
          }`}
          onClick={() => setBackground({ type: 'gradient', value: PRESET_GRADIENTS[0].value })} // Default to first gradient
          disabled={disabled}
        >
          Gradient
        </button>
        <button
          className={`flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition ${
            settings.background.type === 'solid'
              ? 'bg-[#f5c249] text-black border-[#f5c249]'
              : 'bg-[#1c1c23] text-zinc-400 border-zinc-800 hover:bg-zinc-700 hover:text-white'
          }`}
          onClick={() => setBackground({ type: 'solid', value: '#1E293B' })}
          disabled={disabled}
        >
          Solid
        </button>
        <button
          className={`flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition ${
            settings.background.type === 'image'
              ? 'bg-[#f5c249] text-black border-[#f5c249]'
              : 'bg-[#1c1c23] text-zinc-400 border-zinc-800 hover:bg-zinc-700 hover:text-white'
          }`}
          onClick={() => setBackground({ type: 'image', value: '' })}
          disabled={disabled}
        >
          Image
        </button>
      </div>

      {/* --- Gradient Panel --- */}
      {settings.background.type === 'gradient' && (
        <div className="grid grid-cols-4 gap-2">
          {PRESET_GRADIENTS.map((gradient) => (
            <button
              key={gradient.name}
              className="h-10 w-full rounded-lg border-2 border-transparent transition hover:border-white/50"
              style={{ background: gradient.value }}
              onClick={() => setBackground({ type: 'gradient', value: gradient.value })}
              disabled={disabled}
            />
          ))}
        </div>
      )}
      
      {/* --- Solid Color Panel --- */}
      {settings.background.type === 'solid' && (
        <div className="flex flex-col gap-4 p-4 bg-[#0f0f12] border border-white/10 rounded-xl">
          {/* Color Preview and Hex Input */}
          <div className="flex items-center gap-3">
            <div 
              className="h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-white/10 transition hover:scale-105 hover:shadow-lg"
              style={{ backgroundColor: safeColor }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            <div className="flex flex-1 items-center overflow-hidden rounded-lg border border-white/10 bg-[#1A1A1A] h-9 transition focus-within:border-[#f5c249] focus-within:bg-[#262626]">
              <input
                type="text"
                className="h-full flex-1 bg-transparent px-3 text-xs font-mono font-medium text-zinc-100 placeholder-zinc-600 focus:outline-none uppercase"
                value={tempColor}
                onChange={(e) => handleHexInputChange(e.target.value)}
                onBlur={handleInputBlur}
                placeholder="#000000"
                disabled={disabled}
                maxLength={7}
              />
              <span className="flex h-full items-center justify-center border-l border-white/5 bg-white/5 px-3 text-[0.65rem] font-bold uppercase tracking-wider text-zinc-400 select-none">HEX</span>
            </div>
          </div>

          {/* Preset Color Palette */}
          <div className="grid grid-cols-6 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.name}
                className={`h-8 w-8 rounded-lg border-2 transition hover:scale-110 hover:shadow shadow-sm ${
                    safeColor.toLowerCase() === color.value.toLowerCase() 
                    ? 'border-[#f5c249] shadow-[0_0_0_3px_rgba(245,194,73,0.3)]' 
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color.color }}
                onClick={() => handleColorChange(color.value)}
                title={color.name}
                disabled={disabled}
              />
            ))}
          </div>

          {/* Advanced Color Picker */}
          {showColorPicker && (
            <div className="animate-in fade-in zoom-in-95 duration-200 p-4 bg-[#09090b] border border-white/10 rounded-xl shadow-2xl">
              <CustomColorPicker
                color={safeColor}
                onChange={handleColorChange}
              />
            </div>
          )}
        </div>
      )}

      {/* --- Image Upload Panel --- */}
      {/* --- Image Panel (Grid Layout) --- */}
      {settings.background.type === 'image' && (
        <div className="grid grid-cols-3 gap-2">
          {/* 1. Upload Button */}
          <div className="relative flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition aspect-video group overflow-hidden">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={disabled || uploading}
              className="absolute inset-0 cursor-pointer opacity-0 z-20"
              title="Upload custom image"
            />
            <div className="flex flex-col items-center gap-1 text-center pointer-events-none z-10">
              {uploading ? (
                <span className="text-xs text-zinc-400">Uploading...</span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-zinc-300"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                  <span className="text-[10px] uppercase font-bold text-zinc-500 group-hover:text-zinc-300">Upload</span>
                </>
              )}
            </div>
          </div>

          {/* 2. Preset Images */}
          {PRESET_IMAGES.map((img) => (
            <button
              key={img.name}
              className={`relative aspect-video rounded-xl overflow-hidden border-2 transition group ${
                settings.background.value === img.value
                  ? 'border-[#f5c249]'
                  : 'border-transparent hover:border-white/50'
              }`}
              onClick={() => setBackground({ type: 'image', value: img.value })}
              disabled={disabled}
            >
              <img src={img.value} alt={img.name} className="w-full h-full object-cover transition group-hover:scale-110" />
            </button>
          ))}

          {/* 3. Custom Image (if selected and not a preset) */}
          {settings.background.value && !PRESET_IMAGES.some(p => p.value === settings.background.value) && (
            <button
              className={`relative aspect-video rounded-xl overflow-hidden border-2 border-[#f5c249] transition`}
              // Allow re-selecting it if we clicked away? 
              // Actually, if it's visible, it IS selected. But for consistency:
              onClick={() => setBackground({ type: 'image', value: settings.background.value })}
              disabled={disabled}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}${settings.background.value}`}
                alt="Custom"
                className="w-full h-full object-cover"
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}