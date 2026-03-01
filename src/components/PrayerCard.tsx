'use client';

import { motion } from 'framer-motion';
import { Sunrise, CloudSun, Sunset, Moon, MoonStar, AlarmClock, Sun } from 'lucide-react';

interface PrayerCardProps {
    name: string;
    time: string;
    isActive: boolean;
}

const getIconForPrayer = (name: string) => {
    const icons: Record<string, React.ReactNode> = {
        'imsak': <AlarmClock className="w-6 h-6" />,
        'subuh': <Sunrise className="w-6 h-6" />,
        'terbit': <Sun className="w-6 h-6" />,
        'dzuhur': <CloudSun className="w-6 h-6" />,
        'ashar': <Sunset className="w-6 h-6" />,
        'maghrib': <Moon className="w-6 h-6" />,
        'isya': <MoonStar className="w-6 h-6" />,
    };
    return icons[name.toLowerCase()] || <AlarmClock className="w-6 h-6" />;
};

export default function PrayerCard({ name, time, isActive }: PrayerCardProps) {
    const icon = getIconForPrayer(name);

    return (
        <motion.div
            className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-500 ${
                isActive
                    ? 'bg-mosque-green border-2 border-white/50 shadow-lg scale-105'
                    : 'bg-white/5 border border-white/10'
            }`}
            initial={false}
            animate={{ scale: isActive ? 1.05 : 1 }}
        >
            <div className={`mb-2 ${isActive ? 'text-white' : 'text-white/60'}`}>
                {icon}
            </div>
            <span className={`text-xs font-bold tracking-widest mb-1 ${isActive ? 'text-white' : 'text-white/60'}`}>
                {name.toUpperCase()}
            </span>
            <span className="text-2xl font-bold font-mono text-white">
                {time}
            </span>
        </motion.div>
    );
}
