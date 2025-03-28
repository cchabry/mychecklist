/**
 * Service de base abstrait pour tous les services Notion
 * 
 * Cette classe fournit une base commune pour tous les services de domaine,
 * standardisant la façon dont ils interagissent avec l'API Notion et
 * offrant des implémentations par défaut pour les opérations communes.
 */

import { notionClient } from '../client/notionClient';
import { NotionResponse, NotionConfig } from '../types';
import { ErrorType } from '@/types/error';

/**
 * Service Notion de base générique
 * 
 * @template T - Type d'entité principale du service
 * @template C - Type pour la création d'entité (Create)
 * @template U - Type pour la mise à jour d'entité (Update) (par défaut: T)
 * @template ID - Type d'identifiant (par défaut: string)
 */
export abstract class BaseNotionService<
  T extends { id: ID },
  C extends Omit<T, 'id'>,
  U = T,
  ID = string
> {
  /**
   * Nom du service (pour le débogage et les logs)
   */
  protected readonly serviceName: string;
  
  /**
   * Clé de base de données dans la configuration
   */
  protected readonly dbConfigKey: keyof NotionConfig;
  
  /**
   * Constructeur
   * 
   * @param serviceName Nom du service pour le débogage
   * @param dbConfigKey Clé de la base de données dans la configuration
   */
  constructor(serviceName: string, dbConfigKey: keyof NotionConfig) {
    this.serviceName = serviceName;
    this.dbConfigKey = dbConfigKey;
  }
  
  /**
   * Vérifie si la configuration est disponible
   * 
   * @returns Réponse d'erreur si la configuration est manquante, undefined sinon
   */
  protected checkConfig(): NotionResponse<never> | undefined {
    const config = notionClient.getConfig();
    
    if (!config) {
      return { 
        success: false, 
        error: { message: "Configuration Notion non disponible" } 
      };
    }
    
    if (!config[this.dbConfigKey]) {
      return { 
        success: false, 
        error: { 
          message: `Base de données ${String(this.dbConfigKey)} non configurée`,
          code: ErrorType.NOT_CONFIGURED
        } 
      };
    }
    
    return undefined;
  }
  
  /**
   * Vérifie si le client est en mode mock
   * 
   * @returns true si le client est en mode mock
   */
  protected isMockMode(): boolean {
    return notionClient.isMockMode();
  }
  
  /**
   * Récupère toutes les entités avec filtres optionnels
   * 
   * @param filter Filtre(s) optionnel(s)
   * @returns Promesse résolvant vers une réponse contenant les entités
   */
  async getAll(filter?: Record<string, any>): Promise<NotionResponse<T[]>> {
    const configError = this.checkConfig();
    if (configError) return configError;
    
    if (this.isMockMode()) {
      return {
        success: true,
        data: await this.getMockEntities(filter)
      };
    }
    
    try {
      return await this.getAllImpl(filter);
    } catch (error) {
      console.error(`${this.serviceName}.getAll error:`, error);
      return {
        success: false,
        error: {
          message: `Erreur lors de la récupération des ${this.serviceName}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Récupère une entité par son identifiant
   * 
   * @param id Identifiant de l'entité
   * @returns Promesse résolvant vers une réponse contenant l'entité
   */
  async getById(id: ID): Promise<NotionResponse<T>> {
    const configError = this.checkConfig();
    if (configError) return configError;
    
    if (this.isMockMode()) {
      const mockEntities = await this.getMockEntities();
      const entity = mockEntities.find(e => e.id === id);
      
      if (!entity) {
        return { 
          success: false, 
          error: { 
            message: `${this.serviceName} #${String(id)} non trouvé`,
            code: ErrorType.NOT_FOUND
          } 
        };
      }
      
      return {
        success: true,
        data: entity
      };
    }
    
    try {
      return await this.getByIdImpl(id);
    } catch (error) {
      console.error(`${this.serviceName}.getById error:`, error);
      return {
        success: false,
        error: {
          message: `Erreur lors de la récupération du ${this.serviceName} #${String(id)}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Crée une nouvelle entité
   * 
   * @param data Données pour la création
   * @returns Promesse résolvant vers une réponse contenant l'entité créée
   */
  async create(data: C): Promise<NotionResponse<T>> {
    const configError = this.checkConfig();
    if (configError) return configError;
    
    if (this.isMockMode()) {
      return {
        success: true,
        data: await this.mockCreate(data)
      };
    }
    
    try {
      return await this.createImpl(data);
    } catch (error) {
      console.error(`${this.serviceName}.create error:`, error);
      return {
        success: false,
        error: {
          message: `Erreur lors de la création du ${this.serviceName}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Met à jour une entité existante
   * 
   * @param entity Entité avec les modifications
   * @returns Promesse résolvant vers une réponse contenant l'entité mise à jour
   */
  async update(entity: U): Promise<NotionResponse<T>> {
    const configError = this.checkConfig();
    if (configError) return configError;
    
    if (this.isMockMode()) {
      return {
        success: true,
        data: await this.mockUpdate(entity)
      };
    }
    
    try {
      return await this.updateImpl(entity);
    } catch (error) {
      console.error(`${this.serviceName}.update error:`, error);
      return {
        success: false,
        error: {
          message: `Erreur lors de la mise à jour du ${this.serviceName}`,
          details: error
        }
      };
    }
  }
  
  /**
   * Supprime une entité
   * 
   * @param id Identifiant de l'entité
   * @returns Promesse résolvant vers une réponse indiquant le succès
   */
  async delete(id: ID): Promise<NotionResponse<boolean>> {
    const configError = this.checkConfig();
    if (configError) return configError;
    
    if (this.isMockMode()) {
      return {
        success: true,
        data: true
      };
    }
    
    try {
      return await this.deleteImpl(id);
    } catch (error) {
      console.error(`${this.serviceName}.delete error:`, error);
      return {
        success: false,
        error: {
          message: `Erreur lors de la suppression du ${this.serviceName} #${String(id)}`,
          details: error
        }
      };
    }
  }
  
  // Méthodes abstraites à implémenter par les services spécifiques
  
  /**
   * Génère des entités fictives pour le mode mock
   * @param filter Filtre(s) optionnel(s)
   */
  protected abstract getMockEntities(filter?: Record<string, any>): Promise<T[]>;
  
  /**
   * Crée une entité fictive en mode mock
   * @param data Données pour la création
   */
  protected abstract mockCreate(data: C): Promise<T>;
  
  /**
   * Met à jour une entité fictive en mode mock
   * @param entity Entité avec les modifications
   */
  protected abstract mockUpdate(entity: U): Promise<T>;
  
  /**
   * Implémentation de la récupération des entités
   * @param filter Filtre(s) optionnel(s)
   */
  protected abstract getAllImpl(filter?: Record<string, any>): Promise<NotionResponse<T[]>>;
  
  /**
   * Implémentation de la récupération d'une entité par son identifiant
   * @param id Identifiant de l'entité
   */
  protected abstract getByIdImpl(id: ID): Promise<NotionResponse<T>>;
  
  /**
   * Implémentation de la création d'une entité
   * @param data Données pour la création
   */
  protected abstract createImpl(data: C): Promise<NotionResponse<T>>;
  
  /**
   * Implémentation de la mise à jour d'une entité
   * @param entity Entité avec les modifications
   */
  protected abstract updateImpl(entity: U): Promise<NotionResponse<T>>;
  
  /**
   * Implémentation de la suppression d'une entité
   * @param id Identifiant de l'entité
   */
  protected abstract deleteImpl(id: ID): Promise<NotionResponse<boolean>>;
}

/**
 * Type pour les options de filtrage standard
 */
export interface StandardFilterOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

/**
 * Interface pour un service CRUD de base
 */
export interface CrudService<T, C = Omit<T, 'id'>, U = T, ID = string> {
  getAll(filter?: Record<string, any>): Promise<NotionResponse<T[]>>;
  getById(id: ID): Promise<NotionResponse<T>>;
  create(data: C): Promise<NotionResponse<T>>;
  update(entity: U): Promise<NotionResponse<T>>;
  delete(id: ID): Promise<NotionResponse<boolean>>;
}

/**
 * Utilitaire pour générer un ID mock
 * @param prefix Préfixe pour l'ID
 * @returns ID unique basé sur un timestamp
 */
export function generateMockId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
