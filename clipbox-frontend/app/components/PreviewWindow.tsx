import { StudioSettings } from "../types";

const getAspectRatioCSS = (ratio: StudioSettings["aspectRatio"]) => {
  return ratio.replace(":", " / ");
};

export default function PreviewWindow({
  settings,
  videoPreviewUrl,
  videoRef,
  onTimeUpdate,
  onLoadedMetadata,
  onPlay,
  onPause,
  children,
}: {
  settings: StudioSettings;
  videoPreviewUrl: string;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  onTimeUpdate?: () => void;
  onLoadedMetadata?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  children?: React.ReactNode;
}) {
  const { background, aspectRatio, borderRadius, zoom } = settings;
  const useImageBackground = background.type === "image" && background.value;
  const backgroundValue = background.type !== "image" ? background.value : "black";
  
  // UI Constants
  const FRAME_RADIUS = 32;     // The rounded corners of the UI Container
  const CANVAS_RADIUS = 24;    // The rounded corners of the active workspace

  return (
    <div
      className="group relative flex flex-col mt-[-50px] gap-8 w-full min-h-[400px] items-center justify-center overflow-hidden border border-white/10 bg-gradient-to-br from-[#101013] via-[#050506] to-[#000000] p-8 shadow-2xl"
      style={{
        borderRadius: `${FRAME_RADIUS}px`,
      }}
    >
      {/* 1. THE ARTBOARD / CANVAS 
         This represents the actual video file dimensions (e.g. 1920x1080)
         and holds the background color.
      */}
      <div
        className="relative flex items-center justify-center overflow-hidden shadow-xl transition-all duration-300 ease-out"
        style={{
          aspectRatio: getAspectRatioCSS(aspectRatio),
          background: backgroundValue,
          borderRadius: `${CANVAS_RADIUS}px`,
          width: '100%', 
          maxWidth: '100%',
        }}
      >
        {/* Background Image Layer (Optional) */}
        {useImageBackground && (
          <img
            src={
              ['/image1.jpg', '/image2.jpeg'].includes(background.value) 
                ? background.value 
                : `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}${background.value}`
            }
            alt="Background"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
        )}

        {/* 2. THE TRANSFORM LAYER (ZOOM) 
           We separate the transform from the clipping to prevent border-radius bugs.
           We use flex/center to ensure the video stays in the middle when zoomed.
        */}
        <div 
          className="absolute inset-0 flex items-center justify-center transition-transform duration-200 ease-out"
          style={{
             transform: `scale(${zoom / 100})`,
          }}
        >
          {/* 3. THE VIDEO CONTAINER 
             This is the "Card" that holds the video.
             - We enforce the aspect ratio here again so the video fills this box.
             - overflow-hidden + borderRadius here ensures the clipping happens.
          */}
          <div 
            className="relative h-full w-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10"
            style={{
              borderRadius: `${borderRadius}px`,
            }}
          >
             <video
              ref={videoRef}
              className="h-full w-full object-cover" 
              src={videoPreviewUrl}
              autoPlay
              loop
              muted
              playsInline
              // Forward events
              onTimeUpdate={onTimeUpdate}
              onLoadedMetadata={onLoadedMetadata}
              onPlay={onPlay}
              onPause={onPause}
            />
          </div>
        </div>
    </div>
      {children}
    </div>
  );
}