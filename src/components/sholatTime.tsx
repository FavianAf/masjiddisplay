'use client';

import { useEffect, useState } from "react";

type Jadwal = {
    imsak: string;
    terbit: string;
    subuh: string;
    dzuhur: string;
    ashar: string;
    maghrib: string;
    isya: string;
};

export default function SholatTime() {
    const [jadwal, setJadwal] = useState<Jadwal | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getTodayString = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const isCachedDataValid = (cachedDate: string) => {
        return cachedDate === getTodayString();
    };

    useEffect(() => {
        let alive = true;
        
        const cachedData = localStorage.getItem('sholatTimes');
        const cacheDate = localStorage.getItem('sholatTimesDate');
        
        if (cachedData && cacheDate && isCachedDataValid(cacheDate)) {
            if (alive) {
                setJadwal(JSON.parse(cachedData));
            }
            return;
        }
        
        (async () => {
            try {
                const res = await fetch("/api/sholat", { cache: "no-store" });
                if (!res.ok) throw new Error("Gagal mengambil data");

                const data = await res.json();
                const j = data?.data?.jadwal;
                
                if (alive) {
                    const newJadwal = {
                        imsak: j?.imsak ?? "-",
                        terbit: j?.terbit ?? "-",
                        subuh: j?.subuh ?? "-",
                        dzuhur: j?.dzuhur ?? "-",
                        ashar: j?.ashar ?? "-",
                        maghrib: j?.maghrib ?? "-",
                        isya: j?.isya ?? "-",
                    };
                    
                    localStorage.setItem('sholatTimes', JSON.stringify(newJadwal));
                    localStorage.setItem('sholatTimesDate', getTodayString());
                    
                    setJadwal(newJadwal);
                }
            } catch (e: any) {
                if (alive) setError(e.message);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    if (error) {
        return <div className="text-sm text-red-600">Error: {error}</div>;
    }

    if (!jadwal) {
        return <SholatSkeleton />;
    }

    return (
        <main className="flex flex-row flex-wrap gap-6 items-start justify-center p-4 bg-white">
            <Item label="Imsak" value={jadwal.imsak} />
            <Item label="Terbit" value={jadwal.terbit} />
            <Item label="Subuh" value={jadwal.subuh} />
            <Item label="Dzuhur" value={jadwal.dzuhur} />
            <Item label="Ashar" value={jadwal.ashar} />
            <Item label="Maghrib" value={jadwal.maghrib} />
            <Item label="Isya" value={jadwal.isya} />
        </main>
    );
}

function Item({ label, value }: { label: string; value: string }) {
    return (
        <div className="text-center">
        <div className="text-sm text-gray-500">{label}</div>
        <h1 className="text-2xl font-semibold">{value}</h1>
        </div>
    );
}

function SholatSkeleton() {
    return (
        <main className="flex flex-row flex-wrap gap-6 items-start justify-center p-4 bg-white animate-pulse">
        {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="text-center">
            <div className="h-4 w-16 bg-gray-200 rounded mb-2" />
            <div className="h-7 w-24 bg-gray-200 rounded" />
            </div>
        ))}
        </main>
    );
}
