'use client';

export default function Ticker() {
    const messages = [
        "PENGUMPULAN ZAKAT FITRAH TELAH DIBUKA DI KANTOR SEKRETARIAT MASJID",
        "KAJIAN RUTIN SELASA MALAM: TAFSIR AL-QUR'AN BERSAMA USTADZ ABDULLAH",
        "JADWAL SHALAT JUMAT: KHATIB USTADZ HASAN, IMAM USTADZ AHMAD",
        "MARI JAGA KEBERSIHAN DAN KETERTIBAN DI LINGKUNGAN MASJID"
    ];

    return (
        <div className="bg-mosque-green -mx-6 -mb-6 h-12 flex items-center overflow-hidden border-t border-white/20">
            <div className="bg-white text-mosque-green font-bold px-4 h-full flex items-center z-10 shadow-lg">
                INFO
            </div>
            <div className="flex-1 relative h-full flex items-center overflow-hidden">
                <div className="ticker-content text-lg font-bold tracking-wide text-white">
                    {messages.join(' • ')} • {messages.join(' • ')}
                </div>
            </div>
        </div>
    );
}
