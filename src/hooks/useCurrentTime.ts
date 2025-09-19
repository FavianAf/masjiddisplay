import { useEffect, useState } from "react";
import { getCurrentTime } from '@/lib/getCurrentTime';

export function useCurrentTime() {
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

    return { time, date };
}