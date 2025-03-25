
import { CorsProxy } from './types';

/**
 * Liste des proxies CORS disponibles
 */
export const availableProxies: CorsProxy[] = [
  {
    name: 'CORS Anywhere',
    url: 'https://cors-anywhere.herokuapp.com/',
    enabled: true,
    requiresActivation: true,
    activationUrl: 'https://cors-anywhere.herokuapp.com/corsdemo',
    instructions: 'Visitez le lien et cliquez sur "Request temporary access to the demo server"'
  },
  {
    name: 'allOrigins',
    url: 'https://api.allorigins.win/raw?url=',
    enabled: true
  },
  {
    name: 'CORS Proxy',
    url: 'https://corsproxy.io/?',
    enabled: true
  },
  {
    name: 'CORS Bridge',
    url: 'https://api.codetabs.com/v1/proxy/?quest=',
    enabled: true
  },
  {
    name: 'CORS Online',
    url: 'https://cors-anywhere.azm.workers.dev/',
    enabled: true
  }
];

// Fonction pour obtenir les proxies activés
export function getEnabledProxies(): CorsProxy[] {
  return availableProxies.filter(proxy => proxy.enabled);
}
