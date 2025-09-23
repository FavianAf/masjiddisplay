'use client';

import { useEffect, useState } from "react";


export default function Laporan() {
    // Hardcoded data for weekly reports (Fridays)
    const weeklyReports = [
        { date: '2023-09-01', income: 5000000, expense: 2000000, description: 'Sholat Jumat dan kegiatan mingguan' },
        { date: '2023-09-08', income: 4500000, expense: 1500000, description: 'Perawatan masjid dan kegiatan anak-anak' },
        { date: '2023-09-15', income: 5200000, expense: 1800000, description: 'Pembayaran listrik dan air' },
        { date: '2023-09-22', income: 4800000, expense: 2200000, description: 'Perbaikan atap masjid' },
        { date: '2023-09-29', income: 5100000, expense: 1700000, description: 'Sholat Jumat dan kegiatan ramadhan' },
    ];

    // Hardcoded data for financial cards
    const accountBalance = 15000000;
    const monthlyExpense = 8500000;

    return (
        <div className="p-6">
            <h1 className="text-2xl text-black font-bold mb-6">Laporan Keuangan</h1>
            
            {/* Financial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-100 p-6 rounded-lg shadow">
                    <h2 className="text-lg text-black font-semibold mb-2">Saldo Rekening</h2>
                    <p className="text-2xl font-bold text-blue-800">Rp {accountBalance.toLocaleString('id-ID')}</p>
                </div>
                
                <div className="bg-red-100 p-6 rounded-lg shadow">
                    <h2 className="text-lg text-black font-semibold mb-2">Total Pengeluaran Bulan Ini</h2>
                    <p className="text-2xl font-bold text-red-800">Rp {monthlyExpense.toLocaleString('id-ID')}</p>
                </div>
            </div>

            {/* Weekly Reports Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <h2 className="text-xl text-black font-semibold px-6 py-3">Laporan Mingguan (Setiap Hari Jumat)</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemasukan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengeluaran</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {weeklyReports.map((report, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 text-black whitespace-nowrap ">{report.date}</td>
                                    <td className="px-6 py-4 text-black whitespace-nowrap">Rp {report.income.toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 text-black whitespace-nowrap">Rp {report.expense.toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 text-black">{report.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}