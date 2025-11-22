import { StudioSettings } from "../types";

/**
 * Helper to convert our aspect ratio string (e.g., '16:9')
 * into the format CSS understands (e.g., '16 / 9').
 */
const getAspectRatioCSS = (ratio: StudioSettings['aspectRatio']) => {
  return ratio.replace(':', ' / ');
};

/**
 * This is the Live Preview component.
 * It's just a <video> tag inside some <div>s.
 * It uses inline CSS styles to react to your settings.
 * NO CANVAS IS USED.
 */
export default function PreviewWindow({ settings, videoPreviewUrl }: { settings: StudioSettings, videoPreviewUrl: string }) {
  const { background, aspectRatio, borderRadius, zoom } = settings;

  return (
    <div 
      className="preview-window"
      // 1. Set the aspect ratio of the outer container
      style={{
        aspectRatio: getAspectRatioCSS(aspectRatio),
      }}
    >
      <div
        className="preview-canvas"
        // 2. Set the background (solid, gradient, or image)
        style={{
          background: background.type === 'image'
            ? `url(${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}${background.value})`
            : background.value,
          backgroundSize: background.type === 'image' ? 'cover' : undefined,
          backgroundPosition: background.type === 'image' ? 'center' : undefined,
        }}
      >
        <video
          className="preview-video"
          src={videoPreviewUrl}
          autoPlay
          loop
          muted
          // 3. Apply zoom and border radius to the video element
          style={{
            transform: `scale(${zoom / 100})`,
            borderRadius: `${borderRadius}px`,
          }}
        />
      </div>
    </div>
  );
}