
import { encryptData, decryptData } from './encryption';
import { identifyTokenType, NotionTokenType } from './tokenValidation';
import { structuredLogger } from '@/services/notion/logging/structuredLogger';

// Clé pour le stockage du token
const TOKEN_STORAGE_KEY = 'notion_secure_token';

/**
 * Options pour le stockage des tokens
 */
export interface TokenStorageOptions {
  useEncryption?: boolean;
  persistenceMode?: 'session' | 'local' | 'memory';
}

/**
 * Gestionnaire pour le stockage sécurisé des tokens
 */
export class TokenStorage {
  // Stockage en mémoire pour le mode "memory"
  private memoryStorage: Map<string, string> = new Map();
  
  // Options de configuration
  private options: TokenStorageOptions = {
    useEncryption: true,
    persistenceMode: 'local'
  };
  
  /**
   * Initialiser avec des options personnalisées
   */
  constructor(options?: Partial<TokenStorageOptions>) {
    this.configure(options);
  }
  
  /**
   * Configurer les options de stockage
   */
  configure(options?: Partial<TokenStorageOptions>): void {
    if (options) {
      this.options = { ...this.options, ...options };
    }
    
    structuredLogger.debug('Configuration du stockage de tokens', { 
      options: { 
        useEncryption: this.options.useEncryption,
        persistenceMode: this.options.persistenceMode
      } 
    });
  }
  
  /**
   * Stocker un token de manière sécurisée
   */
  saveToken(token: string, key: string = TOKEN_STORAGE_KEY): boolean {
    try {
      // Identifier le type de token pour le logging
      const tokenType = identifyTokenType(token);
      
      // Valeur à stocker (potentiellement chiffrée)
      let valueToStore = token;
      
      // Chiffrer si nécessaire
      if (this.options.useEncryption) {
        valueToStore = encryptData(token);
      }
      
      // Stocker selon le mode de persistance
      switch (this.options.persistenceMode) {
        case 'local':
          localStorage.setItem(key, valueToStore);
          break;
        case 'session':
          sessionStorage.setItem(key, valueToStore);
          break;
        case 'memory':
          this.memoryStorage.set(key, valueToStore);
          break;
      }
      
      structuredLogger.info('Token sauvegardé', { 
        tokenType, 
        storageMode: this.options.persistenceMode,
        encrypted: this.options.useEncryption
      });
      
      return true;
    } catch (error) {
      structuredLogger.error('Erreur lors de la sauvegarde du token', error, {
        source: 'TokenStorage',
        tags: ['security', 'storage']
      });
      return false;
    }
  }
  
  /**
   * Récupérer un token stocké
   */
  getToken(key: string = TOKEN_STORAGE_KEY): string | null {
    try {
      let storedValue: string | null = null;
      
      // Récupérer selon le mode de persistance
      switch (this.options.persistenceMode) {
        case 'local':
          storedValue = localStorage.getItem(key);
          break;
        case 'session':
          storedValue = sessionStorage.getItem(key);
          break;
        case 'memory':
          storedValue = this.memoryStorage.get(key) || null;
          break;
      }
      
      // Rien de trouvé
      if (!storedValue) {
        return null;
      }
      
      // Déchiffrer si nécessaire
      if (this.options.useEncryption) {
        try {
          return decryptData(storedValue);
        } catch (decryptError) {
          // Si le déchiffrement échoue, c'est peut-être que la valeur n'était pas chiffrée
          structuredLogger.warn('Échec du déchiffrement, tentative de retour de la valeur brute', {
            error: decryptError.message
          });
          return storedValue;
        }
      }
      
      return storedValue;
    } catch (error) {
      structuredLogger.error('Erreur lors de la récupération du token', error, {
        source: 'TokenStorage',
        tags: ['security', 'storage']
      });
      return null;
    }
  }
  
  /**
   * Supprimer un token stocké
   */
  removeToken(key: string = TOKEN_STORAGE_KEY): boolean {
    try {
      // Supprimer selon le mode de persistance
      switch (this.options.persistenceMode) {
        case 'local':
          localStorage.removeItem(key);
          break;
        case 'session':
          sessionStorage.removeItem(key);
          break;
        case 'memory':
          this.memoryStorage.delete(key);
          break;
      }
      
      structuredLogger.info('Token supprimé', { 
        storageKey: key,
        storageMode: this.options.persistenceMode
      });
      
      return true;
    } catch (error) {
      structuredLogger.error('Erreur lors de la suppression du token', error, {
        source: 'TokenStorage',
        tags: ['security', 'storage']
      });
      return false;
    }
  }
  
  /**
   * Vérifie si un token est stocké
   */
  hasToken(key: string = TOKEN_STORAGE_KEY): boolean {
    return this.getToken(key) !== null;
  }
}

// Exporter une instance par défaut
export const tokenStorage = new TokenStorage();

// Export par défaut
export default tokenStorage;
