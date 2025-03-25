
/**
 * Configuration d'un proxy CORS
 */
export interface CorsProxy {
  name: string;
  url: string;
  enabled: boolean;
  requiresActivation?: boolean;
  activationUrl?: string;
  description?: string;
}

/**
 * État du gestionnaire de proxy CORS
 */
export interface CorsProxyState {
  currentProxyIndex: number;
  lastWorkingProxyIndex: number | null;
  selectedProxyUrl: string | null;
}

/**
 * Résultat d'un test de proxy
 */
export interface ProxyTestResult {
  success: boolean;
  proxyName: string;
  statusCode?: number;
  error?: string;
  latency?: number;
}

/**
 * Type d'information sur le proxy pour la compatibilité
 */
export type ProxyInfo = CorsProxy;
