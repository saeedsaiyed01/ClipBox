"use client";
import { StudioSettings } from "../types";

interface SettingsPanelProps {
  settings: StudioSettings;
  setSettings: (settings: Partial<StudioSettings>) => void;
  disabled?: boolean;
}

/**
 * Renders the "Border Radius" and "Zoom" sliders
 */
export default function SettingsPanel({ settings, setSettings, disabled }: SettingsPanelProps) {
  return (
    <>
      <div className="panel-section">
        <h4 className="panel-title">Border Radius</h4>
        <div className="slider-control">
          <input
            type="range"
            min="0"
            max="100" // Max 100px radius
            value={settings.borderRadius}
            onChange={(e) => setSettings({ borderRadius: Number(e.target.value) })}
            disabled={disabled}
          />
          <span>{settings.borderRadius}px</span>
        </div>
      </div>

      <div className="panel-section">
        <h4 className="panel-title">Video Size (Zoom)</h4>
        <div className="slider-control">
          <input
            type="range"
            min="50"  // Min 50% zoom
            max="200" // Max 200% zoom
            value={settings.zoom}
            onChange={(e) => setSettings({ zoom: Number(e.target.value) })}
            disabled={disabled}
          />
          <span>{settings.zoom}%</span>
        </div>
      </div>
    </>
  );
}