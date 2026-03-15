'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authStorage } from '@/lib/storage';
import { Media, MediaLimits } from '@/types/media';
import { Hadist } from '@/types/hadist';
import { FinancialReport, FinancialSummary } from '@/types/laporan';
import { getMediaCountByType, generateYoutubeMediaName, validateTimeFormat } from '@/lib/mediaUtils';
import MediaModal from '@/components/media/MediaModal';
import MediaList from '@/components/media/MediaList';
import DeleteConfirmModal from '@/components/media/DeleteConfirmModal';
import HadistModal from '@/components/hadist/HadistModal';
import HadistList from '@/components/hadist/HadistList';
import DeleteHadistConfirmModal from '@/components/hadist/DeleteHadistConfirmModal';
import LaporanModal from '@/components/laporan/LaporanModal';
import LaporanList from '@/components/laporan/LaporanList';
import DeleteLaporanConfirmModal from '@/components/laporan/DeleteLaporanConfirmModal';
import LaporanSummaryEditor from '@/components/laporan/LaporanSummaryEditor';

interface Settings {
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

const defaultSettings: Settings = {
  masjid_id: '',
  city_id: '',
  city_name: '',
  medias: [],
  hadists: [],
  financial_reports: [],
  financial_summary: {
    account_balance: 0,
    monthly_expense: 0,
    last_updated: new Date().toISOString()
  },
  iqomah_subuh: 15,
  iqomah_dzuhur: 10,
  iqomah_ashar: 10,
  iqomah_maghrib: 5,
  iqomah_isya: 10,
  blackout_duration_minutes: 30,
  slide_duration_kegiatan_seconds: 10,
};

const limits: MediaLimits = {
  url: 10,
  youtube: 10,
  file: 4,
};

const HADIST_LIMIT = 20;
const LAPORAN_LIMIT = 30;

export default function PengaturanPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [editingMedia, setEditingMedia] = useState<{ media: Media; index: number } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ index: number; name: string } | null>(null);
  const [showHadistModal, setShowHadistModal] = useState(false);
  const [editingHadist, setEditingHadist] = useState<{ hadist: Hadist; index: number } | null>(null);
  const [showHadistDeleteConfirm, setShowHadistDeleteConfirm] = useState<{ index: number; text: string } | null>(null);
  const [showLaporanModal, setShowLaporanModal] = useState(false);
  const [editingLaporan, setEditingLaporan] = useState<{ report: FinancialReport; index: number } | null>(null);
  const [showLaporanDeleteConfirm, setShowLaporanDeleteConfirm] = useState<{ index: number; note: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    uploading: false,
    current: 0,
    total: 0,
    message: '',
    results: [] as Array<{ fileName: string; success: boolean; error?: string }>,
  });

  useEffect(() => {
    const checkToken = async () => {
      const token = await authStorage.getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      fetchSettings(token);
    };

    checkToken();
  }, [router]);

  const fetchSettings = async (token: string) => {
    try {
      const apiUrl = process.env.API_BASE_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/api/masjid/settings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok && data.responseData) {
        setSettings({
          ...defaultSettings,
          ...data.responseData,
          medias: data.responseData.medias || [],
          hadists: data.responseData.hadists || [],
          financial_reports: data.responseData.financial_reports || [],
          financial_summary: data.responseData.financial_summary || defaultSettings.financial_summary,
        });
        if (data.responseData.masjid_id) {
          await authStorage.setMasjidId(data.responseData.masjid_id);
        }
      } else {
        setError('Gagal mengambil data pengaturan');
      }
    } catch {
      setError('Terjadi kesalahan saat mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const uploadAllFilesParalel = async (files: File[]): Promise<Array<{ fileName: string; url: string; success: boolean; error?: string }>> => {
    if (files.length === 0) return [];
    
    const token = await authStorage.getToken();
    const apiUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('city_name', settings.city_name);
      formData.append('masjid_media_type', 'file');
      formData.append('iqomah_subuh', settings.iqomah_subuh.toString());
      formData.append('iqomah_dzuhur', settings.iqomah_dzuhur.toString());
      formData.append('iqomah_ashar', settings.iqomah_ashar.toString());
      formData.append('iqomah_maghrib', settings.iqomah_maghrib.toString());
      formData.append('iqomah_isya', settings.iqomah_isya.toString());
      formData.append('blackout_duration_minutes', settings.blackout_duration_minutes.toString());
      formData.append('slide_duration_kegiatan_seconds', (settings.slide_duration_kegiatan_seconds || 10).toString());
      formData.append('masjid_media_file', file);
      
      try {
        const res = await fetch(`${apiUrl}/api/masjid/settings`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.responseMessage || 'Upload failed');
        
        return {
          fileName: file.name,
          url: data.responseData.medias[0].media_value,
          success: true,
        };
      } catch (err) {
        return {
          fileName: file.name,
          url: '',
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
      }
    });
    
    return Promise.all(uploadPromises);
  };

  const prepareAllMedias = (uploadResults: Array<{ url: string; success: boolean }>): Media[] => {
    const allMedias: Media[] = [];
    let uploadIndex = 0;
    
    settings.medias.forEach((media) => {
      if (media.media_type === 'file' && media.file) {
        if (uploadResults[uploadIndex] && uploadResults[uploadIndex].success) {
          allMedias.push({
            ...media,
            media_value: uploadResults[uploadIndex].url,
            file: undefined,
          });
        }
        uploadIndex++;
      } else {
        allMedias.push(media);
      }
    });
    
    return allMedias;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    
    const token = await authStorage.getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const apiUrl = process.env.API_BASE_URL || 'http://localhost:3000';

      // Validate hadists limit
      if (settings.hadists.length > HADIST_LIMIT) {
        throw new Error(`Maksimal ${HADIST_LIMIT} hadist/quran. Saat ini: ${settings.hadists.length}`);
      }

      // Validate financial reports limit
      if (settings.financial_reports.length > LAPORAN_LIMIT) {
        throw new Error(`Maksimal ${LAPORAN_LIMIT} laporan keuangan. Saat ini: ${settings.financial_reports.length}`);
      }

      // Validate duration values (semua harus > 0)
      const durationValidation = [
        { name: 'Durasi Iqomah Subuh', value: settings.iqomah_subuh, min: 1, max: 60 },
        { name: 'Durasi Iqomah Dzuhur', value: settings.iqomah_dzuhur, min: 1, max: 60 },
        { name: 'Durasi Iqomah Ashar', value: settings.iqomah_ashar, min: 1, max: 60 },
        { name: 'Durasi Iqomah Maghrib', value: settings.iqomah_maghrib, min: 1, max: 60 },
        { name: 'Durasi Iqomah Isya', value: settings.iqomah_isya, min: 1, max: 60 },
        { name: 'Durasi Blackout', value: settings.blackout_duration_minutes, min: 1, max: 120 },
        { name: 'Durasi Slide', value: settings.slide_duration_kegiatan_seconds || 10, min: 1, max: 300 },
      ];

      for (const field of durationValidation) {
        if (!field.value || field.value < field.min || field.value > field.max) {
          throw new Error(`${field.name} harus antara ${field.min} sampai ${field.max}`);
        }
      }

      // Validate all medias time format before save
      for (const [idx, media] of settings.medias.entries()) {
        const startValidation = validateTimeFormat(media.start_time, 'Waktu mulai');
        if (!startValidation.valid) {
          throw new Error(`Media ${idx + 1}: ${startValidation.error}`);
        }

        const endValidation = validateTimeFormat(media.end_time, 'Waktu selesai');
        if (!endValidation.valid) {
          throw new Error(`Media ${idx + 1}: ${endValidation.error}`);
        }
      }

      const fileMedia = settings.medias.filter(m => m.media_type === 'file' && m.file);
      
      if (fileMedia.length > 0) {
        setUploadProgress({
          uploading: true,
          current: 0,
          total: fileMedia.length + settings.medias.length,
          message: 'Sedang upload files...',
          results: [],
        });
        
        const uploadResults = await uploadAllFilesParalel(fileMedia.map(m => m.file!));
        
        setUploadProgress(prev => ({
          ...prev,
          current: fileMedia.length,
          message: 'Menyimpan pengaturan...',
          results: uploadResults,
        }));
        
        const failedUploads = uploadResults.filter(r => !r.success);
        if (failedUploads.length > 0) {
          const failedNames = failedUploads.map(f => f.fileName).join(', ');
          setError(`File berikut gagal diupload: ${failedNames}`);
        }
        
        const allMedias = prepareAllMedias(uploadResults);
        
        const payload = {
          city_id: settings.city_id,
          city_name: settings.city_name,
          medias: allMedias.map(m => ({
            id: m.id,
            media_type: m.media_type,
            media_value: m.media_value,
            media_name: m.media_name,
            is_active: m.is_active,
            start_time: m.start_time,
            end_time: m.end_time,
          })),
          hadists: settings.hadists.map(h => ({
            id: h.id,
            text: h.text,
            source: h.source,
            is_active: h.is_active,
          })),
          financial_reports: settings.financial_reports.map(r => ({
            id: r.id,
            date: r.date,
            income: r.income,
            expense: r.expense,
            note: r.note,
            is_active: r.is_active,
          })),
          financial_summary: {
            account_balance: settings.financial_summary.account_balance,
            monthly_expense: settings.financial_summary.monthly_expense,
          },
          iqomah_subuh: settings.iqomah_subuh || 15,
          iqomah_dzuhur: settings.iqomah_dzuhur || 10,
          iqomah_ashar: settings.iqomah_ashar || 10,
          iqomah_maghrib: settings.iqomah_maghrib || 5,
          iqomah_isya: settings.iqomah_isya || 10,
          blackout_duration_minutes: settings.blackout_duration_minutes || 30,
          slide_duration_kegiatan_seconds: settings.slide_duration_kegiatan_seconds || 10,
        };

        console.log('=== DEBUG PAYLOAD (FILE + OTHERS) ===');
        console.log('All medias:', allMedias);
        allMedias.forEach((m, idx) => {
          console.log(`Media ${idx}:`, {
            media_type: m.media_type,
            media_value: m.media_value,
            media_name: m.media_name,
            is_active: m.is_active,
            start_time: m.start_time,
            end_time: m.end_time,
            type_start_time: typeof m.start_time,
            type_end_time: typeof m.end_time,
          });
        });
        
        const res = await fetch(`${apiUrl}/api/masjid/settings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        
        const data = await res.json();

        if (!res.ok) throw new Error(data.responseMessage || 'Update failed');

        if (data.responseData?.medias) {
          setSettings(prev => ({ ...prev, medias: data.responseData.medias }));
        }
        if (data.responseData?.financial_reports) {
          setSettings(prev => ({ ...prev, financial_reports: data.responseData.financial_reports }));
        }
        if (data.responseData?.financial_summary) {
          setSettings(prev => ({ ...prev, financial_summary: data.responseData.financial_summary }));
        }
      } else {
        const payload = {
          city_id: settings.city_id,
          city_name: settings.city_name,
          medias: settings.medias.map(m => ({
            id: m.id,
            media_type: m.media_type,
            media_value: m.media_value,
            media_name: m.media_name,
            is_active: m.is_active,
            start_time: m.start_time,
            end_time: m.end_time,
          })),
          hadists: settings.hadists.map(h => ({
            id: h.id,
            text: h.text,
            source: h.source,
            is_active: h.is_active,
          })),
          financial_reports: settings.financial_reports.map(r => ({
            id: r.id,
            date: r.date,
            income: r.income,
            expense: r.expense,
            note: r.note,
            is_active: r.is_active,
          })),
          financial_summary: {
            account_balance: settings.financial_summary.account_balance,
            monthly_expense: settings.financial_summary.monthly_expense,
          },
          iqomah_subuh: settings.iqomah_subuh || 15,
          iqomah_dzuhur: settings.iqomah_dzuhur || 10,
          iqomah_ashar: settings.iqomah_ashar || 10,
          iqomah_maghrib: settings.iqomah_maghrib || 5,
          iqomah_isya: settings.iqomah_isya || 10,
          blackout_duration_minutes: settings.blackout_duration_minutes || 30,
          slide_duration_kegiatan_seconds: settings.slide_duration_kegiatan_seconds || 10,
        };

        console.log('=== DEBUG PAYLOAD (NO FILE) ===');
        console.log('All medias:', settings.medias);
        settings.medias.forEach((m, idx) => {
          console.log(`Media ${idx}:`, {
            media_type: m.media_type,
            media_value: m.media_value,
            media_name: m.media_name,
            is_active: m.is_active,
            start_time: m.start_time,
            end_time: m.end_time,
            type_start_time: typeof m.start_time,
            type_end_time: typeof m.end_time,
          });
        });
        
        const res = await fetch(`${apiUrl}/api/masjid/settings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        
        const data = await res.json();

        if (!res.ok) throw new Error(data.responseMessage || 'Update failed');

        if (data.responseData?.medias) {
          setSettings(prev => ({ ...prev, medias: data.responseData.medias }));
        }
        if (data.responseData?.financial_reports) {
          setSettings(prev => ({ ...prev, financial_reports: data.responseData.financial_reports }));
        }
        if (data.responseData?.financial_summary) {
          setSettings(prev => ({ ...prev, financial_summary: data.responseData.financial_summary }));
        }
      }

      setHasUnsavedChanges(false);
      setSuccess('Pengaturan berhasil disimpan');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
      setUploadProgress({ uploading: false, current: 0, total: 0, message: '', results: [] });
    }
  };

  const handleAddMedia = (newMedia: Media) => {
    if (newMedia.media_type === 'youtube') {
      newMedia.media_name = generateYoutubeMediaName(newMedia.id);
    }
    setSettings(prev => ({ ...prev, medias: [...prev.medias, newMedia] }));
    setShowMediaModal(false);
    setHasUnsavedChanges(true);
  };

  const handleEditMedia = (updatedMedia: Media, index: number) => {
    const updated = [...settings.medias];
    updated[index] = updatedMedia;
    setSettings(prev => ({ ...prev, medias: updated }));
    setShowMediaModal(false);
    setEditingMedia(null);
    setHasUnsavedChanges(true);
  };

  const handleDeleteMedia = (index: number) => {
    const filtered = settings.medias.filter((_, i) => i !== index);
    setSettings(prev => ({ ...prev, medias: filtered }));
    setShowDeleteConfirm(null);
    setHasUnsavedChanges(true);
  };

  const handleReorderMedias = (newOrder: Media[]) => {
    setSettings(prev => ({ ...prev, medias: newOrder }));
    setHasUnsavedChanges(true);
  };

  const handleAddHadist = (newHadist: Hadist) => {
    setSettings(prev => ({ ...prev, hadists: [...prev.hadists, newHadist] }));
    setShowHadistModal(false);
    setHasUnsavedChanges(true);
  };

  const handleEditHadist = (updatedHadist: Hadist, index: number) => {
    const updated = [...settings.hadists];
    updated[index] = updatedHadist;
    setSettings(prev => ({ ...prev, hadists: updated }));
    setShowHadistModal(false);
    setEditingHadist(null);
    setHasUnsavedChanges(true);
  };

  const handleDeleteHadist = (index: number) => {
    const filtered = settings.hadists.filter((_, i) => i !== index);
    setSettings(prev => ({ ...prev, hadists: filtered }));
    setShowHadistDeleteConfirm(null);
    setHasUnsavedChanges(true);
  };

  const handleToggleHadistActive = (index: number) => {
    const updated = [...settings.hadists];
    updated[index].is_active = !updated[index].is_active;
    setSettings(prev => ({ ...prev, hadists: updated }));
    setHasUnsavedChanges(true);
  };

  const handleReorderHadists = (newOrder: Hadist[]) => {
    setSettings(prev => ({ ...prev, hadists: newOrder }));
    setHasUnsavedChanges(true);
  };

  const handleAddLaporan = (newReport: FinancialReport) => {
    setSettings(prev => ({ ...prev, financial_reports: [...prev.financial_reports, newReport] }));
    setShowLaporanModal(false);
    setHasUnsavedChanges(true);
  };

  const handleEditLaporan = (updatedReport: FinancialReport, index: number) => {
    const updated = [...settings.financial_reports];
    updated[index] = updatedReport;
    setSettings(prev => ({ ...prev, financial_reports: updated }));
    setShowLaporanModal(false);
    setEditingLaporan(null);
    setHasUnsavedChanges(true);
  };

  const handleDeleteLaporan = (index: number) => {
    const filtered = settings.financial_reports.filter((_, i) => i !== index);
    setSettings(prev => ({ ...prev, financial_reports: filtered }));
    setShowLaporanDeleteConfirm(null);
    setHasUnsavedChanges(true);
  };

  const handleToggleLaporanActive = (index: number) => {
    const updated = [...settings.financial_reports];
    updated[index].is_active = !updated[index].is_active;
    setSettings(prev => ({ ...prev, financial_reports: updated }));
    setHasUnsavedChanges(true);
  };

  const handleReorderLaporan = (newOrder: FinancialReport[]) => {
    setSettings(prev => ({ ...prev, financial_reports: newOrder }));
    setHasUnsavedChanges(true);
  };

  const handleUpdateFinancialSummary = (summary: FinancialSummary) => {
    setSettings(prev => ({ ...prev, financial_summary: summary }));
    setHasUnsavedChanges(true);
  };

  const handleLogout = async () => {
    await authStorage.clearAll();
    router.push('/login');
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mosque-dark text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-mosque-dark text-white p-4 md:p-8 flex flex-col overflow-hidden">
      {/* Warning Banner - Sticky di atas (di luar card) */}
      {hasUnsavedChanges && (
        <div className="sticky top-0 z-30 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 mb-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠️</span>
              <span className="text-sm font-medium">
                Anda memiliki perubahan yang belum disimpan.
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="w-6xl mx-auto flex-1 flex flex-col min-h-0">
        {/* Scrollable Card */}
        <div className="bg-white shadow-2xl p-4 md:p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-emerald-900">Pengaturan Masjid</h1>
              <p className="text-gray-700 mt-1">Konfigurasi tampilan dan jadwal sholat</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              Keluar
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-emerald-900 mb-2">Masjid ID (untuk akses jadwal sholat)</h3>
              <div className="bg-white border border-emerald-300 rounded px-4 py-2 font-mono text-sm break-all text-emerald-900">
                {settings.masjid_id || 'Belum tersedia'}
              </div>
              <p className="text-xs text-emerald-700 mt-2">ID ini digunakan untuk mengakses jadwal sholat tanpa perlu login</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Nama Kota
              </label>
              <input
                type="text"
                value={settings.city_name}
                onChange={(e) => {
                  setSettings({ ...settings, city_name: e.target.value });
                  setHasUnsavedChanges(true);
                }}
                placeholder="Surabaya"
                className="w-full px-4 py-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition bg-white text-gray-900"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-emerald-900">Media Management</h3>
                <button
                  type="button"
                  onClick={() => {
                    setEditingMedia(null);
                    setShowMediaModal(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
                >
                  + Tambah Media
                </button>
              </div>
              
              <MediaList
                medias={settings.medias}
                onReorder={handleReorderMedias}
                onEdit={(index) => {
                  setEditingMedia({ media: settings.medias[index], index });
                  setShowMediaModal(true);
                }}
                onDelete={(index) => {
                  setShowDeleteConfirm({
                    index,
                    name: settings.medias[index].media_name.split('|')[0],
                  });
                }}
              />

              <div className="mt-4 flex gap-4 text-xs text-gray-500">
                <span>URL Gambar: {getMediaCountByType(settings.medias, 'url')}/{limits.url}</span>
                <span>YouTube: {getMediaCountByType(settings.medias, 'youtube')}/{limits.youtube}</span>
                <span>File Upload: {getMediaCountByType(settings.medias, 'file')}/{limits.file}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-emerald-900">Hadist/Quran Management</h3>
                <button
                  type="button"
                  onClick={() => {
                    if (settings.hadists.length >= HADIST_LIMIT) {
                      alert(`Maksimal ${HADIST_LIMIT} hadist/quran`);
                      return;
                    }
                    setEditingHadist(null);
                    setShowHadistModal(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={settings.hadists.length >= HADIST_LIMIT}
                >
                  + Tambah Hadist
                </button>
              </div>

              <HadistList
                hadists={settings.hadists}
                onReorder={handleReorderHadists}
                onEdit={(index) => {
                  setEditingHadist({ hadist: settings.hadists[index], index });
                  setShowHadistModal(true);
                }}
                onDelete={(index) => {
                  setShowHadistDeleteConfirm({
                    index,
                    text: settings.hadists[index].text,
                  });
                }}
                onToggleActive={handleToggleHadistActive}
              />

              <div className="mt-4 text-xs text-gray-500">
                <span>Hadist/Quran: {settings.hadists.length}/{HADIST_LIMIT}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-emerald-900">Laporan Keuangan Management</h3>
                <button
                  type="button"
                  onClick={() => {
                    if (settings.financial_reports.length >= LAPORAN_LIMIT) {
                      alert(`Maksimal ${LAPORAN_LIMIT} laporan keuangan`);
                      return;
                    }
                    setEditingLaporan(null);
                    setShowLaporanModal(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={settings.financial_reports.length >= LAPORAN_LIMIT}
                >
                  + Tambah Laporan
                </button>
              </div>

              <LaporanSummaryEditor
                summary={settings.financial_summary}
                onUpdate={handleUpdateFinancialSummary}
              />

              <LaporanList
                reports={settings.financial_reports}
                onReorder={handleReorderLaporan}
                onEdit={(index) => {
                  setEditingLaporan({ report: settings.financial_reports[index], index });
                  setShowLaporanModal(true);
                }}
                onDelete={(index) => {
                  setShowLaporanDeleteConfirm({
                    index,
                    note: settings.financial_reports[index].note,
                  });
                }}
                onToggleActive={handleToggleLaporanActive}
              />

              <div className="mt-4 text-xs text-gray-500">
                <span>Laporan Keuangan: {settings.financial_reports.length}/{LAPORAN_LIMIT}</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-emerald-900 mb-4">Durasi Iqomah (Menit)</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { key: 'iqomah_subuh', label: 'Subuh', min: 1, max: 60 },
                  { key: 'iqomah_dzuhur', label: 'Dzuhur', min: 1, max: 60 },
                  { key: 'iqomah_ashar', label: 'Ashar', min: 1, max: 60 },
                  { key: 'iqomah_maghrib', label: 'Maghrib', min: 1, max: 60 },
                  { key: 'iqomah_isya', label: 'Isya', min: 1, max: 60 },
                ].map((item) => {
                  const value = settings[item.key as keyof Settings] as number;
                  const valueStr = value.toString();
                  const hasError = value < item.min || value > item.max;
                  const hasNonNumericError = !/^\d*$/.test(valueStr);

                  return (
                    <div key={item.key}>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        {item.label}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={valueStr}
                        onChange={(e) => {
                          const inputValue = e.target.value;

                          if (!/^\d*$/.test(inputValue)) {
                            return;
                          }

                          const newValue = inputValue === '' ? null : parseInt(inputValue, 10);

                          setSettings({
                            ...settings,
                            [item.key]: newValue ?? item.min,
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition bg-white text-gray-900 ${
                          hasError || hasNonNumericError
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500'
                        }`}
                      />
                      {hasError && (
                        <p className="text-sm text-red-600 mt-1">
                          Nilai harus antara {item.min} sampai {item.max} menit
                        </p>
                      )}
                      {hasNonNumericError && (
                        <p className="text-sm text-red-600 mt-1">
                          Hanya boleh diisi angka (0-9)
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Durasi Blackout Sholat (Menit)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={settings.blackout_duration_minutes.toString()}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (!/^\d*$/.test(inputValue)) {
                    return;
                  }

                  const newValue = inputValue === '' ? null : parseInt(inputValue, 10);

                  setSettings({
                    ...settings,
                    blackout_duration_minutes: newValue ?? 30,
                  });
                  setHasUnsavedChanges(true);
                }}
                className={`w-full md:w-1/2 px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition bg-white text-gray-900 ${
                  settings.blackout_duration_minutes < 1 || settings.blackout_duration_minutes > 120
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
              />
              {(settings.blackout_duration_minutes < 1 || settings.blackout_duration_minutes > 120) && (
                <p className="text-sm text-red-600 mt-1">
                  Nilai harus antara 1 sampai 120 menit
                </p>
              )}
              <p className="text-sm text-gray-600 mt-1">Durasi layar hitam saat waktu sholat</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Durasi Slide Kegiatan (Detik)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={(settings.slide_duration_kegiatan_seconds || 10).toString()}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (!/^\d*$/.test(inputValue)) {
                    return;
                  }

                  const newValue = inputValue === '' ? null : parseInt(inputValue, 10);

                  setSettings({
                    ...settings,
                    slide_duration_kegiatan_seconds: newValue ?? 10,
                  });
                  setHasUnsavedChanges(true);
                }}
                className={`w-full md:w-1/2 px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition bg-white text-gray-900 ${
                  (settings.slide_duration_kegiatan_seconds || 10) < 1 || (settings.slide_duration_kegiatan_seconds || 10) > 300
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-emerald-300 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
              />
              {((settings.slide_duration_kegiatan_seconds || 10) < 1 || (settings.slide_duration_kegiatan_seconds || 10) > 300) && (
                <p className="text-sm text-red-600 mt-1">
                  Nilai harus antara 1 sampai 300 detik
                </p>
              )}
              <p className="text-sm text-gray-600 mt-1">Durasi slide untuk Kajian dan Laporan (default: 10 detik)</p>
             </div>

              <div className="hidden">
                <input type="submit" />
              </div>
           </form>
        </div>
      </div>

      {/* Footer Buttons - Di luar card, selalu terlihat */}
      <div className="mt-4 bg-mosque-dark border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto">
          {settings.medias.some((m: Media) => m.file) && (
            <div className="mb-3 text-center text-yellow-300 text-sm bg-yellow-900/30 py-2 px-4 rounded-lg">
              ⚠️ Ada file yang belum diupload. Klik &quot;Simpan Pengaturan&quot; untuk upload & simpan.
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Kembali ke Display
            </button>
          </div>
        </div>
      </div>

      <MediaModal
        media={editingMedia?.media}
        index={editingMedia?.index}
        medias={settings.medias}
        limits={limits}
        isOpen={showMediaModal}
        onClose={() => {
          setShowMediaModal(false);
          setEditingMedia(null);
        }}
        onSave={(media, index) => {
          if (index !== undefined) {
            handleEditMedia(media, index);
          } else {
            handleAddMedia(media);
          }
        }}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm !== null}
        mediaName={showDeleteConfirm?.name || ''}
        onConfirm={() => {
          if (showDeleteConfirm) {
            handleDeleteMedia(showDeleteConfirm.index);
          }
        }}
        onCancel={() => setShowDeleteConfirm(null)}
      />

      <HadistModal
        hadist={editingHadist?.hadist}
        index={editingHadist?.index}
        isOpen={showHadistModal}
        onClose={() => {
          setShowHadistModal(false);
          setEditingHadist(null);
        }}
        onSave={(hadist, index) => {
          if (index !== undefined) {
            handleEditHadist(hadist, index);
          } else {
            handleAddHadist(hadist);
          }
        }}
      />

      <DeleteHadistConfirmModal
        isOpen={showHadistDeleteConfirm !== null}
        text={showHadistDeleteConfirm?.text || ''}
        onConfirm={() => {
          if (showHadistDeleteConfirm) {
            handleDeleteHadist(showHadistDeleteConfirm.index);
          }
        }}
        onCancel={() => setShowHadistDeleteConfirm(null)}
      />

      <LaporanModal
        isOpen={showLaporanModal}
        onClose={() => {
          setShowLaporanModal(false);
          setEditingLaporan(null);
        }}
        onSave={(report) => {
          if (editingLaporan) {
            handleEditLaporan(report, editingLaporan.index);
          } else {
            handleAddLaporan(report);
          }
        }}
        report={editingLaporan?.report}
        existingDates={settings.financial_reports.map(r => r.date).filter((_, i) => i !== editingLaporan?.index)}
      />

      <DeleteLaporanConfirmModal
        isOpen={!!showLaporanDeleteConfirm}
        onClose={() => setShowLaporanDeleteConfirm(null)}
        onConfirm={() => {
          if (showLaporanDeleteConfirm) {
            handleDeleteLaporan(showLaporanDeleteConfirm.index);
          }
        }}
        note={showLaporanDeleteConfirm?.note || ''}
      />

      {uploadProgress.uploading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {uploadProgress.message}
              </h3>
              <p className="text-gray-600">
                Memproses {uploadProgress.current}/{uploadProgress.total}
              </p>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(uploadProgress.current / uploadProgress.total) * 100}%`
                }}
              />
            </div>
            
            {uploadProgress.results.length > 0 && (
              <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
                {uploadProgress.results.map((result, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-center gap-2 ${
                      result.success ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {result.success ? '✅' : '❌'} {result.fileName}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
