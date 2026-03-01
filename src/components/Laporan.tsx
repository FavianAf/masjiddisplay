'use client';

import { useEffect, useRef } from 'react';

interface FinancialReportProps {
    onComplete?: () => void;
}

export default function Laporan({ onComplete }: FinancialReportProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Hardcoded data for weekly reports (Fridays)
    const weeklyReports = [
        { date: '2023-09-01', income: 5000000, expense: 2000000, note: 'Sholat Jumat dan kegiatan mingguan' },
        { date: '2023-09-08', income: 4500000, expense: 1500000, note: 'Perawatan masjid dan kegiatan anak-anak' },
        { date: '2023-09-15', income: 5200000, expense: 1800000, note: 'Pembayaran listrik dan air' },
        { date: '2023-09-22', income: 4800000, expense: 2200000, note: 'Perbaikan atap masjid' },
        { date: '2023-09-29', income: 5100000, expense: 1700000, note: 'Sholat Jumat dan kegiatan ramadhan' },
        { date: '2023-10-06', income: 4900000, expense: 1900000, note: 'Kegiatan rutin jumat berkah' },
        { date: '2023-10-13', income: 5300000, expense: 2100000, note: 'Santunan anak yatim piatu' },
        { date: '2023-10-20', income: 4700000, expense: 1600000, note: 'Operasional harian masjid' },
        { date: '2023-10-27', income: 5500000, expense: 2500000, note: 'Renovasi tempat wudhu pria' },
        { date: '2023-11-03', income: 4200000, expense: 1200000, note: 'Pengajian bulanan ibu-ibu' },
        { date: '2023-11-10', income: 5800000, expense: 3000000, note: 'Perbaikan sistem tata suara (sound system)' },
        { date: '2023-11-17', income: 4600000, expense: 1400000, note: 'Kebersihan karpet dan AC masjid' },
        { date: '2023-11-24', income: 5000000, expense: 2000000, note: 'Bantuan sosial warga sekitar' },
    ];

    // Hardcoded data for financial cards
    const accountBalance = 15000000;
    const monthlyExpense = 8500000;

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
    }, []);

    const formatCurrency = (amount: number) => {
        return `Rp ${amount.toLocaleString('id-ID')}`;
    };

    return (
        <div className="w-full h-full bg-white text-slate-900 p-6 flex flex-col gap-4 overflow-hidden">
            <div className="flex justify-between items-center">
                <h2 className="text-4xl font-bold text-slate-800">Laporan Keuangan</h2>
                <div className="text-sm font-bold text-slate-400 tracking-widest uppercase">Update: Feb 2026</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">Saldo Rekening</span>
                    <div className="text-3xl font-bold text-blue-900 mt-1">{formatCurrency(accountBalance)}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <span className="text-sm font-bold text-red-600 uppercase tracking-wider">Pengeluaran Bulan Ini</span>
                    <div className="text-3xl font-bold text-red-900 mt-1">{formatCurrency(monthlyExpense)}</div>
                </div>
            </div>

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
                        {weeklyReports.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-4 p-3 border-b border-slate-50 text-xl font-medium text-slate-600">
                                <div className="font-mono text-xl font-semibold text-slate-700">{item.date}</div>
                                <div className="text-emerald-600 font-bold px-2 py-1 rounded-lg inline-block">{formatCurrency(item.income)}</div>
                                <div className="text-rose-600 font-bold px-2 py-1 rounded-lg inline-block">{formatCurrency(item.expense)}</div>
                                <div className="text-slate-600 text-xl leading-relaxed">{item.note}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
