'use client';

import { useMemo } from 'react';

export default function HijriDate() {
    const hijriDate = useMemo(() => {
        return new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(new Date());
    }, []);

    return (
        <div className="text-sm font-medium text-white/50 mt-1 uppercase tracking-wider">
            {hijriDate}
        </div>
    );
}
