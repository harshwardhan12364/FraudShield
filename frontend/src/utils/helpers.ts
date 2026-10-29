import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatAmount(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

export function truncateHash(hash: string, chars = 8): string {
  if (!hash) return '—';
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

export function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    submitted: 'badge-submitted',
    under_review: 'badge-under_review',
    substantiated: 'badge-substantiated',
    rejected: 'badge-rejected',
    disputed: 'badge-disputed',
    closed: 'badge-closed',
  };
  return map[status] || 'badge-submitted';
}

export function riskBadgeClass(level: string | null | undefined): string {
  const map: Record<string, string> = {
    high: 'risk-high',
    medium: 'risk-medium',
    low: 'risk-low',
    minimal: 'risk-minimal',
  };
  return map[level || 'minimal'] || 'risk-minimal';
}

export function getApiError(err: any): string {
  return err?.response?.data?.detail || err?.message || 'An unexpected error occurred.';
}
