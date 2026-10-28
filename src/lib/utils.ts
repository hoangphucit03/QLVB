import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date string (YYYY-MM-DD or ISO) to Vietnamese standard DD/MM/YYYY
 */
export function formatDateVN(dateStr: string | null | undefined): string {
  if (!dateStr || dateStr.trim() === '') return '—';
  try {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Returns today date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate stable unique ID for documents (Never uses row index)
 * Format: VBD-2025-a1b2c3d4 or VBDI-2025-a1b2c3d4
 */
export function generateDocumentId(prefix: 'VBD' | 'VBDI', year: number = new Date().getFullYear()): string {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timePart = Date.now().toString(36).substring(4).toUpperCase();
  return `${prefix}-${year}-${timePart}${randomPart}`;
}

/**
 * Check deadline status compared to today
 * returns: 'overdue' | 'due_today' | 'upcoming' | 'completed' | 'none'
 */
export function getDeadlineStatus(
  hanXuLy: string | undefined | null,
  trangThai: string | undefined | null
): 'overdue' | 'due_today' | 'upcoming' | 'completed' | 'none' {
  if (trangThai === 'Đã hoàn thành') return 'completed';
  if (!hanXuLy || hanXuLy.trim() === '') return 'none';

  const todayStr = getTodayDateString();
  const today = new Date(todayStr).getTime();
  const deadline = new Date(hanXuLy.split('T')[0]).getTime();

  if (isNaN(deadline)) return 'none';

  const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'due_today';
  if (diffDays <= 3) return 'upcoming';
  return 'none';
}

/**
 * Return CSS badge classes for Document Status
 */
export function getStatusBadgeClass(trangThai: string): { bg: string; text: string; border: string } {
  switch (trangThai) {
    case 'Chưa xử lý':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'Đang xử lý':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'Đã hoàn thành':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'Quá hạn':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    case 'Dự thảo':
      return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
    case 'Chờ ký':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'Đã ký duyệt':
      return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
    case 'Đã phát hành':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    default:
      return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  }
}

/**
 * Return CSS badge classes for Priority Level
 */
export function getPriorityBadgeClass(mucDo: string): { bg: string; text: string; border: string } {
  switch (mucDo) {
    case 'Hỏa tốc':
      return { bg: 'bg-red-100', text: 'text-red-800 font-semibold', border: 'border-red-300' };
    case 'Thượng khẩn':
      return { bg: 'bg-orange-100', text: 'text-orange-800 font-semibold', border: 'border-orange-300' };
    case 'Khẩn':
      return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' };
    case 'Thường':
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  }
}
