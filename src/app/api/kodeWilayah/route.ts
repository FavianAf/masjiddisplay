import { NextResponse } from "next/server";

export async function GET() {
    const res = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/bantul`);
    const data = await res.json();

    return NextResponse.json(data);
}