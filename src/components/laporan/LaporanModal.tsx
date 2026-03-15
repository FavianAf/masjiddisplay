'use client';

import { useState, useEffect } from 'react';
import { FinancialReport } from '@/types/laporan';
import { formatRupiah, validateFinancialReport, validateDateFormat } from '@/lib/laporanUtils';

interface LaporanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: FinancialReport) => void;
  report?: FinancialReport;
  existingDates?: string[];
}

export default function LaporanModal({ isOpen, onClose, onSave, report, existingDates = [] }: LaporanModalProps) {
  const [formData, setFormData] = useState<FinancialReport>({
    date: new Date().toISOString().split('T')[0],
    income: 0,
    expense: 0,
    note: '',
    is_active: true,
  });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (report) {
      setFormData(report);
    }
  }, [report]);

  useEffect(() => {
    if (isOpen && !report) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        income: 0,
        expense: 0,
        note: '',
        is_active: true,
      });
    }
  }, [isOpen, report]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateFinancialReport(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    // Check untuk duplicate dates (hanya untuk new reports atau ketika date berubah)
    if (!report || formData.date !== report.date) {
      if (existingDates.includes(formData.date)) {
        setErrors(['Tanggal sudah ada di laporan lain']);
        return;
      }
    }

    onSave(formData);
    setErrors([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-emerald-900 mb-4">
          {report ? 'Edit Laporan' : 'Tambah Laporan'}
        </h2>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {errors.map((error, idx) => (
              <div key={idx}>• {error}</div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Tanggal
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Pemasukan
            </label>
            <input
              type="number"
              min="0"
              value={formData.income}
              onChange={(e) => setFormData({ ...formData, income: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              required
            />
            <div className="text-xs text-emerald-600 mt-1">{formatRupiah(formData.income)}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Pengeluaran
            </label>
            <input
              type="number"
              min="0"
              value={formData.expense}
              onChange={(e) => setFormData({ ...formData, expense: parseInt(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              required
            />
            <div className="text-xs text-rose-600 mt-1">{formatRupiah(formData.expense)}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Keterangan
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Masukkan keterangan laporan..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none"
              required
            />
            <div className="text-xs text-gray-500 mt-1">{formData.note.length}/500 karakter</div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-900">
              Aktif
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
