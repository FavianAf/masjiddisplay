'use client';

import { useEffect, useState } from 'react';
import Clock from '@/components/clock';
import SholatTime from '@/components/sholatTime';
import BlackoutScreen from '@/components/BlackoutScreen';
import Countdown from '@/components/Countdown';
import { getCurrentTime } from '@/lib/getCurrentTime';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
    const [waktuSekarang, setWaktuSekarang] = useState(new Date());
    const [isCountdownActive, setIsCountdownActive] = useState(false);
    const [isBlackout, setIsBlackout] = useState(false);
    const [showPage, setShowPage] = useState(false);
    let menitKetikaSholat = 8;

    /* Waktu sholat*/
    const waktuSholat = new Date();
    waktuSholat.setHours(14, 10, 0, 0);


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

    // Toggle halaman setiap 10 detik
    useEffect(() => {
      const interval = setInterval(() => {
        setShowPage((prev) => !prev);
      }, 10 * 1000); // 10 detik
  
      return () => clearInterval(interval);
    }, []);

    // Hitung target iqomah (10 menit setelah waktu sholat)
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
            }, menitKetikaSholat * 60 * 1000); // Durasi blackout dalam menit
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
          <AnimatePresence mode="wait">
            {showPage ? (
              <motion.div
                key="alt"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl font-bold">Test</h1>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {content}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
  );
}
