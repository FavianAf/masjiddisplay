export interface FinancialReport {
  id?: string;
  date: string;          // YYYY-MM-DD format
  income: number;        // In Rupiah (tanpa desimal)
  expense: number;       // In Rupiah (tanpa desimal)
  note: string;          // Keterangan (max 500 karakter)
  is_active: boolean;
}

export interface FinancialSummary {
  account_balance: number;  // Saldo Rekening (Rupiah)
  monthly_expense: number;  // Pengeluaran Bulan Ini (Rupiah)
  last_updated: string;     // ISO timestamp
}
