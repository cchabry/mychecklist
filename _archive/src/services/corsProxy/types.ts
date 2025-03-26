
/**
 * Types pour le service de proxy CORS
 */

// Configuration d'un proxy CORS
export interface CorsProxy {
  url: string;
  name: string;
  enabled: boolean; // Si le proxy est actif et peut être utilisé
  requiresActivation?: boolean; // Si le proxy nécessite une activation manuelle
  activationUrl?: string; // URL pour activer le proxy
  instructions?: string; // Instructions d'activation
  dynamicToken?: boolean; // Si le proxy nécessite un token qui change
}

// État du service de proxy CORS
export interface CorsProxyState {
  currentProxyIndex: number;
  lastWorkingProxyIndex: number | null;
  selectedProxyUrl: string | null;
}

// Résultat de test d'un proxy
export interface ProxyTestResult {
  success: boolean;
  proxyName: string;
  statusCode?: number;
  error?: string;
}
