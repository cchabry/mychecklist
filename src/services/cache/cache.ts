
/**
 * Service de cache local utilisant le localStorage
 */
export class Cache {
  /**
   * Récupère une valeur du cache
   * @param key Clé du cache
   * @returns La valeur stockée ou null si inexistante ou expirée
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const parsedItem = JSON.parse(item);
      
      // Vérifier si l'entrée a expiré
      if (parsedItem.expiry && parsedItem.expiry < Date.now()) {
        // Supprimer l'entrée expirée
        this.remove(key);
        return null;
      }
      
      return parsedItem.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération depuis le cache (${key}):`, error);
      return null;
    }
  }
  
  /**
   * Enregistre une valeur dans le cache
   * @param key Clé du cache
   * @param data Données à stocker
   * @param ttl Durée de vie en millisecondes (0 = pas d'expiration)
   */
  set(key: string, data: any, ttl: number = 0): void {
    try {
      const item = {
        data,
        expiry: ttl > 0 ? Date.now() + ttl : null
      };
      
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`Erreur lors de l'enregistrement dans le cache (${key}):`, error);
    }
  }
  
  /**
   * Supprime une entrée du cache
   * @param key Clé du cache à supprimer
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erreur lors de la suppression du cache (${key}):`, error);
    }
  }
  
  /**
   * Supprime toutes les entrées du cache correspondant à un préfixe
   * @param prefix Préfixe des clés à supprimer
   */
  removeByPrefix(prefix: string): void {
    try {
      const keys = Object.keys(localStorage);
      const keysToRemove = keys.filter(key => key.startsWith(prefix));
      
      keysToRemove.forEach(key => {
        this.remove(key);
      });
      
      console.log(`${keysToRemove.length} entrées de cache supprimées avec le préfixe '${prefix}'`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du cache par préfixe (${prefix}):`, error);
    }
  }
  
  /**
   * Nettoie les entrées expirées du cache
   */
  cleanExpired(): void {
    try {
      const keys = Object.keys(localStorage);
      let expiredCount = 0;
      
      keys.forEach(key => {
        try {
          const item = localStorage.getItem(key);
          if (!item) return;
          
          const parsedItem = JSON.parse(item);
          if (parsedItem.expiry && parsedItem.expiry < Date.now()) {
            this.remove(key);
            expiredCount++;
          }
        } catch (e) {
          // Si une entrée ne peut pas être analysée, on la laisse
        }
      });
      
      if (expiredCount > 0) {
        console.log(`${expiredCount} entrées de cache expirées nettoyées`);
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage des entrées expirées:', error);
    }
  }
}

// Créer et exporter une instance unique du service de cache
export const cacheService = new Cache();
