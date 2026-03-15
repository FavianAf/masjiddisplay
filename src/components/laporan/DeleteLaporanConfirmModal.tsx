'use client';

import { Trash2 } from 'lucide-react';

interface DeleteLaporanConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  note: string;
}

export default function DeleteLaporanConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  note,
}: DeleteLaporanConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <Trash2 className="text-red-600" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Hapus Laporan?</h2>
        </div>

        <p className="text-gray-600 mb-4">
          Apakah Anda yakin ingin menghapus laporan ini?
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-700">{note}</p>
        </div>

        <p className="text-sm text-red-600 mb-6">
          Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
