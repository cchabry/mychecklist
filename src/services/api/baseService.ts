
import { operationMode } from '@/services/operationMode';
import { operationModeUtils } from '@/services/operationMode/utils';
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
      // Simuler un délai réseau
      await operationModeUtils.applySimulatedDelay();
      
      // Récupérer les données mockées pour ce type d'entité
      const mockData = await import('@/lib/mockData').then(m => m.mockData);
      
      // Vérifier si une fonction spécifique existe
      const getterFn = `get${entityType.charAt(0).toUpperCase() + entityType.slice(1)}` as keyof typeof mockData;
      
      if (typeof mockData[getterFn] === 'function') {
        // Utiliser la fonction getter si elle existe
        const data = (mockData[getterFn] as Function)();
        
        // Appliquer les filtres si nécessaire
        if (filters) {
          return this.applyFilters(data, filters);
        }
        
        return data;
      }
      
      // Fallback sur l'accès direct à la propriété
      const dataKey = entityType.toLowerCase() as keyof typeof mockData;
      const mockEntities = mockData[dataKey] || [];
      
      // Appliquer les filtres si nécessaire
      if (filters) {
        return this.applyFilters(mockEntities, filters);
      }
      
      return mockEntities;
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
      // Simuler un délai réseau
      await operationModeUtils.applySimulatedDelay();
      
      // Récupérer les données mockées
      const mockData = await import('@/lib/mockData').then(m => m.mockData);
      
      // Vérifier si une fonction getter spécifique existe
      const getterFn = `get${entityType.charAt(0).toUpperCase() + entityType.slice(1).slice(0, -1)}` as keyof typeof mockData;
      
      if (typeof mockData[getterFn] === 'function') {
        // Utiliser la fonction getter d'élément unique si elle existe
        return (mockData[getterFn] as Function)(id);
      }
      
      // Fallback sur la recherche dans la liste
      const dataKey = entityType.toLowerCase() as keyof typeof mockData;
      const mockEntities = mockData[dataKey] || [];
      
      return mockEntities.find((item: any) => item.id === id) || null;
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
  async create<T>(entityType: string, data: Partial<T>): Promise<T> {
    // En mode démo, simuler la création
    if (operationMode.isDemoMode) {
      // Simuler un délai réseau
      await operationModeUtils.applySimulatedDelay();
      
      // Récupérer les données mockées
      const mockData = await import('@/lib/mockData').then(m => m.mockData);
      
      // Vérifier si une fonction de création spécifique existe
      const creatorFn = `create${entityType.charAt(0).toUpperCase() + entityType.slice(1).slice(0, -1)}` as keyof typeof mockData;
      
      if (typeof mockData[creatorFn] === 'function') {
        // Utiliser la fonction de création si elle existe
        return (mockData[creatorFn] as Function)(data);
      }
      
      // Fallback: simplement retourner les données avec un ID généré
      return {
        id: `${entityType.slice(0, -1)}_${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as unknown as T;
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
      // Simuler un délai réseau
      await operationModeUtils.applySimulatedDelay();
      
      // Récupérer les données mockées
      const mockData = await import('@/lib/mockData').then(m => m.mockData);
      
      // Vérifier si une fonction de mise à jour spécifique existe
      const updaterFn = `update${entityType.charAt(0).toUpperCase() + entityType.slice(1).slice(0, -1)}` as keyof typeof mockData;
      
      if (typeof mockData[updaterFn] === 'function') {
        // Utiliser la fonction de mise à jour si elle existe
        return (mockData[updaterFn] as Function)(id, data);
      }
      
      // Fallback: rechercher l'entité et la mettre à jour
      const dataKey = entityType.toLowerCase() as keyof typeof mockData;
      const mockEntities = mockData[dataKey] || [];
      const entityIndex = mockEntities.findIndex((item: any) => item.id === id);
      
      if (entityIndex === -1) {
        throw new Error(`${entityType} non trouvé: ${id}`);
      }
      
      const updatedEntity = {
        ...mockEntities[entityIndex],
        ...data,
        updatedAt: new Date().toISOString()
      };
      
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
      // Simuler un délai réseau
      await operationModeUtils.applySimulatedDelay();
      
      // Récupérer les données mockées
      const mockData = await import('@/lib/mockData').then(m => m.mockData);
      
      // Vérifier si une fonction de suppression spécifique existe
      const deleterFn = `delete${entityType.charAt(0).toUpperCase() + entityType.slice(1).slice(0, -1)}` as keyof typeof mockData;
      
      if (typeof mockData[deleterFn] === 'function') {
        // Utiliser la fonction de suppression si elle existe
        return (mockData[deleterFn] as Function)(id);
      }
      
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
  },
  
  /**
   * Applique des filtres à une collection d'entités
   */
  applyFilters<T>(entities: T[], filters: QueryFilters): T[] {
    return entities.filter((entity: any) => {
      // Vérifier chaque filtre
      return Object.entries(filters).every(([key, value]) => {
        // Si la valeur du filtre est undefined, ignorer ce filtre
        if (value === undefined) return true;
        
        const entityValue = entity[key];
        
        // Gestion des différents types de valeurs
        if (Array.isArray(value)) {
          return value.includes(entityValue);
        }
        
        return entityValue === value;
      });
    });
  }
};
