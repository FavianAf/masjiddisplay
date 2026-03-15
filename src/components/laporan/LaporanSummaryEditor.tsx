'use client';

import { Wallet, TrendingDown } from 'lucide-react';
import { FinancialSummary } from '@/types/laporan';
import { formatRupiah } from '@/lib/laporanUtils';

interface LaporanSummaryEditorProps {
  summary: FinancialSummary;
  onUpdate: (summary: FinancialSummary) => void;
}

export default function LaporanSummaryEditor({ summary, onUpdate }: LaporanSummaryEditorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="text-blue-600" size={20} />
          <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">Saldo Rekening</span>
        </div>
        <input
          type="number"
          min="0"
          value={summary.account_balance}
          onChange={(e) => onUpdate({
            ...summary,
            account_balance: parseInt(e.target.value) || 0
          })}
          placeholder="0"
          className="w-full text-2xl font-bold text-blue-900 bg-transparent border-b-2 border-blue-200 focus:border-blue-500 outline-none transition"
        />
        <div className="text-xs text-blue-600 mt-1">{formatRupiah(summary.account_balance)}</div>
      </div>

      <div className="bg-red-50 p-4 rounded-xl border border-red-100">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="text-red-600" size={20} />
          <span className="text-sm font-bold text-red-600 uppercase tracking-wider">Pengeluaran Bulan Ini</span>
        </div>
        <input
          type="number"
          min="0"
          value={summary.monthly_expense}
          onChange={(e) => onUpdate({
            ...summary,
            monthly_expense: parseInt(e.target.value) || 0
          })}
          placeholder="0"
          className="w-full text-2xl font-bold text-red-900 bg-transparent border-b-2 border-red-200 focus:border-red-500 outline-none transition"
        />
        <div className="text-xs text-red-600 mt-1">{formatRupiah(summary.monthly_expense)}</div>
      </div>
    </div>
  );
}
