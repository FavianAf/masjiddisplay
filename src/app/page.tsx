'use client';

import { useEffect, useState } from 'react';
import Clock from '@/components/clock';
import SholatTime from '@/components/sholatTime';
import BlackoutScreen from '@/components/BlackoutScreen';
import Countdown from '@/components/Countdown';
import { getCurrentTime } from '@/lib/getCurrentTime';

export default function Home() {
    const [waktuSekarang, setWaktuSekarang] = useState(new Date());
    const [isCountdownActive, setIsCountdownActive] = useState(false);
    const [isBlackout, setIsBlackout] = useState(false);

    /* Waktu sholat*/
    const waktuSholat = new Date();
    waktuSholat.setHours(21, 11, 0, 0);


    // Update current time setiap detik
    useEffect(() => {
        const interval = setInterval(() => {
            const {hour, minute, second} = getCurrentTime();

            const CurrentTime = new Date();
            CurrentTime.setHours(Number(hour), Number(minute), Number(second), 0);
            setWaktuSekarang(CurrentTime);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Cek apakah sudah masuk waktu sholat
    useEffect(() => {
        if (
            !isCountdownActive &&
            !isBlackout &&
            waktuSholat.getHours() === waktuSekarang.getHours() &&
            waktuSholat.getMinutes() === waktuSekarang.getMinutes() &&
            waktuSholat.getSeconds() === waktuSekarang.getSeconds()
        ) {
            setIsCountdownActive(true);
        }
    }, [waktuSekarang]);

    // Hitung target iqomah (10 menit setelah waktu sholat)
    // const waktuIqomah = new Date(waktuSholat.getTime() + 10 * 60 * 1000);
    const waktuIqomah = new Date(waktuSholat.getTime() + 60 * 1000);

    let content;
    if (isBlackout) {
      content = <BlackoutScreen />;
    } else if (isCountdownActive) {
      content = (
        <Countdown
          targetTime={waktuIqomah}
          onFinish={() => {
            setIsCountdownActive(false);
            setIsBlackout(true);
            setTimeout(() => {
              setIsBlackout(false);
            }, 60 * 1000);
          }}
        />
      );
    } else {
      content = (
        <>
          <Clock />
          <SholatTime />
        </>
      );
    }

    return (
      <div>
        <main className="flex min-h-screen items-center justify-center bg-white p-4">
          {content}
        </main>
      </div>
  );
}
