// src/lib/format.ts

// Compute the base API host (without /api/v1) for static image resolution
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5162/api/v1';
export const API_HOST = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function getImageUrl(path: string | null) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${API_HOST}${path}`;
}

/** Local date as YYYY-MM-DD (never shifts across the UTC boundary). */
export function toLocalISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayISO(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return toLocalISO(date);
}

/** Whole days between two YYYY-MM-DD values (positive when `end` is later). */
export function daysBetween(start: string, end: string) {
  if (!start || !end) return 0;
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  return Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000);
}
