import { AspectRatio, StudioSettings } from "../types";

interface LayoutPanelProps {
  settings: StudioSettings;
  setSettings: (settings: Partial<StudioSettings>) => void;
  disabled?: boolean;
}

// Define the aspect ratios you want to offer
const RATIOS: { key: AspectRatio, label: string }[] = [
  { key: '16:9', label: 'Landscape (16:9)' },
  { key: '1:1',  label: 'Square (1:1)' },
  { key: '4:5',  label: 'Portrait (4:5)' },
  { key: '9:16', label: 'Story/Reel (9:16)' },
];

/**
 * Renders the "Aspect Ratio" buttons.
 */
export default function LayoutPanel({ settings, setSettings, disabled }: LayoutPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Aspect Ratio</h4>
      <div className="grid grid-cols-2 gap-2">
        {RATIOS.map((ratio) => (
          <button
            key={ratio.key}
            className={`flex items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium transition active:scale-95 ${
              settings.aspectRatio === ratio.key
                ? 'bg-[#f5c249] text-black border-[#f5c249] font-semibold shadow-[0_4px_12px_rgba(245,194,73,0.3)]'
                : 'bg-[#1c1c23] text-zinc-400 border-zinc-800 hover:bg-zinc-700 hover:text-white'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => setSettings({ aspectRatio: ratio.key })}
            disabled={disabled}
          >
            {ratio.label}
          </button>
        ))}
      </div>
    </div>
  );
}