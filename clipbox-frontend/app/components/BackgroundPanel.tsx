"use client";
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
  
  const setBackground = (bg: AppBackground) => {
    setSettings({ background: bg });
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
          className={`btn-toggle`}
          onClick={() => alert('Image backgrounds coming soon!')} // Placeholder
          disabled={disabled || true} // Disabled for now
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
    </div>
  );
}