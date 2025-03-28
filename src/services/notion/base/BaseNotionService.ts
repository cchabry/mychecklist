
/**
 * Classe de base pour les services Notion
 * 
 * Cette classe fournit une implémentation standardisée des opérations CRUD
 * pour les entités Notion, avec un support pour le mode mock.
 */

import { notionClient } from '../client/notionClient';
import { NotionResponse, NotionConfig } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Génère un ID mock unique pour une entité
 * 
 * @param prefix - Préfixe pour l'ID (pour identifier le type d'entité)
 * @returns Un ID mock unique
 */
export function generateMockId(prefix: string = 'entity'): string {
  return `${prefix}-${Date.now()}-${uuidv4().substr(0, 8)}`;
}

/**
 * Classe de base pour les services Notion
 * 
 * @typeparam T - Type de l'entité
 * @typeparam C - Type des données pour la création
 * @typeparam U - Type des données pour la mise à jour
 */
export abstract class BaseNotionService<T, C, U> {
  /** Nom du service */
  protected readonly serviceName: string;
  
  /** Nom de la propriété de configuration pour l'ID de la base de données */
  protected readonly dbConfigKey: keyof NotionConfig;
  
  /**
   * Constructeur de la classe de base pour les services Notion
   * 
   * @param serviceName - Nom du service (pour les logs)
   * @param dbConfigKey - Clé de configuration pour l'ID de la base de données
   */
  constructor(serviceName: string, dbConfigKey: keyof NotionConfig) {
    this.serviceName = serviceName;
    this.dbConfigKey = dbConfigKey;
  }
  
  /**
   * Vérifie si le service est en mode mock
   * 
   * @returns true si le service est en mode mock
   */
  protected isMockMode(): boolean {
    return notionClient.isMockMode();
  }
  
  /**
   * Récupère la configuration du client Notion
   * 
   * @returns Configuration du client Notion
   */
  protected getConfig(): NotionConfig {
    return notionClient.getConfig();
  }
  
  /**
   * Génère des entités fictives pour le mode mock
   * 
   * @param filter - Filtre optionnel pour les entités
   * @returns Promise résolvant vers un tableau d'entités
   */
  protected abstract getMockEntities(filter?: Record<string, any>): Promise<T[]>;
  
  /**
   * Crée une entité fictive en mode mock
   * 
   * @param data - Données pour la création
   * @returns Promise résolvant vers l'entité créée
   */
  protected abstract mockCreate(data: C): Promise<T>;
  
  /**
   * Met à jour une entité fictive en mode mock
   * 
   * @param entity - Entité à mettre à jour
   * @returns Promise résolvant vers l'entité mise à jour
   */
  protected abstract mockUpdate(entity: T): Promise<T>;
  
  /**
   * Récupère toutes les entités
   * 
   * @param filter - Filtre optionnel pour les entités
   * @returns Promise résolvant vers un tableau d'entités
   */
  async getAll(filter?: Record<string, any>): Promise<NotionResponse<T[]>> {
    if (this.isMockMode()) {
      try {
        const mockEntities = await this.getMockEntities(filter);
        return {
          success: true,
          data: mockEntities
        };
      } catch (error) {
        return {
          success: false,
          error: {
            message: `Erreur lors de la récupération des ${this.serviceName}s en mode mock: ${error instanceof Error ? error.message : String(error)}`,
            details: error
          }
        };
      }
    }
    
    return this.getAllImpl(filter);
  }
  
  /**
   * Récupère une entité par son ID
   * 
   * @param id - ID de l'entité
   * @returns Promise résolvant vers l'entité
   */
  async getById(id: string): Promise<NotionResponse<T>> {
    if (this.isMockMode()) {
      try {
        const mockEntities = await this.getMockEntities();
        // On suppose que chaque entité a une propriété 'id'
        const entity = mockEntities.find((e: any) => e.id === id);
        
        if (!entity) {
          return {
            success: false,
            error: {
              message: `${this.serviceName} #${id} non trouvé`
            }
          };
        }
        
        return {
          success: true,
          data: entity
        };
      } catch (error) {
        return {
          success: false,
          error: {
            message: `Erreur lors de la récupération du ${this.serviceName} #${id} en mode mock: ${error instanceof Error ? error.message : String(error)}`,
            details: error
          }
        };
      }
    }
    
    return this.getByIdImpl(id);
  }
  
  /**
   * Crée une nouvelle entité
   * 
   * @param data - Données pour la création
   * @returns Promise résolvant vers l'entité créée
   */
  async create(data: C): Promise<NotionResponse<T>> {
    if (this.isMockMode()) {
      try {
        const entity = await this.mockCreate(data);
        return {
          success: true,
          data: entity
        };
      } catch (error) {
        return {
          success: false,
          error: {
            message: `Erreur lors de la création du ${this.serviceName} en mode mock: ${error instanceof Error ? error.message : String(error)}`,
            details: error
          }
        };
      }
    }
    
    return this.createImpl(data);
  }
  
