export type MediaType = 'url' | 'youtube' | 'file';

export interface Media {
  id?: string;
  media_type: MediaType;
  media_value?: string;
  media_name: string;
  is_active: boolean;
  start_time: string;  // Format: "HH:mm:ss" (24-hour with seconds)
  end_time: string;    // Format: "HH:mm:ss" (24-hour with seconds)
  file?: File;
}

export interface OverlayText {
  title: string;
  subtitle: string;
}

export interface MediaLimits {
  url: number;
  youtube: number;
  file: number;
}
