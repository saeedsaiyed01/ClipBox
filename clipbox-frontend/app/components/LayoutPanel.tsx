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
    <div className="panel-section">
      <h4 className="ui-label">Aspect Ratio</h4>
      <div className="button-grid">
        {RATIOS.map((ratio) => (
          <button
            key={ratio.key}
            className={`option-button ${settings.aspectRatio === ratio.key ? 'active' : ''}`}
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