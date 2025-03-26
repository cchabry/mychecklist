
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utilitaire pour combiner des classes Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
