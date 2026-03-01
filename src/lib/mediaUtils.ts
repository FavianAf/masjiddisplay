import { Media, OverlayText, MediaType } from '@/types/media';

export const parseMediaName = (mediaName: string): OverlayText => {
  const parts = mediaName.split('|');
  return {
    title: parts[0]?.trim() || '',
    subtitle: parts[1]?.trim() || ''
  };
};

export const formatMediaName = (title: string, subtitle: string): string => {
  return `${title}|${subtitle}`;
};

export const generateYoutubeMediaName = (mediaId?: string): string => {
  return `${mediaId || 'temp'}_youtube`;
};

/**
 * Parse format waktu ISO 8601 atau HH:mm ke format HH:mm:ss
 *
 * @param timeString - String waktu (format: "0000-01-01T00:00:00Z" atau "00:00" atau "00:00:00")
 * @returns Format HH:mm:ss
 *
 * @example
 * parseDateTimeToHHMMSS("0000-01-01T00:00:00Z") // "00:00:00"
 * parseDateTimeToHHMMSS("00:30") // "00:30:00"
 * parseDateTimeToHHMMSS("00:30:15") // "00:30:15"
 * parseDateTimeToHHMMSS("23:59") // "23:59:00"
 */
export const parseDateTimeToHHMMSS = (timeString: string): string => {
  // Jika sudah format HH:mm:ss (8 karakter dan ada 2 ':'), langsung return
  if (timeString && timeString.length === 8 && (timeString.match(/:/g) || []).length === 2) {
    return timeString;
  }

  // Jika format HH:mm (5 karakter), tambahkan ":00"
  if (timeString && timeString.length === 5 && timeString.includes(':')) {
    return `${timeString}:00`;
  }

  // Jika format ISO 8601, parse dan ekstrak HH:mm:ss
  try {
    const date = new Date(timeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error parsing time:', timeString, error);
    return '00:00:00'; // Default fallback jika error
  }
};

export const isTimeInRange = (current: string, start: string, end: string): boolean => {
  const parseTime = (t: string) => {
    // Auto parse format ISO 8601 atau HH:mm ke HH:mm:ss
    const hhmmss = parseDateTimeToHHMMSS(t);
    const [h, m, s] = hhmmss.split(':').map(Number);
    return h * 3600 + m * 60 + s; // Convert to seconds
  };

  const currentSec = parseTime(current);
  const startSec = parseTime(start);
  const endSec = parseTime(end);

  if (startSec <= endSec) {
    return currentSec >= startSec && currentSec <= endSec;
  } else {
    return currentSec >= startSec || currentSec <= endSec;
  }
};

export const getCurrentTimeInHHMMSS = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

export const getMediaCountByType = (medias: Media[], type: MediaType): number => {
  return medias.filter(m => m.media_type === type).length;
};

export const validateTimeFormat = (time: string | null | undefined, fieldName: string): { valid: boolean; error?: string } => {
  if (time === null || time === undefined || time === '') {
    return { valid: true }; // null means no schedule, which is valid
  }

  if (typeof time !== 'string') {
    return { valid: false, error: `${fieldName} harus berupa string` };
  }

  // Parse ke format HH:mm:ss jika format ISO 8601 atau HH:mm
  const hhmmss = parseDateTimeToHHMMSS(time);

  // Validasi format HH:mm:ss (8 karakter)
  if (hhmmss.length !== 8) {
    return { valid: false, error: `${fieldName} harus format 8 digit: "HH:mm:ss"` };
  }

  if (hhmmss[2] !== ':' || hhmmss[5] !== ':') {
    return { valid: false, error: `${fieldName} harus format "HH:mm:ss" (titik dua di posisi ke-3 dan ke-6)` };
  }

  const hourStr = hhmmss.substring(0, 2);
  const minuteStr = hhmmss.substring(3, 5);
  const secondStr = hhmmss.substring(6, 8);

  if (!/^\d{2}$/.test(hourStr) || !/^\d{2}$/.test(minuteStr) || !/^\d{2}$/.test(secondStr)) {
    return { valid: false, error: `${fieldName} hanya boleh berisi digit (dikirim: ${time})` };
  }

  const hour = parseInt(hourStr, 10);
  if (isNaN(hour) || hour < 0 || hour > 23) {
    return { valid: false, error: `${fieldName} jam tidak valid: harus 00-23 (dikirim: ${hourStr})` };
  }

  const minute = parseInt(minuteStr, 10);
  if (isNaN(minute) || minute < 0 || minute > 59) {
    return { valid: false, error: `${fieldName} menit tidak valid: harus 00-59 (dikirim: ${minuteStr})` };
  }

  const second = parseInt(secondStr, 10);
  if (isNaN(second) || second < 0 || second > 59) {
    return { valid: false, error: `${fieldName} detik tidak valid: harus 00-59 (dikirim: ${secondStr})` };
  }

  return { valid: true };
};

export const validateMedia = (media: Media, existingMedias: Media[], limits: { url: number; youtube: number; file: number }, editingIndex?: number): { valid: boolean; error?: string } => {
  if (media.media_type !== 'youtube' && !media.media_name.trim()) {
    return { valid: false, error: 'Title dan Subtitle wajib diisi' };
  }
  
  const timeValidation = validateTimeFormat(media.start_time, 'Waktu mulai');
  if (!timeValidation.valid) return timeValidation;
  
  const endTimeValidation = validateTimeFormat(media.end_time, 'Waktu selesai');
  if (!endTimeValidation.valid) return endTimeValidation;
  
  if (media.media_type === 'file') {
    if (!media.file) {
      return { valid: false, error: 'File wajib diupload' };
    }
    if (media.file.size > 1 * 1024 * 1024) {
      return { valid: false, error: 'Ukuran file maksimal 1 MB' };
    }
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(media.file.type)) {
      return { valid: false, error: 'Format file harus JPEG, PNG, GIF, atau WebP' };
    }
  } else if (!media.media_value?.trim()) {
    return { valid: false, error: 'URL wajib diisi' };
  }
  
  const mediasToCount = editingIndex !== undefined 
    ? existingMedias.filter((_, idx) => idx !== editingIndex)
    : existingMedias;
  const currentCount = getMediaCountByType(mediasToCount, media.media_type);
  const limit = limits[media.media_type];
  if (currentCount >= limit) {
    return { valid: false, error: `Maksimal ${limit} media tipe ${media.media_type}` };
  }
  
  return { valid: true };
};
