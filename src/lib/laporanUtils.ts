import { FinancialReport } from '@/types/laporan';

// Format number ke Rupiah currency
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Parse Rupiah string back ke number
export const parseRupiah = (formatted: string): number => {
  const clean = formatted.replace(/[Rp\s.]/g, '').replace(',', '.');
  return parseFloat(clean) || 0;
};

// Validate date format (YYYY-MM-DD)
export const validateDateFormat = (date: string): { valid: boolean; error?: string } => {
  if (!date) return { valid: false, error: 'Tanggal wajib diisi' };

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return { valid: false, error: 'Format tanggal harus YYYY-MM-DD' };

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return { valid: false, error: 'Tanggal tidak valid' };

  // Check jika tanggal tidak boleh di masa depan
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsedDate.setHours(0, 0, 0, 0);

  if (parsedDate > today) return { valid: false, error: 'Tanggal tidak boleh di masa depan' };

  return { valid: true };
};

// Validate financial report
export const validateFinancialReport = (report: FinancialReport): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate date
  const dateValidation = validateDateFormat(report.date);
  if (!dateValidation.valid) errors.push(dateValidation.error!);

  // Validate income
  if (report.income < 0) errors.push('Pemasukan tidak boleh negatif');

  // Validate expense
  if (report.expense < 0) errors.push('Pengeluaran tidak boleh negatif');

  // Validate note
  if (!report.note || report.note.trim() === '') errors.push('Keterangan wajib diisi');
  if (report.note.length > 500) errors.push('Keterangan maksimal 500 karakter');

  return {
    valid: errors.length === 0,
    errors,
  };
};

// Sort reports by date
export const sortReportsByDate = (reports: FinancialReport[]): FinancialReport[] => {
  return [...reports].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
};

// Check untuk duplicate dates
export const hasDuplicateDates = (reports: FinancialReport[], excludeIndex?: number): boolean => {
  const dateMap = new Map<string, number>();

  reports.forEach((report, index) => {
    if (excludeIndex !== undefined && index === excludeIndex) return;
    if (dateMap.has(report.date)) {
      return; // Duplicate found
    }
    dateMap.set(report.date, index);
  });

  return dateMap.size !== reports.length - (excludeIndex !== undefined ? 1 : 0);
};
