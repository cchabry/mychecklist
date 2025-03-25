
import { CorsProxy } from './types';

/**
 * Liste complète des proxies CORS disponibles
 */
export const availableProxies: CorsProxy[] = [
  {
    name: 'cors-anywhere',
    url: 'https://cors-anywhere.herokuapp.com/',
    enabled: true,
    requiresActivation: true,
    activationUrl: 'https://cors-anywhere.herokuapp.com/corsdemo',
    activationInstructions: 'Cliquez sur le bouton "Request temporary access to the demo server"',
    priority: 1
  },
  {
    name: 'corsproxy.io',
    url: 'https://corsproxy.io/?',
    enabled: true,
    requiresActivation: false,
    priority: 2
  },
  {
    name: 'allorigins',
    url: 'https://api.allorigins.win/raw?url=',
    enabled: true,
    requiresActivation: false,
    priority: 3
  },
  {
    name: 'cors-proxy.htmldriven',
    url: 'https://cors-proxy.htmldriven.com/?url=',
    enabled: true,
    requiresActivation: false,
    priority: 4
  },
  {
    name: 'thingproxy',
    url: 'https://thingproxy.freeboard.io/fetch/',
    enabled: true,
    requiresActivation: false,
    priority: 5
  }
];

/**
 * Récupère la liste des proxies activés, triés par priorité
 */
export function getEnabledProxies(): CorsProxy[] {
  return [...availableProxies]
    .filter(proxy => proxy.enabled)
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
}

/**
 * Active ou désactive un proxy spécifique
 */
export function setProxyEnabled(proxyUrl: string, enabled: boolean): void {
  const proxy = availableProxies.find(p => p.url === proxyUrl);
  if (proxy) {
    proxy.enabled = enabled;
  }
}
