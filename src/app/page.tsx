'use client';

import { useEffect, useState } from 'react';
import Clock from '@/components/clock';
import SholatTime from '@/components/sholatTime';
import BlackoutScreen from '@/components/BlackoutScreen';
import Countdown from '@/components/Countdown';
import Laporan from '@/components/Laporan';
import { getCurrentTime } from '@/lib/getCurrentTime';
import { motion, AnimatePresence } from 'framer-motion';
import { i } from 'framer-motion/client';

export default function Home() {
    const [waktuSekarang, setWaktuSekarang] = useState(new Date());
    const [waktuSholat, setWaktuSholat] = useState(new Date());
    const [jadwalArray, setJadwalArray] = useState<Date[]>([]);
    const [isWaktuSholatSama, setIsWaktuSholat] = useState(false);
    const [isCountdownActive, setIsCountdownActive] = useState(false);
    const [isBlackout, setIsBlackout] = useState(false);
    const [showPage, setShowPage] = useState(false);
    const menitKetikaSholat = 1; // Durasi blackout dalam menit
    const menitKetikaIqomah = 1; // Durasi Iqomah dalam menit

    /* 
      useEffect: Ambil data waktu sholat dari API, dipanggil ketika mounted dan setiap 5 jam
    */
    useEffect(() => {
      const fetchWaktuSholat = async () => {
        const res = await fetch("/api/sholat");
        const data = await res.json();
        const subuh = new Date();
        subuh.setHours(Number(data?.data?.jadwal?.subuh.split(':')[0]), Number(data?.data?.jadwal?.subuh.split(':')[1]), 0, 0);
        const dzuhur = new Date();
        dzuhur.setHours(Number(data?.data?.jadwal?.dzuhur.split(':')[0]), Number(data?.data?.jadwal?.dzuhur.split(':')[1]), 0, 0);
        const ashar = new Date();
        ashar.setHours(Number(data?.data?.jadwal?.ashar.split(':')[0]), Number(data?.data?.jadwal?.ashar.split(':')[1]), 0, 0);
        const maghrib = new Date();
        maghrib.setHours(Number(data?.data?.jadwal?.maghrib.split(':')[0]), Number(data?.data?.jadwal?.maghrib.split(':')[1]), 0, 0);
        const isya = new Date();
        isya.setHours(Number(data?.data?.jadwal?.isya.split(':')[0]), Number(data?.data?.jadwal?.isya.split(':')[1]), 0, 0);

        const arrayWaktuSholat = [subuh, dzuhur, ashar, maghrib, isya];
        // ====== TEST MODE (hapus/disable saat production) ======
        // const TEST_MODE = true;                 // set ke false saat sudah tidak tes
        // const TARGET = 0; // 0=subuh, 1=dzuhur, 2=ashar, 3=maghrib, 4=isya

        // if (TEST_MODE) {
        //   const soon = new Date();
        //   soon.setSeconds(soon.getSeconds() + 7); // tembak 7 detik lagi
        //   // NOTE: kalau logika kamu cocokkan detik==0, pakai:
        //   // const soon = new Date(Date.now() + 10_000); soon.setSeconds(0, 0);
        //   arrayWaktuSholat[TARGET] = soon;
        //   console.log("[TEST] Override jadwal:", arrayWaktuSholat[TARGET].toTimeString());
        // }
        // =======================================================
        console.log('Waktu Sholat:', arrayWaktuSholat);
        setJadwalArray(arrayWaktuSholat);
      }

      fetchWaktuSholat(); // Dipanggil pas awal (mounted pertama kali)
      
      const interval = setInterval(() => {
          fetchWaktuSholat(); 
      }, 5 * 60 * 60 * 1000); // fetch setiap 5 jam

      return () => clearInterval(interval);
    }, []);

    /*
      useEffect: Update current time setiap detik
    */
    useEffect(() => {
        const interval = setInterval(() => {
            const {hour, minute, second} = getCurrentTime();

            const CurrentTime = new Date();
            CurrentTime.setHours(Number(hour), Number(minute), Number(second), 0);
            setWaktuSekarang(CurrentTime);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    /* 
      useEffect: Ngecek var waktuSekarang ada di jadwalArray atau enggak, kembaliannya true/false
    */
    useEffect(() => {
      const matchWaktuSholat = jadwalArray.find((d: Date) =>
        d.getHours()   === waktuSekarang.getHours() &&
        d.getMinutes() === waktuSekarang.getMinutes() &&
        d.getSeconds() === waktuSekarang.getSeconds()
      );
      
      if (matchWaktuSholat) {
        setWaktuSholat(matchWaktuSholat);
        setIsWaktuSholat(true);
      }
    }, [waktuSekarang]);
    

    /*
      Cek apakah sudah masuk waktu sholat
    */
    useEffect(() => {
        if (
            !isCountdownActive &&
            !isBlackout &&
            isWaktuSholatSama
        ) {
            setIsCountdownActive(true);
        }
    }, [waktuSekarang]);

    /*
      Ganti halaman setiap sekian detik
    */
    useEffect(() => {
      const interval = setInterval(() => {
        setShowPage((prev) => !prev);
      }, 5 * 1000); // dalam detik
  
      return () => clearInterval(interval);
    }, []);

    const waktuIqomah = new Date(waktuSholat.getTime() + menitKetikaIqomah * 60 * 1000); // Durasi Iqomah dalam menit
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
        <AnimatePresence mode="wait">
          {showPage ? (
            <motion.div
              key="alt"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Laporan />
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <>
                <Clock />
                <SholatTime />
              </>
            </motion.div>
          )}
        </AnimatePresence>
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
