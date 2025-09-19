'use client';

import { useState, useEffect } from "react";

export default function SholatTime() {
    const [imsak, setWaktuImsak] = useState<string>("");
    const [terbit, setWaktuTerbit] = useState<string>("");
    const [subuh, setWaktuSubuh] = useState<string>("");
    const [dzuhur, setWaktuDzuhur] = useState<string>("");
    const [ashar, setWaktuAshar] = useState<string>("");
    const [maghrib, setWaktuMaghrib] = useState<string>("");
    const [isya, setWaktuIsya] = useState<string>("");

    useEffect(() => {
        const fetchWaktuSholat = async () => {
            const res = await fetch("/api/sholat");
            const data = await res.json();

            setWaktuImsak(data.data.jadwal.imsak);
            setWaktuTerbit(data.data.jadwal.terbit);
            setWaktuSubuh(data.data.jadwal.subuh);
            setWaktuDzuhur(data.data.jadwal.dzuhur);
            setWaktuAshar(data.data.jadwal.ashar);
            setWaktuMaghrib(data.data.jadwal.maghrib);
            setWaktuIsya(data.data.jadwal.isya);
        };
        fetchWaktuSholat();

        // const interval = setInterval(() => {
        //     fetchWaktuSholat(); 
        // }, 5 * 60 * 60 * 1000); // setiap 5 jam

        // return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <main className="flex flex-row flex-wrap gap-6 items-start justify-center p-4 bg-white">
                <div className="text-center">
                    <div className="text-sm text-gray-500">Imsak</div>
                    <h1 className="text-2xl font-semibold">{imsak}</h1>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-500">Terbit</div>
                    <h1 className="text-2xl font-semibold">{terbit}</h1>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-500">Subuh</div>
                    <h1 className="text-2xl font-semibold">{subuh}</h1>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-500">Dzuhur</div>
                    <h1 className="text-2xl font-semibold">{dzuhur}</h1>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-500">Ashar</div>
                    <h1 className="text-2xl font-semibold">{ashar}</h1>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-500">Maghrib</div>
                    <h1 className="text-2xl font-semibold">{maghrib}</h1>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-500">Isya</div>
                    <h1 className="text-2xl font-semibold">{isya}</h1>
                </div>
            </main>
        </div>
    );
}
