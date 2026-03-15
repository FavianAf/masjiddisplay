'use client';

import { useEffect, useRef } from 'react';
import { FinancialReport, FinancialSummary } from '@/types/laporan';
import { formatRupiah } from '@/lib/laporanUtils';

interface LaporanProps {
  reports: FinancialReport[];
  summary: FinancialSummary;
  onComplete?: () => void;
}

export default function Laporan({ reports, summary, onComplete }: LaporanProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    console.log('[Laporan] Component mounted');
    console.log('[Laporan] scrollHeight:', scrollHeight, 'clientHeight:', clientHeight, 'needsScroll:', scrollHeight > clientHeight);

    // If no scroll needed, wait 5s then complete
    if (scrollHeight <= clientHeight) {
      console.log('[Laporan] No scroll needed, waiting 5s');
      const timer = setTimeout(onComplete || (() => {}), 5000);
      return () => clearTimeout(timer);
    }

    // Auto scroll logic
    let scrollPos = 0;
    const scrollSpeed = 0.5; // pixels per frame
    let animationFrame: number;

    const scroll = () => {
      scrollPos += scrollSpeed;
      if (container) {
        container.scrollTop = scrollPos;

        if (scrollPos <= scrollHeight - clientHeight) {
          animationFrame = requestAnimationFrame(scroll);
        } else {
          // Reached bottom, wait 4s then complete
          console.log('[Laporan] Scroll completed at position:', scrollPos, 'target:', scrollHeight - clientHeight);
          console.log('[Laporan] Waiting 4s before calling onComplete');
          setTimeout(() => {
            console.log('[Laporan] Calling onComplete');
            onComplete?.();
          }, 4000);
        }
      }
    };

    // Start scrolling after 2s delay
    console.log('[Laporan] Will start scroll in 2s');
    const startTimer = setTimeout(() => {
      console.log('[Laporan] Starting scroll');
      animationFrame = requestAnimationFrame(scroll);
    }, 2000);

    return () => {
      clearTimeout(startTimer);
      cancelAnimationFrame(animationFrame);
    };
  }, [onComplete]);

  // Filter active reports and sort by date
  const activeReports = reports
    .filter(r => r.is_active)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Use summary data
  const accountBalance = summary.account_balance;
  const monthlyExpense = summary.monthly_expense;
  const lastUpdated = new Date(summary.last_updated).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short'
  });

  // Empty state handling
  if (activeReports.length === 0 && accountBalance === 0 && monthlyExpense === 0) {
    return (
      <div className="w-full h-full bg-white text-slate-900 p-6 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">📊</div>
          <h2 className="text-4xl font-bold text-slate-700 mb-3">Belum Ada Data Laporan</h2>
          <p className="text-xl text-slate-500">Silakan masukkan data laporan keuangan di halaman Pengaturan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white text-slate-900 p-6 flex flex-col gap-4 overflow-hidden">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-bold text-slate-800">Laporan Keuangan</h2>
        <div className="text-sm font-bold text-slate-400 tracking-widest uppercase">Update: {lastUpdated}</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">Saldo Rekening</span>
          <div className="text-3xl font-bold text-blue-900 mt-1">{formatRupiah(accountBalance)}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <span className="text-sm font-bold text-red-600 uppercase tracking-wider">Pengeluaran Bulan Ini</span>
          <div className="text-3xl font-bold text-red-900 mt-1">{formatRupiah(monthlyExpense)}</div>
        </div>
      </div>

      {activeReports.length > 0 && (
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-sm font-bold text-slate-700 mb-2">Laporan Mingguan (Jumat)</h3>
          <div className="flex-1 border border-slate-100 rounded-xl overflow-hidden flex flex-col">
            <div className="grid grid-cols-4 bg-slate-50 p-3 border-b border-slate-100 text-sm font-bold text-slate-600 uppercase tracking-widest">
              <div>Tanggal</div>
              <div>Masuk</div>
              <div>Keluar</div>
              <div>Keterangan</div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide">
              {activeReports.map((report, idx) => (
                <div key={report.id || idx} className="grid grid-cols-4 p-3 border-b border-slate-50 text-xl font-medium text-slate-600">
                  <div className="font-mono text-xl font-semibold text-slate-700">{report.date}</div>
                  <div className="text-emerald-600 font-bold px-2 py-1 rounded-lg inline-block">{formatRupiah(report.income)}</div>
                  <div className="text-rose-600 font-bold px-2 py-1 rounded-lg inline-block">{formatRupiah(report.expense)}</div>
                  <div className="text-slate-600 text-xl leading-relaxed">{report.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
