'use client';

import { useEffect, useRef, useState } from 'react';
import { CountdownProps } from '@/types/countdown';
import { Clock as ClockIcon } from 'lucide-react';

export default function Countdown({ targetTime, sholatName, onFinish }: CountdownProps) {
    const [displaySeconds, setDisplaySeconds] = useState(0);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        const tick = () => {
            const now = Date.now();
            const diff = Math.floor((targetTime.getTime() - now) / 1000);

            if (diff <= 0) {
                setDisplaySeconds(0);
                onFinish?.();
                return;
            } else {
                setDisplaySeconds(diff);
                frameRef.current = requestAnimationFrame(tick);
            }
        };

        frameRef.current = requestAnimationFrame(tick);

        return () => {
            if (frameRef.current !== null) {
                cancelAnimationFrame(frameRef.current);
            }
        };
    }, [targetTime, onFinish]);

    useEffect(() => {
        if ([3, 2, 1].includes(displaySeconds)) {
            const audio = new Audio('/buzzer-13-187755.mp3');
            audio.play();
        }
    }, [displaySeconds]);

    const formatTime = (seconds: number) => {
        const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${minutes}:${secs}`;
    };

    const sholatNameDisplay = sholatName ? sholatName.toUpperCase() : '';

    return (
        <div className="glass p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-3 text-white/40">
                <ClockIcon size={16} />
                <span className="text-xs font-bold tracking-widest uppercase">
                    {sholatNameDisplay} DALAM
                </span>
            </div>
            <div className="text-4xl font-bold font-mono tracking-tight text-center text-white">
                {formatTime(displaySeconds)}
            </div>
        </div>
    );
}
