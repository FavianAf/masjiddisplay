import { NextResponse } from "next/server";
import { getCurrentTime } from "@/lib/getCurrentTime";

type SholatData = any;

let cache:
    | { data: SholatData; expiresAt: number; dateKey: string }
    | null = null;
let inFlight: Promise<SholatData> | null = null;

function timezoneWIB() {
    // YYYY-MM-DD di zona Asia/Jakarta
    const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    return fmt.format(new Date()); // e.g. 2025-09-19
}

export async function GET() {
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
        const { date, monthAngka, year } = getCurrentTime();
        const res = await fetch(
            `https://api.myquran.com/v2/sholat/jadwal/1638/${year}/${monthAngka}/${date}`, // Surabaya 1638
            { cache: "no-store" } 
        );
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
