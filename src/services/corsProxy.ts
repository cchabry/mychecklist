
/**
 * Ce service a été désactivé car toutes les requêtes passent désormais par les fonctions Netlify
 * qui gèrent correctement les problèmes de CORS.
 * 
 * Maintenu uniquement pour compatibilité avec le code existant,
 * mais sans fonctionnalité active.
 */

// Interface pour les informations de proxy
export interface ProxyInfo {
  url: string;
  success: boolean;
}

class DisabledCorsProxyService {
  getCurrentProxy(): ProxyInfo | null {
    console.warn('Service corsProxy désactivé - toutes les requêtes passent par Netlify');
    return { url: 'netlify-proxy', success: true };
  }
  
  setSelectedProxy(url?: string): void {
    console.warn('Service corsProxy désactivé - toutes les requêtes passent par Netlify');
  }
  
  async testProxy(url?: string, token?: string): Promise<ProxyInfo> {
    console.warn('Service corsProxy désactivé - toutes les requêtes passent par Netlify');
    return { url: url || 'netlify-proxy', success: true };
  }
  
  async findWorkingProxy(token?: string): Promise<ProxyInfo | null> {
    console.warn('Service corsProxy désactivé - toutes les requêtes passent par Netlify');
    return { url: 'netlify-proxy', success: true };
  }
  
  resetProxyCache(): void {
    console.warn('Service corsProxy désactivé - toutes les requêtes passent par Netlify');
  }
  
  async autoSetup(token?: string): Promise<ProxyInfo | null> {
    console.warn('Service corsProxy désactivé - toutes les requêtes passent par Netlify');
    return { url: 'netlify-proxy', success: true };
  }
  
  proxify(url: string): string {
    console.warn('Service corsProxy désactivé - toutes les requêtes passent par Netlify');
    return url;
  }
}

// Exporter une instance unique du service désactivé
export const corsProxy = new DisabledCorsProxyService();

// Pour compatibilité avec le code existant
export const PUBLIC_CORS_PROXIES = ['netlify-proxy'];