  /**
   * Met à jour une entité existante
   * 
   * @param id - ID de l'entité
   * @param data - Données pour la mise à jour
   * @returns Promise résolvant vers l'entité mise à jour
   */
  async update(id: string, data: U): Promise<NotionResponse<T>> {
    if (this.isMockMode()) {
      try {
        // Récupérer l'entité existante
        const existingEntityResponse = await this.getById(id);
        if (!existingEntityResponse.success || !existingEntityResponse.data) {
          return {
            success: false,
            error: {
              message: `${this.serviceName} #${id} non trouvé`
            }
          };
        }
        
        // Mettre à jour l'entité
        const updatedEntity = {
          ...existingEntityResponse.data,
          ...data
        } as unknown as T;
        
        const result = await this.mockUpdate(updatedEntity);
        
        return {
          success: true,
          data: result
        };
      } catch (error) {
        return {
          success: false,
          error: {
            message: `Erreur lors de la mise à jour du ${this.serviceName} #${id} en mode mock: ${error instanceof Error ? error.message : String(error)}`,
            details: error
          }
        };
      }
    }
    
    return this.updateImpl(id, data);
  }
  
  /**
   * Supprime une entité
   * 
   * @param id - ID de l'entité
   * @returns Promise résolvant vers un booléen indiquant le succès
   */
  async delete(id: string): Promise<NotionResponse<boolean>> {
    if (this.isMockMode()) {
      return {
        success: true,
        data: true
      };
    }
    
    return this.deleteImpl(id);
  }
  
  /**
   * Implémentation de la récupération de toutes les entités
   * 
   * @param filter - Filtre optionnel pour les entités
   * @returns Promise résolvant vers un tableau d'entités
   */
  protected async getAllImpl(filter?: Record<string, any>): Promise<NotionResponse<T[]>> {
    console.log(`Utilisation de filter: ${JSON.stringify(filter)}`);
    // Implémentation par défaut: utiliser les données mock
    return {
      success: true,
      data: await this.getMockEntities(filter)
    };
  }
  
  /**
   * Implémentation de la récupération d'une entité par son ID
   * 
   * @param id - ID de l'entité
   * @returns Promise résolvant vers l'entité
   */
  protected async getByIdImpl(id: string): Promise<NotionResponse<T>> {
    console.log(`Récupération de l'entité avec l'ID: ${id}`);
    try {
      const mockEntities = await this.getMockEntities();
      // On suppose que chaque entité a une propriété 'id'
      const entity = mockEntities.find((e: any) => e.id === id);
      
      if (!entity) {
        return {
          success: false,
          error: {
            message: `${this.serviceName} #${id} non trouvé`
          }
        };
      }
      
      return {
        success: true,
        data: entity
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la récupération de l'entité: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la création d'une entité
   * 
   * @param data - Données pour la création
   * @returns Promise résolvant vers l'entité créée
   */
  protected async createImpl(data: C): Promise<NotionResponse<T>> {
    console.log(`Création d'une entité avec les données: ${JSON.stringify(data)}`);
    try {
      const entity = await this.mockCreate(data);
      return {
        success: true,
        data: entity
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la création de l'entité: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la mise à jour d'une entité
   * 
   * @param id - ID de l'entité
   * @param data - Données pour la mise à jour
   * @returns Promise résolvant vers l'entité mise à jour
   */
  protected async updateImpl(id: string, data: U): Promise<NotionResponse<T>> {
    console.log(`Mise à jour de l'entité ${id} avec les données: ${JSON.stringify(data)}`);
    try {
      // Récupérer l'entité existante
      const existingEntityResponse = await this.getById(id);
      if (!existingEntityResponse.success || !existingEntityResponse.data) {
        return {
          success: false,
          error: {
            message: `${this.serviceName} #${id} non trouvé`
          }
        };
      }
      
      // Mettre à jour l'entité
      const updatedEntity = {
        ...existingEntityResponse.data,
        ...data
      } as unknown as T;
      
      const result = await this.mockUpdate(updatedEntity);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: `Erreur lors de la mise à jour de l'entité: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Implémentation de la suppression d'une entité
   * 
   * @param id - ID de l'entité
   * @returns Promise résolvant vers un booléen indiquant le succès
   */
  protected async deleteImpl(id: string): Promise<NotionResponse<boolean>> {
    console.log(`Suppression de l'entité avec l'ID: ${id}`);
    // Implémentation par défaut: simuler un succès
    return {
      success: true,
      data: true
    };
  }
}
