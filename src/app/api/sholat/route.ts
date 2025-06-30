import { NextResponse } from "next/server";
import { getCurrentTime } from "@/lib/getCurrentTime";

export async function GET() {
    const {date, monthAngka, year} = getCurrentTime();
    const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/1505/${year}/${monthAngka}/${date}`);
    const data = await res.json();
    
    return NextResponse.json(data);
}