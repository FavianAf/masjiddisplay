'use client';

import { useCurrentTime } from '@/hooks/useCurrentTime';

export default function Clock() {
    const { time, date } = useCurrentTime();

    return (
        <div className="text-center mt-10">
            <h2 className="text-xl text-gray-500 mb-2">{date}</h2>
            <h1 className="text-5xl font-bold text-black">{time}</h1>
        </div>
    );
}
