'use client';

import { useState, useEffect } from 'react';
import { Hadist } from '@/types/hadist';

interface HadistModalProps {
  hadist?: Hadist;
  index?: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (hadist: Hadist, index?: number) => void;
}

export default function HadistModal({ hadist, index, isOpen, onClose, onSave }: HadistModalProps) {
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (hadist) {
      setText(hadist.text);
      setSource(hadist.source);
      setIsActive(hadist.is_active);
    } else {
      setText('');
      setSource('');
      setIsActive(true);
    }
  }, [hadist, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim() || !source.trim()) {
      alert('Mohon lengkapi semua field');
      return;
    }

    const newHadist: Hadist = {
      id: hadist?.id,
      text: text.trim(),
      source: source.trim(),
      is_active: isActive,
    };

    onSave(newHadist, index);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {hadist ? 'Edit Hadist/Quran' : 'Tambah Hadist/Quran'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Teks Hadist/Quran <span className="text-red-500">*</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none text-gray-900"
              placeholder="Masukkan teks hadist atau ayat Quran..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Sumber <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white text-gray-900"
              placeholder="Contoh: HR. Muslim, QS. Al-Baqarah: 183"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-900">
              Aktifkan hadist/quran ini
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
            >
              {hadist ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
