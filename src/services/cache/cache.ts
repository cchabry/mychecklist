
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
        expiry: ttl > 0 ? Date.now() + ttl : null,
        timestamp: Date.now()
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
   * @returns Nombre d'entrées supprimées
   */
  removeByPrefix(prefix: string): number {
    try {
      const keys = Object.keys(localStorage);
      const keysToRemove = keys.filter(key => key.startsWith(prefix));
      
      keysToRemove.forEach(key => {
        this.remove(key);
      });
      
      console.log(`${keysToRemove.length} entrées de cache supprimées avec le préfixe '${prefix}'`);
      return keysToRemove.length;
    } catch (error) {
      console.error(`Erreur lors de la suppression du cache par préfixe (${prefix}):`, error);
      return 0;
    }
  }
  
  /**
   * Nettoie les entrées expirées du cache
   * @returns Nombre d'entrées nettoyées
   */
  cleanExpired(): number {
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
      
      return expiredCount;
    } catch (error) {
      console.error('Erreur lors du nettoyage des entrées expirées:', error);
      return 0;
    }
  }
  
  /**
   * Récupère toutes les entrées du cache
   * @returns Tableau d'objets contenant les clés et valeurs du cache
   */
  getAll(): Array<{key: string, data: any, expiry: number | null, timestamp: number}> {
    try {
      const keys = Object.keys(localStorage);
      const items = [];
      
      for (const key of keys) {
        try {
          const item = localStorage.getItem(key);
          if (!item) continue;
          
          const parsedItem = JSON.parse(item);
          items.push({
            key,
            ...parsedItem
          });
        } catch (e) {
          // Ignorer les entrées qui ne peuvent pas être analysées
        }
      }
      
      return items;
    } catch (error) {
      console.error('Erreur lors de la récupération de toutes les entrées du cache:', error);
      return [];
    }
  }
  
  /**
   * Vérifie si une clé existe dans le cache et n'est pas expirée
   * @param key Clé à vérifier
   * @returns true si la clé existe et n'est pas expirée
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }
  
  /**
   * Récupère l'heure d'expiration d'une entrée du cache
   * @param key Clé du cache
   * @returns Timestamp d'expiration ou null si pas d'expiration ou clé inexistante
   */
  getExpiry(key: string): number | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const parsedItem = JSON.parse(item);
      return parsedItem.expiry;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Prolonge la durée de vie d'une entrée du cache
   * @param key Clé du cache
   * @param additionalTime Temps supplémentaire en millisecondes
   * @returns true si l'opération a réussi
   */
  extendTTL(key: string, additionalTime: number): boolean {
    try {
      const item = localStorage.getItem(key);
      if (!item) return false;
      
      const parsedItem = JSON.parse(item);
      
      // Si l'entrée n'a pas d'expiration, on ne peut pas l'étendre
      if (!parsedItem.expiry) return false;
      
      parsedItem.expiry += additionalTime;
      localStorage.setItem(key, JSON.stringify(parsedItem));
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de l'extension du TTL (${key}):`, error);
      return false;
    }
  }
}

// Créer et exporter une instance unique du service de cache
export const cacheService = new Cache();
