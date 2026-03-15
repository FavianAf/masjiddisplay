'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Clock from '@/components/clock';
import SholatTime from '@/components/sholatTime';
import Laporan from '@/components/Laporan';
import Ticker from '@/components/Ticker';
import MediaCarousel from '@/components/MediaCarousel';
import BlackoutScreen from '@/components/BlackoutScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { authStorage } from '@/lib/storage';
import { MapPin, Quote, Clock as ClockIcon } from 'lucide-react';
import { Media } from '@/types/media';
import { Hadist } from '@/types/hadist';
import { FinancialReport, FinancialSummary } from '@/types/laporan';
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
  city_id: string;
  city_name: string;
  medias: Media[];
  hadists: Hadist[];
  financial_reports: FinancialReport[];
  financial_summary: FinancialSummary;
  iqomah_subuh: number;
  iqomah_dzuhur: number;
  iqomah_ashar: number;
  iqomah_maghrib: number;
  iqomah_isya: number;
  blackout_duration_minutes: number;
  slide_duration_kegiatan_seconds?: number;
}

const FALLBACK_HADITHS: Hadist[] = [
  {
    id: 'fallback-1',
    text: 'Barangsiapa yang shalat subuh berjamaah maka ia berada dalam jaminan Allah.',
    source: 'HR. Muslim',
    is_active: true
  },
  {
    id: 'fallback-2',
    text: 'Shalat berjamaah lebih utama 27 derajat dibanding shalat sendirian.',
    source: 'HR. Bukhari & Muslim',
    is_active: true
  },
  {
    id: 'fallback-3',
    text: 'Sebaik-baik manusia adalah yang paling bermanfaat bagi orang lain.',
    source: 'HR. Ahmad',
    is_active: true
  },
  {
    id: 'fallback-4',
    text: 'Senyummu di hadapan saudaramu adalah sedekah.',
    source: 'HR. Tirmidzi',
    is_active: true
  }
];

