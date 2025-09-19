'use client';

import { useCurrentTime } from '@/hooks/useCurrentTime';

export default function BlackoutScreen() {
    const { time, date } = useCurrentTime();

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black text-white flex flex-col justify-center items-center z-50">
            <h1 className="text-5xl font-bold mb-4">Sedang Memasuki Waktu Sholat, Selamat Beribadah</h1>
            <p className="text-6xl font-mono">{date}</p>
            <p className="text-6xl font-mono">{time}</p>
        </div>
    );
}
