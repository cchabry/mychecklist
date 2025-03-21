
/**
 * Système de cache local pour les données Notion
 * Permet de réduire les appels API et d'améliorer les performances
 */

// Types de base pour le cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version?: string;
}

interface CacheConfig {
  ttl: number; // Durée de vie du cache en millisecondes
  prefix: string; // Préfixe pour les clés localStorage
}

// Configuration par défaut
const DEFAULT_CONFIG: CacheConfig = {
  ttl: 5 * 60 * 1000, // 5 minutes par défaut
  prefix: 'notion_cache_'
};

/**
 * Classe pour gérer le cache des données
 */
export class Cache {
  private config: CacheConfig;
  
  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    };
  }
  
  /**
   * Stocke des données dans le cache
   */
  public set<T>(key: string, data: T, version?: string): void {
    try {
      const cacheKey = this.getCacheKey(key);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(entry));
      console.log(`Cache: Données stockées pour la clé "${key}"`);
    } catch (error) {
      console.error(`Erreur lors du stockage dans le cache pour la clé "${key}":`, error);
    }
  }
  
  /**
   * Récupère des données du cache
   * Retourne null si les données n'existent pas ou sont expirées
   */
  public get<T>(key: string): T | null {
    try {
      const cacheKey = this.getCacheKey(key);
      const storedData = localStorage.getItem(cacheKey);
      
      if (!storedData) {
        return null;
      }
      
      const entry: CacheEntry<T> = JSON.parse(storedData);
      const now = Date.now();
      
      // Vérifier si les données sont expirées
      if (now - entry.timestamp > this.config.ttl) {
        console.log(`Cache: Données expirées pour la clé "${key}"`);
        this.remove(key);
        return null;
      }
      
      console.log(`Cache: Données récupérées pour la clé "${key}"`);
      return entry.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du cache pour la clé "${key}":`, error);
      return null;
    }
  }
  
  /**
   * Récupère des données du cache avec vérification de version
   * Retourne null si les données n'existent pas, sont expirées ou ont une version différente
   */
  public getWithVersion<T>(key: string, version: string): T | null {
    try {
      const cacheKey = this.getCacheKey(key);
      const storedData = localStorage.getItem(cacheKey);
      
      if (!storedData) {
        return null;
      }
      
      const entry: CacheEntry<T> = JSON.parse(storedData);
      const now = Date.now();
      
      // Vérifier si les données sont expirées ou ont une version différente
      if (now - entry.timestamp > this.config.ttl || entry.version !== version) {
        console.log(`Cache: Données expirées ou version différente pour la clé "${key}"`);
        this.remove(key);
        return null;
      }
      
      console.log(`Cache: Données récupérées pour la clé "${key}" (version: ${version})`);
      return entry.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du cache pour la clé "${key}":`, error);
      return null;
    }
  }
  
  /**
   * Supprime des données du cache
   */
  public remove(key: string): void {
    try {
      const cacheKey = this.getCacheKey(key);
      localStorage.removeItem(cacheKey);
      console.log(`Cache: Données supprimées pour la clé "${key}"`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du cache pour la clé "${key}":`, error);
    }
  }
  
  /**
   * Vide tout le cache
   */
  public clear(): void {
    try {
      const keys = this.getAllCacheKeys();
      
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log(`Cache: ${keys.length} entrées effacées`);
    } catch (error) {
      console.error('Erreur lors de la suppression du cache:', error);
    }
  }
  
  /**
   * Récupère toutes les clés du cache
   */
  private getAllCacheKeys(): string[] {
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key && key.startsWith(this.config.prefix)) {
        keys.push(key);
      }
    }
    
    return keys;
  }
  
  /**
   * Génère une clé de cache préfixée
   */
  private getCacheKey(key: string): string {
    return `${this.config.prefix}${key}`;
  }
}

// Exporter une instance unique du cache
export const cacheService = new Cache();