export default function Home() {
  const router = useRouter();
  const [waktuSekarang, setWaktuSekarang] = useState(new Date());
  const [jadwalArray, setJadwalArray] = useState<Date[]>([]);
  const [iqomahArray, setIqomahArray] = useState<Date[]>([]);
  const [blackoutDurationMinutes, setBlackoutDurationMinutes] = useState(30);
  const [sholatStatus, setSholatStatus] = useState<'NORMAL' | 'PRAYER_TIME' | 'IQOMAH' | 'BLACKOUT'>('NORMAL');
  const [currentSholatName, setCurrentSholatName] = useState<string>('');
  const [hadithIndex, setHadithIndex] = useState(0);
  const [contentIndex, setContentIndex] = useState(0);
  const [masjidName, setMasjidName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [slideKegiatanSeconds, setSlideKegiatanSeconds] = useState(10);
  const [medias, setMedias] = useState<Media[]>([]);
  const [activeMedias, setActiveMedias] = useState<Media[]>([]);
  const [hadists, setHadists] = useState<Hadist[]>(FALLBACK_HADITHS);
  const [activeHadists, setActiveHadists] = useState<Hadist[]>(FALLBACK_HADITHS);
  const [financialReports, setFinancialReports] = useState<FinancialReport[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    account_balance: 0,
    monthly_expense: 0,
    last_updated: new Date().toISOString()
  });

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

        // Parse hadists dan filter active ones
        const fetchedHadists = (settings.hadists || []).filter(h => h.is_active);

        // Parse financial reports dan filter active ones
        const fetchedReports = (settings.financial_reports || []).filter(r => r.is_active);

        // Get financial summary dengan fallback
        const fetchedSummary = settings.financial_summary || {
          account_balance: 0,
          monthly_expense: 0,
          last_updated: new Date().toISOString()
        };

        // Gunakan fallback jika tidak ada hadists dari API
        // Ambil 1 dari fallback jika hanya ada 1 hadist dari API (minimum 2 hadits)
        let finalHadists: Hadist[];
        if (fetchedHadists.length === 0) {
          finalHadists = FALLBACK_HADITHS;
        } else if (fetchedHadists.length === 1) {
          finalHadists = [...fetchedHadists, FALLBACK_HADITHS[0]];
        } else {
          finalHadists = fetchedHadists;
        }

        setBlackoutDurationMinutes(settings.blackout_duration_minutes);
        setSlideKegiatanSeconds(settings.slide_duration_kegiatan_seconds || 10);
        setMedias(mediasWithParsedTime);
        setHadists(finalHadists);
        setActiveHadists(finalHadists);
        setFinancialReports(fetchedReports);
        setFinancialSummary(fetchedSummary);
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
        const iq = data.responseData?.iqomah;

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

        if (iq) {
          const iqomahImsak = new Date();
          iqomahImsak.setHours(0, 0, 0, 0);
          
          const iqomahSubuh = new Date();
          iqomahSubuh.setHours(Number(iq.subuh?.split(':')[0] || 0), Number(iq.subuh?.split(':')[1] || 0), 0, 0);
          
          const iqomahTerbit = new Date();
          iqomahTerbit.setHours(0, 0, 0, 0);
          
          const iqomahDzuhur = new Date();
          iqomahDzuhur.setHours(Number(iq.dzuhur?.split(':')[0] || 0), Number(iq.dzuhur?.split(':')[1] || 0), 0, 0);
          
          const iqomahAshar = new Date();
          iqomahAshar.setHours(Number(iq.ashar?.split(':')[0] || 0), Number(iq.ashar?.split(':')[1] || 0), 0, 0);
          
          const iqomahMaghrib = new Date();
          iqomahMaghrib.setHours(Number(iq.maghrib?.split(':')[0] || 0), Number(iq.maghrib?.split(':')[1] || 0), 0, 0);
          
          const iqomahIsya = new Date();
          iqomahIsya.setHours(Number(iq.isya?.split(':')[0] || 0), Number(iq.isya?.split(':')[1] || 0), 0, 0);

          const arrayIqomah = [iqomahImsak, iqomahSubuh, iqomahTerbit, iqomahDzuhur, iqomahAshar, iqomahMaghrib, iqomahIsya];
          setIqomahArray(arrayIqomah);
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

    if (jadwalArray.length !== 7 || iqomahArray.length !== 7) return;

    let newStatus: 'NORMAL' | 'PRAYER_TIME' | 'IQOMAH' | 'BLACKOUT' = 'NORMAL';
    let activeSholat = '';

    for (let i = 0; i < jadwalArray.length; i++) {
      const prayerTime = jadwalArray[i];
      const iqomahTime = iqomahArray[i];

      if (waktuSekarang.getTime() === prayerTime.getTime()) {
        newStatus = 'PRAYER_TIME';
        activeSholat = sholatNames[i];
        break;
      }

      if (waktuSekarang.getTime() > prayerTime.getTime() && waktuSekarang.getTime() < iqomahTime.getTime()) {
        newStatus = 'IQOMAH';
        activeSholat = sholatNames[i];
        break;
      }

      if (waktuSekarang.getTime() >= iqomahTime.getTime()) {
        const blackoutEnd = new Date(iqomahTime.getTime() + blackoutDurationMinutes * 60 * 1000);

        if (waktuSekarang.getTime() < blackoutEnd.getTime()) {
          newStatus = 'BLACKOUT';
          activeSholat = sholatNames[i];
          break;
        }
      }
    }

    setSholatStatus(newStatus);
    if (activeSholat !== currentSholatName) {
      setCurrentSholatName(activeSholat);
    }
  }, [waktuSekarang, jadwalArray, iqomahArray, blackoutDurationMinutes, currentSholatName]);

  useEffect(() => {
    const currentTime = getCurrentTimeInHHMMSS();
    const active = medias.filter(m =>
      m.is_active && isTimeInRange(currentTime, m.start_time, m.end_time)
    );
    
    setActiveMedias(prev => {
      const prevIds = prev.map(m => m.id).join(',');
      const newIds = active.map(m => m.id).join(',');
      
      if (prevIds !== newIds) {
        setContentIndex(0);
      }
      
      return active;
    });
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
      setHadithIndex((prev) => (prev + 1) % activeHadists.length);
    }, 30000);

    return () => clearInterval(timer);
  }, [activeHadists.length]);

  const handleFinancialComplete = () => {
    setContentIndex(0);
  };

  const { countdown, label, activePrayerName: memoActivePrayerName } = (() => {
    const sholatNames = ['imsak', 'subuh', 'terbit', 'dzuhur', 'ashar', 'maghrib', 'isya'];
    let targetTime: Date | null = null;
    let displayLabel = '';
    let nextPrayerName = sholatNames[0];
    let activeName = '';

    for (let i = 0; i < jadwalArray.length; i++) {
      const pTime = jadwalArray[i];
      const nextPTime = jadwalArray[(i + 1) % jadwalArray.length];

      if (waktuSekarang >= pTime && waktuSekarang < nextPTime) {
        activeName = sholatNames[i];
        nextPrayerName = sholatNames[(i + 1) % jadwalArray.length];
        break;
      }
    }

    if (!activeName && jadwalArray.length === 7) {
      const lastTime = jadwalArray[jadwalArray.length - 1];
      const firstTime = jadwalArray[0];
      if (waktuSekarang >= lastTime || waktuSekarang < firstTime) {
        activeName = 'isya';
        nextPrayerName = 'imsak';
      }
    }

    if (sholatStatus === 'IQOMAH' && currentSholatName) {
      const index = sholatNames.indexOf(currentSholatName);
      targetTime = iqomahArray[index];
      displayLabel = `IQOMAH ${currentSholatName.toUpperCase()}`;
    } else if (sholatStatus === 'NORMAL' || sholatStatus === 'PRAYER_TIME') {
      for (let i = 0; i < jadwalArray.length; i++) {
        if (waktuSekarang < jadwalArray[i]) {
          targetTime = jadwalArray[i];
          nextPrayerName = sholatNames[i];
          break;
        }
      }
      displayLabel = nextPrayerName ? nextPrayerName.toUpperCase() : '';
    }

    let countdownStr = '--:--:--';
    if (targetTime) {
      const diff = Math.floor((targetTime.getTime() - waktuSekarang.getTime()) / 1000);
      if (diff >= 0) {
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        countdownStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
    }

    return {
      countdown: countdownStr,
      label: displayLabel,
      activePrayerName: activeName
    };
  })();

  const renderContent = () => {
    const hasNoMedia = activeMedias.length === 0;
    const hasNoReports = financialReports.length === 0;

    if (hasNoMedia && hasNoReports) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-mosque-dark">
          <img 
            src="/Kaabah.jpg" 
            alt="Kaabah" 
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    if (hasNoMedia && !hasNoReports) {
      return <Laporan reports={financialReports} summary={financialSummary} onComplete={handleFinancialComplete} />;
    }

    if (!hasNoMedia && contentIndex < activeMedias.length) {
      return (
        <MediaCarousel
          medias={activeMedias}
          currentIndex={contentIndex}
        />
      );
    }

    if (!hasNoReports) {
      return <Laporan reports={financialReports} summary={financialSummary} onComplete={handleFinancialComplete} />;
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-mosque-dark">
        <img 
          src="/Kaabah.jpg" 
          alt="Kaabah" 
          className="w-full h-full object-cover"
        />
      </div>
    );
  };

  return (
    <>
      {sholatStatus === 'BLACKOUT' && <BlackoutScreen />}

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
          {sholatStatus !== 'BLACKOUT' && label && (
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8">
              <div className="flex items-center gap-2 mb-3 text-white/40">
                <ClockIcon size={16} />
                <span className="text-xs font-bold tracking-widest uppercase">
                  {label} DALAM
                </span>
              </div>
              <div className="text-4xl font-bold font-mono tracking-tight text-center">
                {countdown}
              </div>
            </div>
          )}

          {/* Hadith Section */}
          <div className="mt-auto bg-white/5 p-6 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-3 text-white/40">
              <Quote size={16} />
              <span className="text-xs font-bold tracking-widest uppercase">Hadits Hari Ini</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeHadists[hadithIndex]?.id || 'fallback'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg italic font-medium leading-relaxed"
              >
                <p className="text-white/90">
                  &ldquo;{activeHadists[hadithIndex]?.text}&rdquo;
                </p>
                {activeHadists[hadithIndex]?.source && (
                  <p className="text-sm text-white/50 mt-2 not-italic font-normal">
                    {activeHadists[hadithIndex].source}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-6 min-h-0">
            {/* Image/Video Section or Financial Report */}
            <div className="flex-1 relative rounded-3xl overflow-hidden shadow-2xl bg-mosque-dark">
              {renderContent()}
            </div>

          {/* Pagination Dots - Hanya tampilkan jika ada media atau ada laporan */}
          {(activeMedias.length > 0 || financialReports.length > 0) && (
            <div className="flex justify-center gap-2 -mt-2">
              {[...activeMedias, { id: 'laporan', media_type: 'laporan' as const }].map((item, idx) => (
                <motion.div
                  key={item.id || 'laporan'}
                  className={`h-2 rounded-full ${contentIndex === idx ? 'bg-white w-8' : 'bg-white/20 w-2'}`}
                  animate={{
                    width: contentIndex === idx ? 32 : 8,
                    backgroundColor: contentIndex === idx ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.2)"
                  }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          )}

          {/* Prayer Times Grid */}
          <SholatTime activePrayerName={memoActivePrayerName} />
        </div>
      </div>

      {/* Footer: Ticker */}
      <Ticker />

    </div>
    </>
  );
}
