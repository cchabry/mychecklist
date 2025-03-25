
import { PUBLIC_CORS_PROXIES } from '@/lib/notionProxy/config';

// Type pour les informations de proxy
export interface ProxyInfo {
  url: string;
  status: 'working' | 'failed' | 'unknown';
  lastTested?: number;
}

// Stocker le proxy courant
let currentProxy: ProxyInfo | null = null;

/**
 * Service de gestion des proxies CORS
 * 
 * IMPORTANT: Suite à l'ajout des fonctions Netlify,
 * ce service est maintenant obsolète car toutes les requêtes
 * passent par les fonctions Netlify.
 */
export const corsProxy = {
  /**
   * Obtient le proxy actuel
   */
  getCurrentProxy: (): ProxyInfo | null => {
    return {
      url: '/.netlify/functions/notion-proxy',
      status: 'working',
      lastTested: Date.now()
    };
  },
  
  /**
   * Définit le proxy à utiliser
   */
  setSelectedProxy: (proxyUrl: string): void => {
    console.info('Les proxies CORS sont obsolètes. Toutes les requêtes passent par les fonctions Netlify.');
    // Ne fait rien car les fonctions Netlify sont utilisées
  },
  
  /**
   * Réinitialise le cache du proxy
   */
  resetProxyCache: (): void => {
    console.info('Les proxies CORS sont obsolètes. Toutes les requêtes passent par les fonctions Netlify.');
    // Ne fait rien car les fonctions Netlify sont utilisées
  },
  
  /**
   * Recherche un proxy qui fonctionne
   */
  findWorkingProxy: async (): Promise<ProxyInfo> => {
    // Retourne toujours le proxy Netlify comme fonctionnel
    return {
      url: '/.netlify/functions/notion-proxy',
      status: 'working',
      lastTested: Date.now()
    };
  },
};

export default corsProxy;
