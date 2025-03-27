
/**
 * Utilitaires pour la feature SamplePages
 */

import { SamplePage, SamplePageFilters } from './types';
import { URL_REGEX } from './constants';

/**
 * Filtre les pages d'échantillon selon les critères spécifiés
 */
export function filterSamplePages(pages: SamplePage[], filters: SamplePageFilters): SamplePage[] {
  if (!filters.search) {
    return pages;
  }
  
  const searchLower = filters.search.toLowerCase();
  
  return pages.filter(page => {
    const titleMatch = page.title.toLowerCase().includes(searchLower);
    const urlMatch = page.url.toLowerCase().includes(searchLower);
    const descriptionMatch = page.description ? page.description.toLowerCase().includes(searchLower) : false;
    
    return titleMatch || urlMatch || descriptionMatch;
  });
}

/**
 * Trie les pages d'échantillon par ordre
 */
export function sortSamplePagesByOrder(pages: SamplePage[]): SamplePage[] {
  return [...pages].sort((a, b) => a.order - b.order);
}

/**
 * Valide une URL
 */
export function validateUrl(url: string): boolean {
  return URL_REGEX.test(url);
}

/**
 * Génère un ordre pour une nouvelle page (après la dernière)
 */
export function generateNextOrder(pages: SamplePage[]): number {
  if (pages.length === 0) {
    return 1;
  }
  
  const maxOrder = Math.max(...pages.map(page => page.order));
  return maxOrder + 1;
}
