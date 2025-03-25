
/**
 * Ce service a été désactivé car toutes les requêtes passent désormais par les fonctions Netlify
 * qui gèrent correctement les problèmes de CORS.
 * 
 * Maintenu uniquement pour compatibilité avec le code existant,
 * mais sans fonctionnalité active.
 */

// Interface vide pour compatibilité
interface DummyProxyInfo {
  url: string;
  success: boolean;
}

class DisabledCorsProxyService {
  getCurrentProxy(): null {
    console.warn('Service corsProxy désactivé - toutes les requêtes passent par Netlify');
    return null;
  }
  
  setSelectedProxy(): void {
    console.warn('Service corsProxy désactivé - toutes les requêtes passent par Netlify');
  }
  
  async testProxy(): Promise<DummyProxyInfo> {
    console.warn('Service corsProxy désactivé - toutes les requêtes passent par Netlify');
    return { url: 'netlify-proxy', success: true };
  }
  
  async findWorkingProxy(): Promise<DummyProxyInfo | null> {
    console.warn('Service corsProxy désactivé - toutes les requêtes passent par Netlify');
    return { url: 'netlify-proxy', success: true };
  }
  
  resetProxyCache(): void {
    console.warn('Service corsProxy désactivé - toutes les requêtes passent par Netlify');
  }
  
  async autoSetup(): Promise<DummyProxyInfo | null> {
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
