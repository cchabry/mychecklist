
import { operationMode } from '@/services/operationMode';
import { QueryFilters } from './types';

/**
 * Service de base pour les opérations CRUD
 */
export const baseService = {
  /**
   * Récupère toutes les entités d'un type
   */
  async getAll<T>(entityType: string, filters?: QueryFilters): Promise<T[]> {
    // En mode démo, utiliser des données fictives
    if (operationMode.isDemoMode) {
      // Récupérer les données mockées pour ce type d'entité
      const mockModule = await import('@/lib/mockData');
      const mockData = mockModule[`mock${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`] || [];
      
      // Appliquer les filtres si nécessaire
      if (filters) {
        return mockData.filter((item: any) => {
          // Logique de filtrage
          for (const key in filters) {
            if (item[key] !== filters[key]) {
              return false;
            }
          }
          return true;
        });
      }
      
      return mockData;
    }
    
    // En mode réel, appeler l'API
    try {
      const response = await fetch(`/api/${entityType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des ${entityType}: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération des ${entityType}:`, error);
      throw error;
    }
  },
  
  /**
   * Récupère une entité par son ID
   */
  async getById<T>(entityType: string, id: string): Promise<T | null> {
    // En mode démo, utiliser des données fictives
    if (operationMode.isDemoMode) {
      // Récupérer les données mockées pour ce type d'entité
      const mockModule = await import('@/lib/mockData');
      const mockData = mockModule[`mock${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`] || [];
      const entity = mockData.find((item: any) => item.id === id);
      return entity || null;
    }
    
    // En mode réel, appeler l'API
    try {
      const response = await fetch(`/api/${entityType}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Erreur lors de la récupération de ${entityType}: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération de ${entityType}:`, error);
      throw error;
    }
  },
  
  /**
   * Crée une nouvelle entité
   */
  async create<T>(entityType: string, data: T): Promise<T> {
    // En mode démo, simuler la création
    if (operationMode.isDemoMode) {
      return data;
    }
    
    // En mode réel, appeler l'API
    try {
      const response = await fetch(`/api/${entityType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la création de ${entityType}: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Erreur lors de la création de ${entityType}:`, error);
      throw error;
    }
  },
  
  /**
   * Met à jour une entité existante
   */
  async update<T>(entityType: string, id: string, data: Partial<T>): Promise<T> {
    // En mode démo, simuler la mise à jour
    if (operationMode.isDemoMode) {
      // Récupérer les données mockées pour ce type d'entité
      const mockModule = await import('@/lib/mockData');
      const mockData = mockModule[`mock${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`] || [];
      const entityIndex = mockData.findIndex((item: any) => item.id === id);
      
      if (entityIndex === -1) {
        throw new Error(`${entityType} non trouvé: ${id}`);
      }
      
      const updatedEntity = {
        ...mockData[entityIndex],
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      mockData[entityIndex] = updatedEntity;
      return updatedEntity as T;
    }
    
    // En mode réel, appeler l'API
    try {
      const response = await fetch(`/api/${entityType}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour de ${entityType}: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de ${entityType}:`, error);
      throw error;
    }
  },
  
  /**
   * Supprime une entité
   */
  async delete(entityType: string, id: string): Promise<boolean> {
    // En mode démo, simuler la suppression
    if (operationMode.isDemoMode) {
      return true;
    }
    
    // En mode réel, appeler l'API
    try {
      const response = await fetch(`/api/${entityType}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la suppression de ${entityType}: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${entityType}:`, error);
      throw error;
    }
  }
};
