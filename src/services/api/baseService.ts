
import { operationMode } from '@/services/operationMode';
import { mockData } from '@/lib/mockData/index';

/**
 * Gère le mode opérationnel (démo ou réel) pour les appels de service
 * @param realFn Fonction à exécuter en mode réel
 * @param demoFn Fonction à exécuter en mode démo
 * @returns Résultat de la fonction appropriée
 */
export async function handleDemoMode<T>(
  realFn: () => Promise<T>,
  demoFn: () => Promise<T>
): Promise<T> {
  try {
    // Si on est en mode démo, on exécute la fonction de démo
    if (operationMode.isDemoMode) {
      console.log('[baseService] Exécution en mode démo');
      return await demoFn();
    }
    
    // Sinon, on exécute la fonction réelle
    console.log('[baseService] Exécution en mode réel');
    const result = await realFn();
    
    // Signaler au service de mode opérationnel que l'opération a réussi
    operationMode.handleSuccessfulOperation();
    
    return result;
  } catch (error) {
    console.error('[baseService] Erreur lors de l\'exécution:', error);
    
    // Signaler l'erreur au service de mode opérationnel
    if (error instanceof Error) {
      operationMode.handleConnectionError(error, 'API Service');
    } else {
      operationMode.handleConnectionError(new Error(String(error)), 'API Service');
    }
    
    // Si on a basculé en mode démo après l'erreur, on essaie avec la fonction de démo
    if (operationMode.isDemoMode) {
      console.log('[baseService] Basculement vers le mode démo après erreur');
      return await demoFn();
    }
    
    // Sinon, on propage l'erreur
    throw error;
  }
}

// Service de base pour les API
export const baseService = {
  /**
   * Récupère toutes les entités d'un certain type
   */
  async getAll<T>(entityType: string, filters?: any): Promise<T[]> {
    return handleDemoMode<T[]>(
      async () => {
        // Implémentation réelle qui interrogerait l'API
        const response = await fetch(`/api/${entityType}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${entityType}`);
        }
        return response.json();
      },
      async () => {
        // Utiliser des données mockées en mode démo
        const mockEntityData = (mockData as any)[entityType] || [];
        return mockEntityData;
      }
    );
  },

  /**
   * Récupère une entité par son ID
   */
  async getById<T>(entityType: string, id: string): Promise<T | null> {
    return handleDemoMode<T | null>(
      async () => {
        // Implémentation réelle qui interrogerait l'API
        const response = await fetch(`/api/${entityType}/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`Failed to fetch ${entityType}`);
        }
        return response.json();
      },
      async () => {
        // Utiliser des données mockées en mode démo
        const getter = `get${entityType.charAt(0).toUpperCase() + entityType.slice(1, -1)}`;
        if (typeof (mockData as any)[getter] === 'function') {
          return (mockData as any)[getter](id);
        }
        return null;
      }
    );
  },

  /**
   * Crée une nouvelle entité
   */
  async create<T>(entityType: string, data: T): Promise<T> {
    return handleDemoMode<T>(
      async () => {
        // Implémentation réelle qui enverrait les données à l'API
        const response = await fetch(`/api/${entityType}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error(`Failed to create ${entityType}`);
        }
        return response.json();
      },
      async () => {
        // Créer une nouvelle entité mockée en mode démo
        const creator = `create${entityType.charAt(0).toUpperCase() + entityType.slice(1, -1)}`;
        if (typeof (mockData as any)[creator] === 'function') {
          return (mockData as any)[creator](data);
        }
        return data;
      }
    );
  },

  /**
   * Met à jour une entité existante
   */
  async update<T>(entityType: string, id: string, data: Partial<T>): Promise<T> {
    return handleDemoMode<T>(
      async () => {
        // Implémentation réelle qui enverrait les données à l'API
        const response = await fetch(`/api/${entityType}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error(`Failed to update ${entityType}`);
        }
        return response.json();
      },
      async () => {
        // Mettre à jour une entité mockée en mode démo
        const updater = `update${entityType.charAt(0).toUpperCase() + entityType.slice(1, -1)}`;
        if (typeof (mockData as any)[updater] === 'function') {
          return (mockData as any)[updater](id, data);
        }
        return { ...data, id } as T;
      }
    );
  },

  /**
   * Supprime une entité
   */
  async delete(entityType: string, id: string): Promise<boolean> {
    return handleDemoMode<boolean>(
      async () => {
        // Implémentation réelle qui enverrait la requête à l'API
        const response = await fetch(`/api/${entityType}/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`Failed to delete ${entityType}`);
        }
        return true;
      },
      async () => {
        // Simuler la suppression en mode démo
        const deleter = `delete${entityType.charAt(0).toUpperCase() + entityType.slice(1, -1)}`;
        if (typeof (mockData as any)[deleter] === 'function') {
          return (mockData as any)[deleter](id);
        }
        return true;
      }
    );
  },
};

// Exporter le service mockData pour faciliter l'accès à travers l'application
export { mockData };
