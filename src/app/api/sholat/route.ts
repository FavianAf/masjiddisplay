import { NextResponse } from "next/server";

interface SholatData {
    responseCode: string;
    responseMessage: string;
    responseData: {
        server_time: string;
        date: string;
        location: string;
        jadwal: {
            imsak: string;
            subuh: string;
            terbit: string;
            dzuhur: string;
            ashar: string;
            maghrib: string;
            isya: string;
        };
        iqomah: {
            imsak: string;
            subuh: string;
            terbit: string;
            dzuhur: string;
            ashar: string;
            maghrib: string;
            isya: string;
        };
        blackout_duration_minutes: number;
    };
}

let cache:
    | { data: SholatData; expiresAt: number; dateKey: string }
    | null = null;
let inFlight: Promise<SholatData> | null = null;

function timezoneWIB() {
    const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    return fmt.format(new Date());
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const masjid_id = searchParams.get('masjid_id');

    if (!masjid_id) {
        return NextResponse.json(
            { error: 'masjid_id is required' },
            { status: 400 }
        );
    }

    const now = Date.now();
    const todayKey = timezoneWIB();

    if (cache && cache.expiresAt > now && cache.dateKey === todayKey) {
        return NextResponse.json(cache.data, {
            headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
        });
    }

    if (inFlight) {
        const data = await inFlight;
        return NextResponse.json(data);
    }

    inFlight = (async () => {
        const apiUrl = process.env.API_BASE_URL || 'http://localhost:3000';
        const res = await fetch(
            `${apiUrl}/api/sholat/today?masjid_id=${masjid_id}`,
            { cache: "no-store" }
        );
        
        if (!res.ok) {
            throw new Error(`Backend API error: ${res.status}`);
        }

        const data: SholatData = await res.json();

        cache = {
            data,
            expiresAt: Date.now() + 3 * 60 * 60 * 1000,
            dateKey: timezoneWIB(), 
        };
        inFlight = null;
        return data;
    })();

    const data = await inFlight;
    return NextResponse.json(data);
}
