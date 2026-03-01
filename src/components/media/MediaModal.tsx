'use client';

import { useState, useEffect } from 'react';
import { Media, MediaLimits } from '@/types/media';
import { validateMedia, formatMediaName, generateYoutubeMediaName } from '@/lib/mediaUtils';
import { X } from 'lucide-react';

interface Props {
  media?: Media;
  index?: number;
  medias: Media[];
  limits: MediaLimits;
  isOpen: boolean;
  onClose: () => void;
  onSave: (media: Media, index?: number) => void;
}

export default function MediaModal({ media, index, medias, limits, isOpen, onClose, onSave }: Props) {
  const [mediaType, setMediaType] = useState<'url' | 'youtube' | 'file'>('url');
  const [mediaValue, setMediaValue] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [startTime, setStartTime] = useState('00:00:00');
  const [endTime, setEndTime] = useState('23:59:59');
  const [isActive, setIsActive] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (media) {
      setMediaType(media.media_type);
      setMediaValue(media.media_value || '');
      setStartTime(media.start_time);
      setEndTime(media.end_time);
      setIsActive(media.is_active);
      
      if (media.media_type !== 'youtube') {
        const parts = media.media_name.split('|');
        setTitle(parts[0]?.trim() || '');
        setSubtitle(parts[1]?.trim() || '');
      }
      
      if (media.media_type === 'file' && media.file) {
        setFile(media.file);
      }
    } else {
      resetForm();
    }
  }, [media, isOpen]);

  const resetForm = () => {
    setMediaType('url');
    setMediaValue('');
    setTitle('');
    setSubtitle('');
    setStartTime('00:00:00');
    setEndTime('23:59:59');
    setIsActive(true);
    setFile(null);
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 1 * 1024 * 1024) {
        setError('Ukuran file maksimal 1 MB');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Format file harus JPEG, PNG, GIF, atau WebP');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSave = () => {
    setError('');
    
    const newMedia: Media = {
      id: media?.id,
      media_type: mediaType,
      media_value: mediaType === 'file' ? undefined : mediaValue,
      media_name: mediaType === 'youtube' 
        ? generateYoutubeMediaName(media?.id)
        : formatMediaName(title, subtitle),
      is_active: isActive,
      start_time: startTime,
      end_time: endTime,
      file: mediaType === 'file' ? (file || media?.file) : undefined,
    };

    const validation = validateMedia(newMedia, medias, limits, index);
    if (!validation.valid) {
      setError(validation.error || 'Validasi gagal');
      return;
    }

    onSave(newMedia, index);
    resetForm();
    onClose();
  };

  const getCurrentCounts = () => {
    const currentMedias = media !== undefined && index !== undefined
      ? medias.filter((_, i) => i !== index)
      : medias;
    return {
      url: currentMedias.filter(m => m.media_type === 'url').length,
      youtube: currentMedias.filter(m => m.media_type === 'youtube').length,
      file: currentMedias.filter(m => m.media_type === 'file').length,
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {media ? 'Edit Media' : 'Tambah Media Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">Tipe Media</label>
            <div className="flex gap-3">
              {(['url', 'youtube', 'file'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setMediaType(type);
                    setError('');
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg transition capitalize ${
                    mediaType === type
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'url' ? 'URL Gambar' : type === 'youtube' ? 'YouTube' : 'Upload File'}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {mediaType === 'url' && `URL Gambar (${getCurrentCounts().url}/${limits.url})`}
              {mediaType === 'youtube' && `YouTube (${getCurrentCounts().youtube}/${limits.youtube})`}
              {mediaType === 'file' && `File (${getCurrentCounts().file}/${limits.file})`}
            </div>
          </div>

          {mediaType === 'file' ? (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Upload File</label>
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer block text-center"
                >
                  <div className="space-y-2">
                    <div className="text-emerald-600 font-medium">
                      {file ? file.name : 'Klik untuk upload file'}
                    </div>
                    <div className="text-sm text-gray-600">
                      atau drag & drop file di sini
                    </div>
                  </div>
                </label>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Format: JPEG, PNG, GIF, WebP | Maksimal: 1 MB
                </p>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {mediaType === 'youtube' ? 'YouTube Embed URL' : 'URL Gambar'}
              </label>
              <input
                type="url"
                value={mediaValue}
                onChange={(e) => setMediaValue(e.target.value)}
                placeholder={
                  mediaType === 'youtube'
                    ? 'https://www.youtube.com/embed/VIDEO_ID'
                    : 'https://example.com/image.jpg'
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white text-gray-900"
              />
            </div>
          )}

          {mediaType !== 'youtube' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Background Image"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Kajian Rutin Selasa Malam • 19:30 WIB"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white text-gray-900"
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Waktu Mulai</label>
              <input
                type="time"
                step="1"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Waktu Selesai</label>
              <input
                type="time"
                step="1"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white text-gray-900"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Mendukung jadwal lintas hari (contoh: 22:00:00 - 08:00:00)
          </p>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="is-active" className="text-sm font-medium text-gray-900">
              Aktifkan media ini
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
          >
            {media ? 'Simpan Perubahan' : 'Tambah Media'}
          </button>
        </div>
      </div>
    </div>
  );
}
