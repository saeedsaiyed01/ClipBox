export type AspectRatio = '1:1' | '4:5' | '9:16' | '16:9';

export type BackgroundType = 'solid' | 'gradient' | 'image';
export interface SolidBackground { type: 'solid'; value: string; }
export interface GradientBackground { type: 'gradient'; value: string; }
export interface ImageBackground { type: 'image'; value: string; }
export type AppBackground = SolidBackground | GradientBackground | ImageBackground;

// This is the main interface that matches your frontend state
export interface StudioSettings {
  background: AppBackground;
  aspectRatio: AspectRatio;
  borderRadius: number;
  zoom: number;
  position: { x: number, y: number };
}