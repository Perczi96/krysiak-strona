// ============================================
// Utility Functions
// ============================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { toZonedTime, format as formatTz } from 'date-fns-tz';

// ============================================
// Class name merging (Tailwind)
// ============================================

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================
// Date formatting (Polska strefa czasowa)
// ============================================

const POLAND_TZ = 'Europe/Warsaw';

export function formatDatePL(date: string | Date, pattern: string = 'd MMMM yyyy'): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    const zoned = toZonedTime(d, POLAND_TZ);
    return formatTz(zoned, pattern, { timeZone: POLAND_TZ, locale: pl });
  } catch {
    return typeof date === 'string' ? date : String(date);
  }
}

export function formatDateTimePL(date: string | Date): string {
  return formatDatePL(date, 'd MMMM yyyy, HH:mm');
}

export function formatRelativePL(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true, locale: pl });
  } catch {
    return typeof date === 'string' ? date : String(date);
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// Slugify
// ============================================

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[ąćęłńóśźż]/g, (char) => {
      const map: Record<string, string> = {
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
        'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z'
      };
      return map[char] || char;
    })
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ============================================
// YouTube helpers
// ============================================

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /youtube\.com\/live\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'mq' | 'hq' | 'sd' | 'maxres' = 'maxres'): string {
  const qualities: Record<string, string> = {
    default: 'default',
    mq: 'mqdefault',
    hq: 'hqdefault',
    sd: 'sddefault',
    maxres: 'maxresdefault'
  };
  return `https://i.ytimg.com/vi/${videoId}/${qualities[quality]}.jpg`;
}

export function getYouTubeEmbedUrl(videoId: string, params: Record<string, string> = {}): string {
  const defaultParams = {
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    enablejsapi: '1',
    origin: window.location.origin
  };
  const searchParams = new URLSearchParams({ ...defaultParams, ...params });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${searchParams.toString()}`;
}

export function getYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

// ============================================
// Content type helpers
// ============================================

export type ContentType = 'video' | 'audio' | 'pdf' | 'post' | 'live';
export type ContentVisibility = 'public' | 'subscriber' | 'supporter';

export interface ContentTypeConfig {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const CONTENT_TYPE_CONFIG: Record<ContentType, ContentTypeConfig> = {
  video: { label: 'Wideo', icon: '▶', color: 'text-red-400', bgColor: 'bg-red-500/10' },
  audio: { label: 'Audio', icon: '🎧', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  pdf: { label: 'PDF', icon: '📄', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  post: { label: 'Artykuł', icon: '📝', color: 'text-green-400', bgColor: 'bg-green-500/10' },
  live: { label: 'Na żywo', icon: '🔴', color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
};

export const VISIBILITY_CONFIG: Record<ContentVisibility, { label: string; icon: string; color: string }> = {
  public: { label: 'Publiczne', icon: 'globe', color: 'text-green-400' },
  subscriber: { label: 'Zalogowani', icon: 'lock-open', color: 'text-blue-400' },
  supporter: { label: 'Wspierający', icon: 'crown', color: 'text-gold' }
};

// ============================================
// Tier helpers
// ============================================

export interface TierWithAccess {
  id: string;
  name: string;
  slug: string;
  priceMonthly: number;
  priceYearly: number | null;
  sortOrder: number;
  benefits: string[];
}

export function getTierAccessLevel(tier: TierWithAccess): number {
  return tier.sortOrder;
}

export function canAccessContent(userTier: TierWithAccess | null, contentTier: TierWithAccess | null): boolean {
  if (!contentTier) return true; // public content
  if (!userTier) return false;
  return userTier.sortOrder >= contentTier.sortOrder;
}

// ============================================
// Debounce
// ============================================

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// ============================================
// Local storage helpers
// ============================================

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('localStorage set error:', error);
  }
}

// ============================================
// Query string helpers
// ============================================

export function getQueryParam(param: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}

export function setQueryParam(param: string, value: string): void {
  const params = new URLSearchParams(window.location.search);
  params.set(param, value);
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
}

export function removeQueryParam(param: string): void {
  const params = new URLSearchParams(window.location.search);
  params.delete(param);
  window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
}

// ============================================
// Device detection
// ============================================

export function isMobile(): boolean {
  return window.innerWidth < 768;
}

export function isTablet(): boolean {
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

export function isDesktop(): boolean {
  return window.innerWidth >= 1024;
}

// ============================================
// Copy to clipboard
// ============================================

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================
// Share API
// ============================================

export async function shareContent(data: ShareData): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch {
      return false;
    }
  }
  // Fallback - copy to clipboard
  return copyToClipboard(data.url || window.location.href);
}

// ============================================
// Error handling
// ============================================

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  return 'Wystąpił nieoczekiwany błąd';
}

// ============================================
// Constants
// ============================================

export const APP_NAME = 'Bez Maski';
export const APP_DESCRIPTION = 'Oficjalna aplikacja kanału śledczego "Bez Maski" — Piotr Krysiak';
export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@piotr_krysiak';
export const PATRONITE_URL = 'https://patronite.pl/krysiak';
export const SUBSTACK_URL = 'https://piotrkrysiak.substack.com';
export const TWITTER_URL = 'https://x.com/Piotr_T_Krysiak';
