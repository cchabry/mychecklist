
/**
 * Service CORS Proxy complètement désactivé
 * 
 * Tous les appels à l'API Notion passent désormais exclusivement par les fonctions Netlify
 * qui gèrent correctement les problèmes de CORS.
 */

// Interface pour les informations de proxy (maintenue pour compatibilité avec le code existant)
export interface ProxyInfo {
  url: string;
  success: boolean;
}

class DisabledCorsProxyService {
  getCurrentProxy(): ProxyInfo {
    console.log('Service corsProxy désactivé - toutes les requêtes passent par Netlify');
    return { url: 'netlify-proxy', success: true };
  }
  
  setSelectedProxy(url?: string): void {
    console.log('Service corsProxy désactivé - toutes les requêtes passent par Netlify');
  }
  
  async testProxy(url?: string, token?: string): Promise<ProxyInfo> {
    console.log('Service corsProxy désactivé - toutes les requêtes passent par Netlify');
    return { url: url || 'netlify-proxy', success: true };
  }
  
  async findWorkingProxy(token?: string): Promise<ProxyInfo> {
    console.log('Service corsProxy désactivé - toutes les requêtes passent par Netlify');
    return { url: 'netlify-proxy', success: true };
  }
  
  resetProxyCache(): void {
    console.log('Service corsProxy désactivé - toutes les requêtes passent par Netlify');
  }
  
  async autoSetup(token?: string): Promise<ProxyInfo> {
    console.log('Service corsProxy désactivé - toutes les requêtes passent par Netlify');
    return { url: 'netlify-proxy', success: true };
  }
  
  proxify(url: string): string {
    console.log('Service corsProxy désactivé - toutes les requêtes passent par Netlify');
    return url;
  }
}

// Exporter une instance unique du service désactivé
export const corsProxy = new DisabledCorsProxyService();

// Pour compatibilité avec le code existant
export const PUBLIC_CORS_PROXIES = ['netlify-proxy'];
