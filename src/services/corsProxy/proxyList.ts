
import { CorsProxy } from './types';

// Liste complète des proxies CORS publics disponibles
export const availableProxies: CorsProxy[] = [
  {
    name: 'CORS Anywhere',
    url: 'https://cors-anywhere.herokuapp.com/',
    enabled: true,
    requiresActivation: true,
    activationUrl: 'https://cors-anywhere.herokuapp.com/corsdemo',
    description: 'Populaire mais nécessite une activation'
  },
  {
    name: 'CORS Proxy IO',
    url: 'https://corsproxy.io/?',
    enabled: true,
    description: 'Service fiable et rapide'
  },
  {
    name: 'All Origins',
    url: 'https://api.allorigins.win/raw?url=',
    enabled: true,
    description: 'Alternative stable et rapide'
  },
  {
    name: 'Proxy Dev Space',
    url: 'https://proxy.devspace.sh/?',
    enabled: true,
    description: 'Service alternatif'
  },
  {
    name: 'CORS Bridge',
    url: 'https://cors.bridged.cc/',
    enabled: true,
    description: 'Service alternatif'
  },
  {
    name: 'CORS.sh',
    url: 'https://cors.sh/?',
    enabled: true,
    description: 'Service payant avec quota gratuit'
  },
  {
    name: 'CORS.express',
    url: 'https://cors.express/?',
    enabled: true,
    description: 'Service récent'
  },
  {
    name: 'JSONP Proxy',
    url: 'https://jsonp.afeld.me/?url=',
    enabled: false, // Désactivé car moins compatible avec les API JSON
    description: 'Uniquement JSONP'
  }
];

/**
 * Récupère tous les proxies activés
 */
export const getEnabledProxies = (): CorsProxy[] => {
  return availableProxies.filter(proxy => proxy.enabled);
};
