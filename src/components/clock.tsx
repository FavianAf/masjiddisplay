'use client';

import { useState, useEffect } from 'react';
import { getCurrentTime } from '@/lib/getCurrentTime';

export default function Clock() {
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
        <div className="text-center mt-10">
        <h2 className="text-xl text-gray-500 mb-2">{date}</h2>
        <h1 className="text-5xl font-bold text-black">{time}</h1>
        </div>
    );
}
