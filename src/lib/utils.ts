import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function parseCookieString(
  cookieString: string
): Record<string, string> {
  return cookieString.split(';').reduce(
    (acc, cookiePart) => {
      const [key, value] = cookiePart.trim().split('=');
      if (key && value) {
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    },
    {} as Record<string, string>
  );
}

export function formatFollowersCount(followers: number): string {
  if (followers >= 1000000) {
    return `${(followers / 1000000).toFixed(1)}M`;
  }
  if (followers >= 1000) {
    return `${(followers / 1000).toFixed(1)}K`;
  }
  return followers.toString();
}
export function truncateText(text: string, maxLength: number = 20): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}
