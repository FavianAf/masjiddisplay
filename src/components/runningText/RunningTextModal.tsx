'use client';

import { useState, useEffect } from 'react';
import { RunningText } from '@/types/runningText';

interface RunningTextModalProps {
  runningText?: RunningText;
  index?: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (runningText: RunningText, index?: number) => void;
}

export default function RunningTextModal({ runningText, index, isOpen, onClose, onSave }: RunningTextModalProps) {
  const [text, setText] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (runningText) {
      setText(runningText.text);
      setIsActive(runningText.is_active);
    } else {
      setText('');
      setIsActive(true);
    }
  }, [runningText, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      alert('Mohon lengkapi semua field');
      return;
    }

    const newRunningText: RunningText = {
      id: runningText?.id,
      text: text.trim(),
      is_active: isActive,
    };

    onSave(newRunningText, index);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {runningText ? 'Edit Running Text' : 'Tambah Running Text'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Teks Running Text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              maxLength={255}
              className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none text-gray-900"
              placeholder="Masukkan teks running text..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {text.length}/255 karakter
            </p>
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
              Aktifkan running text ini
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
              {runningText ? 'Update' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
