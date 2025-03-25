
/**
 * Interface pour un proxy CORS
 */
export interface CorsProxy {
  url: string;
  name?: string;
  enabled?: boolean;
  lastTested?: number;
  success?: boolean;
  latency?: number;
}

/**
 * Interface étendue pour les informations de proxy
 */
export interface ProxyInfo {
  url: string;
  lastTested: number;
  success: boolean;
  latency: number;
  name?: string;
}

/**
 * Interface pour le résultat de test d'un proxy
 */
export interface ProxyTestResult {
  success: boolean;
  latency: number;
  error?: string;
  proxyName?: string;
}

/**
 * Interface pour le service de proxy CORS
 */
export interface CorsProxyService {
  getCurrentProxy: () => ProxyInfo | null;
  setCurrentProxy: (proxy: ProxyInfo) => void;
  testProxy: (proxyUrl: string, testToken?: string) => Promise<ProxyTestResult>;
  findWorkingProxy: (testToken?: string) => Promise<ProxyInfo | null>;
  resetProxyCache: () => void;
  getEnabledProxies: () => ProxyInfo[];
}
