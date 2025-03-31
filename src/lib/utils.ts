
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Fusionne les classes Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formate une date en format français
 */
export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Tronque un texte à une longueur maximale
 */
export function truncateText(text: string, maxLength: number = 100) {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}
