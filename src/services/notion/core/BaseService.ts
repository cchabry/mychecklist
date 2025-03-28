
/**
 * Service de base pour tous les services Notion
 */

import { notionClient } from '../client/notionClient';
import { NotionResponse } from '../types';
import { CrudService, StandardFilterOptions } from '../types/ServiceInterfaces';

/**
 * Génère un ID fictif pour les mocks
 * 
 * @param prefix Préfixe pour l'ID
 * @returns ID généré
 */
export function generateMockId(prefix: string = ''): string {
  return `${prefix}${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Service de base implémentant les opérations CRUD pour une entité
 */
export abstract class BaseService<
  T extends { id: string },
  CreateDataType = Omit<T, 'id'>,
  UpdateDataType = Partial<Omit<T, 'id'>>
> implements CrudService<T, CreateDataType, UpdateDataType> {
  /** Nom du type d'entité */
  protected entityType: string;
  
  /** Clé de configuration pour l'ID de la base de données */
  protected dbIdConfigKey: keyof any;
  
  /**
   * Constructeur de BaseService
   * 
   * @param entityType Type d'entité géré par ce service
   * @param dbIdConfigKey Clé dans la configuration pour l'ID de la base de données
   */
  constructor(entityType: string, dbIdConfigKey: string) {
    this.entityType = entityType;
    this.dbIdConfigKey = dbIdConfigKey as any;
  }
  
  /**
   * Récupère l'ID de la base de données pour cette entité
   * 
   * @returns ID de la base de données
   * @throws Error si l'ID n'est pas configuré
   */
  protected getDatabaseId(): string {
    const config = notionClient.getConfig();
    const dbId = config[this.dbIdConfigKey];
    
    if (!dbId) {
      throw new Error(`ID de base de données non configuré pour ${this.entityType} (clé: ${String(this.dbIdConfigKey)})`);
    }
    
    return dbId;
  }
  
  /**
   * Récupère toutes les entités
   * 
   * @param filter Options de filtre
   * @returns Réponse contenant la liste des entités
   */
  async getAll(filter?: StandardFilterOptions): Promise<NotionResponse<T[]>> {
    if (notionClient.isMockMode()) {
      const entities = await this.getMockEntities(filter);
      return {
        success: true,
        data: entities
      };
    }
    
    try {
      const dbId = this.getDatabaseId();
      const queryFilter = this.buildQueryFilter(filter);
      
      // Effectuer la requête à Notion
      const response = await notionClient.post(`/databases/${dbId}/query`, queryFilter);
      
      if (!response.success || !response.data?.results) {
        return {
          success: false,
          error: response.error || { message: `Erreur lors de la récupération des ${this.entityType}s` }
        };
      }
      
      // Transformer les résultats en entités
      const entities = response.data.results.map((page: any) => this.pageToEntity(page));
      
      return {
        success: true,
        data: entities
      };
    } catch (error) {
      return {
        success: false,
        error: { 
          message: `Erreur lors de la récupération des ${this.entityType}s: ${error instanceof Error ? error.message : String(error)}` 
        }
      };
    }
  }
  
  /**
   * Récupère une entité par son ID
   * 
   * @param id ID de l'entité
   * @returns Réponse contenant l'entité
   */
  async getById(id: string): Promise<NotionResponse<T>> {
    if (notionClient.isMockMode()) {
      const entity = await this.getMockEntityById(id);
      
      if (!entity) {
        return {
          success: false,
          error: { message: `${this.entityType} #${id} non trouvé` }
        };
      }
      
      return {
        success: true,
        data: entity
      };
    }
    
    try {
      // Effectuer la requête à Notion
      const response = await notionClient.get(`/pages/${id}`);
      
      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || { message: `Erreur lors de la récupération du ${this.entityType} #${id}` }
        };
      }
      
      // Transformer la page en entité
      const entity = this.pageToEntity(response.data);
      
      return {
        success: true,
        data: entity
      };
    } catch (error) {
      return {
        success: false,
        error: { 
          message: `Erreur lors de la récupération du ${this.entityType} #${id}: ${error instanceof Error ? error.message : String(error)}` 
        }
      };
    }
  }
  
  /**
   * Crée une nouvelle entité
   * 
   * @param data Données pour la création
   * @returns Réponse contenant l'entité créée
   */
  async create(data: CreateDataType): Promise<NotionResponse<T>> {
    if (notionClient.isMockMode()) {
      const entity = await this.mockCreate(data);
      
      return {
        success: true,
        data: entity
      };
    }
    
    try {
      const dbId = this.getDatabaseId();
      const properties = this.dataToProperties(data);
      
      // Effectuer la requête à Notion
      const response = await notionClient.post(`/pages`, {
        parent: { database_id: dbId },
        properties
      });
      
      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || { message: `Erreur lors de la création du ${this.entityType}` }
        };
      }
      
      // Transformer la page en entité
      const entity = this.pageToEntity(response.data);
      
      return {
        success: true,
        data: entity
      };
    } catch (error) {
      return {
        success: false,
        error: { 
          message: `Erreur lors de la création du ${this.entityType}: ${error instanceof Error ? error.message : String(error)}` 
        }
      };
    }
  }
  
  /**
   * Met à jour une entité existante
   * 
   * @param id ID de l'entité
   * @param data Données pour la mise à jour
   * @returns Réponse contenant l'entité mise à jour
   */
  async update(id: string, data: UpdateDataType): Promise<NotionResponse<T>> {
    if (notionClient.isMockMode()) {
      const existingEntity = await this.getMockEntityById(id);
      
      if (!existingEntity) {
        return {
          success: false,
          error: { message: `${this.entityType} #${id} non trouvé` }
        };
      }
      
      const updatedEntity = {
        ...existingEntity,
        ...data
      };
      
      const entity = await this.mockUpdate(updatedEntity);
      
      return {
        success: true,
        data: entity
      };
    }
    
    try {
      const properties = this.dataToProperties(data);
      
      // Effectuer la requête à Notion
      const response = await notionClient.patch(`/pages/${id}`, {
        properties
      });
      
      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || { message: `Erreur lors de la mise à jour du ${this.entityType} #${id}` }
        };
      }
      
      // Transformer la page en entité
      const entity = this.pageToEntity(response.data);
      
      return {
        success: true,
        data: entity
      };
    } catch (error) {
      return {
        success: false,
        error: { 
          message: `Erreur lors de la mise à jour du ${this.entityType} #${id}: ${error instanceof Error ? error.message : String(error)}` 
        }
      };
    }
  }
  
  /**
   * Supprime une entité existante
   * 
   * @param id ID de l'entité
   * @returns Réponse indiquant si la suppression a réussi
   */
  async delete(id: string): Promise<NotionResponse<boolean>> {
    if (notionClient.isMockMode()) {
      const success = await this.mockDelete(id);
      
      return {
        success: true,
        data: success
      };
    }
    
    try {
      // Effectuer la requête à Notion (archiver la page)
      const response = await notionClient.patch(`/pages/${id}`, {
        archived: true
      });
      
      if (!response.success) {
        return {
          success: false,
          error: response.error || { message: `Erreur lors de la suppression du ${this.entityType} #${id}` }
        };
      }
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: { 
          message: `Erreur lors de la suppression du ${this.entityType} #${id}: ${error instanceof Error ? error.message : String(error)}` 
        }
      };
    }
  }
  
  /**
   * Construit un filtre de requête à partir des options de filtre
   * 
   * @param filter Options de filtre
   * @returns Filtre pour la requête Notion
   */
  protected buildQueryFilter(filter?: StandardFilterOptions): any {
    // Implémentation de base, à surcharger dans les classes dérivées
    return filter ? { filter: {} } : {};
  }
  
  /**
   * Convertit une page Notion en entité
   * 
   * @param page Page Notion
   * @returns Entité convertie
   */
  protected pageToEntity(page: any): T {
    // Implémentation de base, à surcharger dans les classes dérivées
    return {
      id: page.id
    } as T;
  }
  
  /**
   * Convertit des données d'entité en propriétés Notion
   * 
   * @param data Données d'entité
   * @returns Propriétés Notion
   */
  protected dataToProperties(data: CreateDataType | UpdateDataType): any {
    // Implémentation de base, à surcharger dans les classes dérivées
    return data;
  }
  
  /**
   * Génère des entités fictives pour le mode mock
   * 
   * @param filter Filtre optionnel pour les entités
   * @returns Promise résolvant vers un tableau d'entités
   */
  protected async getMockEntities(filter?: StandardFilterOptions): Promise<T[]> {
    // À implémenter dans les classes dérivées
    return Promise.resolve([]);
  }
  
  /**
   * Récupère une entité fictive par son ID pour le mode mock
   * 
   * @param id ID de l'entité
   * @returns Promise résolvant vers l'entité ou null si non trouvée
   */
  protected async getMockEntityById(id: string): Promise<T | null> {
    const entities = await this.getMockEntities();
    return entities.find(entity => entity.id === id) || null;
  }
  
  /**
   * Crée une entité fictive en mode mock
   * 
   * @param data Données pour la création
   * @returns Promise résolvant vers l'entité créée
   */
  protected async mockCreate(data: CreateDataType): Promise<T> {
    // À implémenter dans les classes dérivées
    return { id: generateMockId(), ...data as any } as T;
  }
  
  /**
   * Met à jour une entité fictive en mode mock
   * 
   * @param entity Entité à mettre à jour
   * @returns Promise résolvant vers l'entité mise à jour
   */
  protected async mockUpdate(entity: T): Promise<T> {
    // À implémenter dans les classes dérivées
    return Promise.resolve(entity);
  }
  
  /**
   * Supprime une entité fictive en mode mock
   * 
   * @param id ID de l'entité
   * @returns Promise résolvant vers true si la suppression a réussi
   */
  protected async mockDelete(id: string): Promise<boolean> {
    // À implémenter dans les classes dérivées
    return Promise.resolve(true);
  }
}
