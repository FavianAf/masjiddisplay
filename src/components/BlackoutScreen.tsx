'use client';

import { useEffect, useState } from 'react';
import { getCurrentTime } from '@/lib/getCurrentTime';

export default function BlackoutScreen() {
    const [time, setTime] = useState<string>('');
    const [date, setDate] = useState<string>('');

    useEffect(() => {
        const updateTime = () => {

        const {day, month, date, year} = getCurrentTime();
        const formattedDate = `${day}, ${date} ${month} ${year}`;

        const {hour, minute, second} = getCurrentTime();
        const formattedTime = `${hour}:${minute}:${second}`;    

        setDate(formattedDate);
        setTime(formattedTime);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black text-white flex flex-col justify-center items-center z-50">
        <h1 className="text-5xl font-bold mb-4">Sedang Memasuki Waktu Sholat, Selamat Beribadah</h1>
        <p className="text-6xl font-mono">{date}</p>
        <p className="text-6xl font-mono">{time}</p>
        </div>
    );
}
