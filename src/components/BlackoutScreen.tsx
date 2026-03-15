'use client';

import { useCurrentTime } from '@/hooks/useCurrentTime';

export default function BlackoutScreen() {
    const { time } = useCurrentTime();

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black text-white flex flex-col justify-center items-center z-50">
            <p className="text-[15rem] font-mono font-bold tracking-wider">{time}</p>
        </div>
    );
}
