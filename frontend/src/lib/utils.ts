import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number | string): string {
    const b = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (b === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${parseFloat((b / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(date: string | Date | null): string {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function daysUntil(date: string | Date | null): number | null {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getExpiryColor(days: number | null): string {
    if (days === null) return '';
    if (days < 0) return 'text-red-500 bg-red-500/10';
    if (days <= 7) return 'text-red-500 bg-red-500/10';
    if (days <= 14) return 'text-orange-500 bg-orange-500/10';
    if (days <= 30) return 'text-yellow-500 bg-yellow-500/10';
    if (days <= 60) return 'text-blue-500 bg-blue-500/10';
    return 'text-green-500 bg-green-500/10';
}

export function getFileIcon(mimeType: string): string {
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType === 'image/jpeg') return 'JPG';
    if (mimeType === 'image/png') return 'PNG';
    if (mimeType.includes('wordprocessingml')) return 'DOCX';
    return 'FILE';
}
