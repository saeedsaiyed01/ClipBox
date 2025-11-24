"use client";
import { StudioSettings } from "../types";

interface SettingsPanelProps {
  settings: StudioSettings;
  setSettings: (settings: Partial<StudioSettings>) => void;
  disabled?: boolean;
}

/**
 * Renders the "Border Radius" and "Zoom" sliders in Pro Video Editor style
 */
export default function SettingsPanel({ settings, setSettings, disabled }: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Border Radius Slider */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">
          Border Radius
        </label>
        <div className="bg-gray-900/50 p-3 rounded-lg flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100" // Max 100px radius
            value={settings.borderRadius}
            onChange={(e) => setSettings({ borderRadius: Number(e.target.value) })}
            disabled={disabled}
            className="flex-1 accent-yellow-400"
          />
          <span className="border border-gray-700 rounded px-3 py-1 text-sm text-center min-w-[3rem]">
            {settings.borderRadius}px
          </span>
        </div>
      </div>

      {/* Video Size (Zoom) Slider */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">
          Video Size (Zoom)
        </label>
        <div className="bg-gray-900/50 p-3 rounded-lg flex items-center gap-4">
          <input
            type="range"
            min="50"  // Min 50% zoom
            max="200" // Max 200% zoom
            value={settings.zoom}
            onChange={(e) => setSettings({ zoom: Number(e.target.value) })}
            disabled={disabled}
            className="flex-1 accent-yellow-400"
          />
          <span className="border border-gray-700 rounded px-3 py-1 text-sm text-center min-w-[3rem]">
            {settings.zoom}%
          </span>
        </div>
      </div>
    </div>
  );
}