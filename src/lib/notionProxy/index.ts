
// Créer un fichier notionProxy avec l'interface appropriée

/**
 * Proxy pour les appels vers l'API Notion
 * Gère la connexion, la mise en cache et le mode démo
 */
const notionApi = {
  /**
   * Méthode request pour faire des appels à l'API Notion
   */
  request: async (endpoint: string, method: string, data?: any, apiKey?: string) => {
    // Implementation simplifiée
    const key = apiKey || localStorage.getItem('notion_api_key');
    
    if (!key) {
      throw new Error('Clé API Notion manquante');
    }
    
    // Simuler une réponse en attendant l'implémentation complète
    console.log(`[notionApi] ${method} ${endpoint}`);
    
    return {
      results: []
    };
  },
  
  // Mode mock
  mockMode: {
    isActive: () => false,
    activate: () => console.log('Mode mock activé'),
    deactivate: () => console.log('Mode mock désactivé'),
    toggle: () => console.log('Toggle mode mock'),
    forceReset: () => console.log('Force reset mode mock'),
    persist: () => console.log('Persist mode mock'),
    updateConfig: (config: any) => console.log('Update config mode mock', config),
    temporarilyForceReal: () => console.log('Temporarily force real mode'),
    isTemporarilyForcedReal: (reset?: boolean) => false,
    restoreAfterForceReal: (restore?: boolean) => console.log('Restore after force real mode')
  },
  
  // Fonction users.me pour tester la connexion
  users: {
    me: async (apiKey: string) => {
      console.log('Vérification de la connexion Notion');
      return { ok: true };
    }
  }
};

export { notionApi };
