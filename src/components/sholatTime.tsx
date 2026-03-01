'use client';

import { useEffect, useState, useMemo } from "react";
import { authStorage, cacheStorage } from "@/lib/storage";
import PrayerCard from "./PrayerCard";

type Jadwal = {
    imsak: string;
    subuh: string;
    terbit: string;
    dzuhur: string;
    ashar: string;
    maghrib: string;
    isya: string;
};

const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

const isCachedDataValid = (cachedDate: string) => {
    return cachedDate === getTodayString();
};

export default function SholatTime({ activePrayerName }: { activePrayerName: string }) {
    const [jadwal, setJadwal] = useState<Jadwal | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [masjidIdError, setMasjidIdError] = useState(false);

    const prayerTimes = useMemo(() => {
        if (!jadwal) return [];
        return [
            { name: 'imsak', time: jadwal.imsak },
            { name: 'subuh', time: jadwal.subuh },
            { name: 'terbit', time: jadwal.terbit },
            { name: 'dzuhur', time: jadwal.dzuhur },
            { name: 'ashar', time: jadwal.ashar },
            { name: 'maghrib', time: jadwal.maghrib },
            { name: 'isya', time: jadwal.isya },
        ];
    }, [jadwal]);

    useEffect(() => {
        let alive = true;

        (async () => {
            const masjid_id = await authStorage.getMasjidId();

            if (!masjid_id) {
                if (alive) {
                    setMasjidIdError(true);
                    setError('Masjid ID tidak ditemukan. Silakan login terlebih dahulu.');
                }
                return;
            }

            const cachedData = await cacheStorage.getSholatTimes();
            const cacheDate = await cacheStorage.getSholatTimesDate();

            if (cachedData && cacheDate && isCachedDataValid(cacheDate)) {
                if (alive) {
                    setJadwal(JSON.parse(cachedData));
                }
                return;
            }

            try {
                const res = await fetch(`/api/sholat?masjid_id=${masjid_id}`, { cache: "no-store" });
                if (!res.ok) throw new Error("Gagal mengambil data");

                const data = await res.json();
                const j = data?.responseData?.jadwal;

                if (alive) {
                    const newJadwal = {
                        imsak: j?.imsak ?? "-",
                        subuh: j?.subuh ?? "-",
                        terbit: j?.terbit ?? "-",
                        dzuhur: j?.dzuhur ?? "-",
                        ashar: j?.ashar ?? "-",
                        maghrib: j?.maghrib ?? "-",
                        isya: j?.isya ?? "-",
                    };

                    await cacheStorage.setSholatTimes(JSON.stringify(newJadwal));
                    await cacheStorage.setSholatTimesDate(getTodayString());

                    setJadwal(newJadwal);
                }
            } catch (e) {
                if (alive) setError(e instanceof Error ? e.message : 'Terjadi kesalahan');
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    if (masjidIdError) {
        return (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
                <div className="text-sm font-medium">Masjid ID Tidak Ditemukan</div>
                <div className="text-xs mt-1">Silakan akses /pengaturan untuk setup awal.</div>
            </div>
        );
    }

    if (error) {
        return <div className="text-sm text-red-600">Error: {error}</div>;
    }

    if (!jadwal) {
        return <SholatSkeleton />;
    }

    return (
        <div className="grid grid-cols-7 gap-4">
            {prayerTimes.map((prayer) => (
                <PrayerCard
                    key={prayer.name}
                    name={prayer.name}
                    time={prayer.time}
                    isActive={prayer.name === activePrayerName}
                />
            ))}
        </div>
    );
}

function SholatSkeleton() {
    return (
        <div className="grid grid-cols-7 gap-4 animate-pulse">
            {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-xl">
                    <div className="h-6 w-6 bg-white/20 rounded-full mb-2" />
                    <div className="h-4 w-12 bg-white/20 rounded mb-1" />
                    <div className="h-7 w-16 bg-white/20 rounded" />
                </div>
            ))}
        </div>
    );
}
