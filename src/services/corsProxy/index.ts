
import { corsProxyService } from './corsProxyService';
import { useCorsProxy } from './useCorsProxy';
import { CorsProxy, ProxyTestResult, ProxyInfo } from './types';
import { availableProxies, getEnabledProxies } from './proxyList';

// Exporter pour rétrocompatibilité avec le code existant
export const corsProxy = corsProxyService;

// Exporter tous les modules et types
export { useCorsProxy, availableProxies, getEnabledProxies };
export type { CorsProxy, ProxyTestResult, ProxyInfo };
