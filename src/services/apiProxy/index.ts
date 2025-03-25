
// Exporter les types et interfaces
export * from './types';

// Exporter l'abstraction de base
export * from './AbstractProxyAdapter';

// Exporter le détecteur d'environnement
export * from './environmentDetector';

// Exporter le gestionnaire de proxy
export * from './ProxyManager';

// Exporter les adaptateurs
import { NetlifyProxyAdapter } from './adapters/NetlifyProxyAdapter';
import { LocalProxyAdapter } from './adapters/LocalProxyAdapter';

// Créer et exporter des instances des adaptateurs
export const netlifyAdapter = new NetlifyProxyAdapter();
export const localAdapter = new LocalProxyAdapter();

// Exporter un tableau de tous les adaptateurs disponibles
export const availableAdapters = [
  netlifyAdapter,
  localAdapter
];

// Fonction d'initialisation rapide avec tous les adaptateurs disponibles
import { proxyManager, initializeProxyManager } from './ProxyManager';
import { ProxyAdapterConfig } from './types';

/**
 * Initialise le système de proxy API avec tous les adaptateurs disponibles
 * @param config Configuration globale optionnelle
 * @returns Promise résolue quand l'initialisation est terminée
 */
export async function initializeApiProxy(config?: ProxyAdapterConfig): Promise<boolean> {
  return await initializeProxyManager(availableAdapters, config);
}

// Exporter le gestionnaire de proxy pour un accès facile
export { proxyManager as apiProxy };
