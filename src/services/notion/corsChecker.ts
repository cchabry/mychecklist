
/**
 * Service de vérification et de diagnostic des problèmes CORS
 */

// Type pour les vérifications CORS
export interface CorsCheckResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: number;
}

// URL de l'API Notion
const NOTION_API_URL = 'https://api.notion.com/v1';

// URL du proxy Netlify
const NETLIFY_PROXY_URL = '/.netlify/functions/notion-proxy';

/**
 * Vérifie si une URL est accessible via CORS
 */
async function checkCorsCompatibility(url: string): Promise<CorsCheckResult> {
  try {
    // Tenter un appel fetch simple
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      message: `URL accessible: ${url}`,
      timestamp: Date.now()
    };
  } catch (error) {
    return {
      success: false,
      message: `Erreur CORS détectée pour ${url}`,
      details: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    };
  }
}

/**
 * Service de vérification CORS
 */
export const corsChecker = {
  /**
   * Vérifie si l'API Notion est directement accessible (devrait échouer à cause de CORS)
   */
  async checkNotionApi(): Promise<CorsCheckResult> {
    return checkCorsCompatibility(`${NOTION_API_URL}/users/me`);
  },
  
  /**
   * Vérifie si le proxy Netlify est accessible
   */
  async checkNetlifyProxy(): Promise<CorsCheckResult> {
    return checkCorsCompatibility(NETLIFY_PROXY_URL);
  },
  
  /**
   * Effectue un diagnostic complet des problèmes CORS
   */
  async performDiagnostic(): Promise<{
    notionApiCheck: CorsCheckResult;
    netlifyProxyCheck: CorsCheckResult;
    recommendation: string;
  }> {
    const notionApiCheck = await this.checkNotionApi();
    const netlifyProxyCheck = await this.checkNetlifyProxy();
    
    let recommendation = '';
    
    if (notionApiCheck.success) {
      recommendation = 'L\'API Notion est directement accessible, mais cela pourrait poser des problèmes CORS dans certains navigateurs. Utilisez toujours le proxy Netlify.';
    } else if (netlifyProxyCheck.success) {
      recommendation = 'Le proxy Netlify est accessible. Assurez-vous que toutes les requêtes utilisent le proxy au lieu d\'appeler directement l\'API Notion.';
    } else {
      recommendation = 'Ni l\'API Notion ni le proxy Netlify ne sont accessibles. Vérifiez la configuration du proxy et assurez-vous que la fonction Netlify est déployée correctement.';
    }
    
    return {
      notionApiCheck,
      netlifyProxyCheck,
      recommendation
    };
  }
};

export default corsChecker;
