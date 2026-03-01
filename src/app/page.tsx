'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Clock from '@/components/clock';
import SholatTime from '@/components/sholatTime';
import Laporan from '@/components/Laporan';
import Ticker from '@/components/Ticker';
import MediaCarousel from '@/components/MediaCarousel';
import { motion, AnimatePresence } from 'framer-motion';
import { authStorage } from '@/lib/storage';
import { MapPin, Quote, Clock as ClockIcon } from 'lucide-react';
import { Media } from '@/types/media';
import { isTimeInRange, getCurrentTimeInHHMMSS, parseDateTimeToHHMMSS } from '@/lib/mediaUtils';

interface SholatData {
  responseCode: string;
  responseData: {
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

interface MasjidSettings {
  masjid_id: string;
  city_name: string;
  medias: Media[];
  iqomah_subuh: number;
  iqomah_dzuhur: number;
  iqomah_ashar: number;
  iqomah_maghrib: number;
  iqomah_isya: number;
  blackout_duration_minutes: number;
  slide_duration_kegiatan_seconds?: number;
}

const hadith1 = `Barangsiapa yang shalat subuh berjamaah maka ia berada dalam jaminan Allah. (HR. Muslim)`;
const hadith2 = `Shalat berjamaah lebih utama 27 derajat dibanding shalat sendirian. (HR. Bukhari & Muslim)`;
const hadith3 = `Sebaik-baik manusia adalah yang paling bermanfaat bagi orang lain. (HR. Ahmad)`;
const hadith4 = `Senyummu di hadapan saudaramu adalah sedekah. (HR. Tirmidzi)`;

const HADITHS = [hadith1, hadith2, hadith3, hadith4];

export default function Home() {
  const router = useRouter();
  const [waktuSekarang, setWaktuSekarang] = useState(new Date());
  const [jadwalArray, setJadwalArray] = useState<Date[]>([]);
  const [iqomahDurations, setIqomahDurations] = useState<Record<string, number>>({
    imsak: 0,
    subuh: 15,
    terbit: 0,
    dzuhur: 10,
    ashar: 10,
    maghrib: 5,
    isya: 10,
  });
  const [blackoutDurationMinutes, setBlackoutDurationMinutes] = useState(30);
  const [isWaktuSholatSama, setIsWaktuSholatSama] = useState(false);
  const [isBlackout, setIsBlackout] = useState(false);
  const [currentSholatName, setCurrentSholatName] = useState<string>('');
  const [isIqomahDone, setIsIqomahDone] = useState(false);
  const [hadithIndex, setHadithIndex] = useState(0);
  const [contentIndex, setContentIndex] = useState(0);
  const [masjidName, setMasjidName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [waktuSholat, setWaktuSholat] = useState(new Date());
  const [slideKegiatanSeconds, setSlideKegiatanSeconds] = useState(10);
  const [medias, setMedias] = useState<Media[]>([]);
  const [activeMedias, setActiveMedias] = useState<Media[]>([]);

  const fetchSettings = async () => {
    try {
      const token = await authStorage.getToken();
      if (!token) return;

      const apiUrl = process.env.API_BASE_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/api/masjid/settings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      if (data.responseData) {
        const settings: MasjidSettings = data.responseData;

        // Parse waktu format ISO 8601 ke HH:mm:ss sebelum disimpan ke state
        const mediasWithParsedTime = (settings.medias || []).map(media => ({
          ...media,
          start_time: parseDateTimeToHHMMSS(media.start_time || '00:00:00'),
          end_time: parseDateTimeToHHMMSS(media.end_time || '23:59:59'),
        }));

        setIqomahDurations({
          imsak: 0,
          subuh: settings.iqomah_subuh,
          terbit: 0,
          dzuhur: settings.iqomah_dzuhur,
          ashar: settings.iqomah_ashar,
          maghrib: settings.iqomah_maghrib,
          isya: settings.iqomah_isya,
        });
        setBlackoutDurationMinutes(settings.blackout_duration_minutes);
        setSlideKegiatanSeconds(settings.slide_duration_kegiatan_seconds || 10);
        setMedias(mediasWithParsedTime);
        setMasjidName('MASJID AL-MUTHMAINNAH');
        setLocation('Jl. Raya No. 123, Jakarta');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  useEffect(() => {
    const fetchWaktuSholat = async () => {
      const masjid_id = await authStorage.getMasjidId();
      if (!masjid_id) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`/api/sholat?masjid_id=${masjid_id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Gagal mengambil data");

        const data: SholatData = await res.json();
        const j = data.responseData?.jadwal;

        if (j) {
          const imsak = new Date();
          imsak.setHours(Number(j.imsak.split(':')[0]), Number(j.imsak.split(':')[1]), 0, 0);
          const subuh = new Date();
          subuh.setHours(Number(j.subuh.split(':')[0]), Number(j.subuh.split(':')[1]), 0, 0);
          const terbit = new Date();
          terbit.setHours(Number(j.terbit.split(':')[0]), Number(j.terbit.split(':')[1]), 0, 0);
          const dzuhur = new Date();
          dzuhur.setHours(Number(j.dzuhur.split(':')[0]), Number(j.dzuhur.split(':')[1]), 0, 0);
          const ashar = new Date();
          ashar.setHours(Number(j.ashar.split(':')[0]), Number(j.ashar.split(':')[1]), 0, 0);
          const maghrib = new Date();
          maghrib.setHours(Number(j.maghrib.split(':')[0]), Number(j.maghrib.split(':')[1]), 0, 0);
          const isya = new Date();
          isya.setHours(Number(j.isya.split(':')[0]), Number(j.isya.split(':')[1]), 0, 0);

          const arrayWaktuSholat = [imsak, subuh, terbit, dzuhur, ashar, maghrib, isya];
          setJadwalArray(arrayWaktuSholat);
        }

        if (data.responseData?.blackout_duration_minutes) {
          setBlackoutDurationMinutes(data.responseData.blackout_duration_minutes);
        }
      } catch (error) {
        console.error('Error fetching prayer times:', error);
      }
    };

    fetchSettings();
    fetchWaktuSholat();

    const interval = setInterval(() => {
      fetchWaktuSholat();
    }, 5 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setWaktuSekarang(now);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const sholatNames = ['imsak', 'subuh', 'terbit', 'dzuhur', 'ashar', 'maghrib', 'isya'];
    const matchWaktuSholat = jadwalArray.find((d: Date) =>
      d.getHours() === waktuSekarang.getHours() &&
      d.getMinutes() === waktuSekarang.getMinutes() &&
      d.getSeconds() === waktuSekarang.getSeconds()
    );

    if (matchWaktuSholat) {
      setWaktuSholat(matchWaktuSholat);
      setIsWaktuSholatSama(true);
      const index = jadwalArray.indexOf(matchWaktuSholat);
      setCurrentSholatName(sholatNames[index]);
    } else {
      setIsWaktuSholatSama(false);
      setCurrentSholatName('');
    }
  }, [waktuSekarang, jadwalArray]);

  useEffect(() => {
    const currentTime = getCurrentTimeInHHMMSS();
    const active = medias.filter(m =>
      m.is_active && isTimeInRange(currentTime, m.start_time, m.end_time)
    );
    setActiveMedias(active);
    setContentIndex(0);
  }, [medias, waktuSekarang]);

  useEffect(() => {
    const totalSlides = activeMedias.length + 1;
    
    const timer = setTimeout(() => {
      setContentIndex(prev => (prev + 1) % totalSlides);
    }, slideKegiatanSeconds * 1000);
    
    return () => clearTimeout(timer);
  }, [contentIndex, activeMedias.length, slideKegiatanSeconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      setHadithIndex((prev) => (prev + 1) % HADITHS.length);
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  const currentIqomahMinutes = currentSholatName ? iqomahDurations[currentSholatName] || 10 : 10;
  const waktuIqomah = useMemo(() => new Date(waktuSholat.getTime() + currentIqomahMinutes * 60 * 1000), [waktuSholat, currentIqomahMinutes]);

  useEffect(() => {
    if (
      !isBlackout &&
      isWaktuSholatSama &&
      !isIqomahDone &&
      currentIqomahMinutes > 0
    ) {
      const timeDiff = (waktuIqomah.getTime() - waktuSekarang.getTime()) / 1000;
      if (timeDiff <= 0) {
        setIsIqomahDone(true);
        setIsBlackout(true);
        setTimeout(() => {
          setIsBlackout(false);
          setIsIqomahDone(false);
        }, blackoutDurationMinutes * 60 * 1000);
      }
    }
  }, [waktuSekarang, isWaktuSholatSama, isBlackout, isIqomahDone, waktuIqomah, currentIqomahMinutes, blackoutDurationMinutes]);

  const handleFinancialComplete = () => {
    setContentIndex(0);
  };

  const { nextPrayer, countdown, activePrayerName: memoActivePrayerName } = (() => {
    const sholatNames = ['imsak', 'subuh', 'terbit', 'dzuhur', 'ashar', 'maghrib', 'isya'];
    let next = sholatNames[0];
    let activeName = '';

    const jadwalTimes = jadwalArray;

    if (jadwalTimes.length === 7) {
      for (let i = 0; i < jadwalTimes.length; i++) {
        const pTime = jadwalTimes[i];
        const nextPTime = jadwalTimes[(i + 1) % jadwalTimes.length];

        if (waktuSekarang >= pTime && waktuSekarang < nextPTime) {
          activeName = sholatNames[i];
          next = sholatNames[(i + 1) % jadwalTimes.length];
          break;
        }
      }

      if (!activeName) {
        const lastTime = jadwalTimes[jadwalTimes.length - 1];
        const firstTime = jadwalTimes[0];
        if (waktuSekarang >= lastTime || waktuSekarang < firstTime) {
          activeName = 'isya';
          next = 'imsak';
        }
      }
    }

    let targetTime = null;

    if (isWaktuSholatSama && !isIqomahDone) {
      targetTime = waktuIqomah;
    } else {
      const nextIndex = sholatNames.indexOf(next);
      const nextTime = jadwalTimes[nextIndex];
      if (nextTime) {
        targetTime = nextTime < waktuSekarang
          ? new Date(nextTime.getTime() + 24 * 60 * 60 * 1000)
          : nextTime;
      }
    }

    let countdownStr = '--:--:--';
    if (targetTime) {
      const diff = Math.floor((targetTime.getTime() - waktuSekarang.getTime()) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      countdownStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    return {
      nextPrayer: next.toUpperCase(),
      countdown: countdownStr,
      activePrayerName: activeName
    };
  })();

  const renderContent = () => {
    if (activeMedias.length === 0) {
      return (
        <div className="absolute inset-0 w-full h-full">
          <Laporan onComplete={handleFinancialComplete} />
        </div>
      );
    }

    if (contentIndex < activeMedias.length) {
      return (
        <MediaCarousel
          medias={activeMedias}
          currentIndex={contentIndex}
        />
      );
    }

    return (
      <div className="absolute inset-0 w-full h-full">
        <Laporan onComplete={handleFinancialComplete} />
      </div>
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-mosque-dark text-white overflow-hidden p-6 gap-6">

      {/* Top Section: Sidebar + Main Content */}
      <div className="flex-1 flex gap-8 min-h-0">

        {/* Sidebar */}
        <div className="w-1/4 flex flex-col">
          {/* Mosque Info */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">{masjidName}</h1>
            <div className="flex items-center justify-center gap-2 text-white/60 mt-2">
              <MapPin size={14} />
              <span className="text-sm">{location}</span>
            </div>
          </div>

          {/* Clock */}
          <Clock />

          {/* Countdown Card */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8">
            <div className="flex items-center gap-2 mb-3 text-white/40">
              <ClockIcon size={16} />
              <span className="text-xs font-bold tracking-widest uppercase">
                {isWaktuSholatSama && !isIqomahDone ? 'IQOMAH' : nextPrayer} DALAM
              </span>
            </div>
            <div className="text-4xl font-bold font-mono tracking-tight text-center">
              {countdown}
            </div>
          </div>

          {/* Hadith Section */}
          <div className="mt-auto bg-white/5 p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-3 text-white/40">
              <Quote size={16} />
              <span className="text-xs font-bold tracking-widest uppercase">Hadits Hari Ini</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={hadithIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg italic font-medium leading-relaxed text-white/90"
              >
                &ldquo;{HADITHS[hadithIndex]}&rdquo;
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

         {/* Main Content Area */}
         <div className="flex-1 flex flex-col gap-6 min-h-0">
           {/* Image/Video Section or Financial Report */}
           <div className="flex-1 relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-mosque-dark">
             {renderContent()}
           </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 -mt-2">
            {[...activeMedias, { id: 'laporan', media_type: 'laporan' as const }].map((item, idx) => (
              <motion.div
                key={item.id || 'laporan'}
                className={`h-2 rounded-full ${contentIndex === idx ? 'bg-white w-8' : 'bg-white/20 w-2'}`}
                animate={{
                  width: contentIndex === idx ? 32 : 8,
                  backgroundColor: contentIndex === idx ? "rgba(255,255,255, 1)" : "rgba(255,255,255, 0.2)"
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>

          {/* Prayer Times Grid */}
          <SholatTime activePrayerName={memoActivePrayerName} />
        </div>
      </div>

      {/* Footer: Ticker */}
      <Ticker />

    </div>
  );
}
