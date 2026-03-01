'use client';

import { useCurrentTime } from '@/hooks/useCurrentTime';
import HijriDate from './HijriDate';

export default function Clock() {
    const { time, date } = useCurrentTime();

    return (
        <div className="text-center py-4 mb-8">
            <div className="text-7xl font-bold font-mono tracking-tight text-white">
                {time}
            </div>
            <div className="text-xl font-medium text-white/80 mt-2 uppercase tracking-widest">
                {date}
            </div>
            <HijriDate />
        </div>
    );
}
