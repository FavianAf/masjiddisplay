import { NextResponse } from "next/server";

export async function GET() {
    //dokumentasi https://documenter.getpostman.com/view/841292/2s9YsGittd
    const res = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/bantul`);
    const data = await res.json();

    return NextResponse.json(data);
}