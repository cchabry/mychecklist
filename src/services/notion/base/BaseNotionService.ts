
/**
 * Service de base abstrait pour tous les services Notion
 * 
 * Cette classe fournit une base commune pour tous les services de domaine,
 * standardisant la façon dont ils interagissent avec l'API Notion et
 * offrant des implémentations par défaut pour les opérations communes.
 */

import { notionClient } from '../client/notionClient';
import { NotionResponse } from '../types';
import { ErrorType } from '@/types/error';
import { CrudService, StandardFilterOptions } from './types';

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
  C extends Partial<Omit<T, 'id'>>,
  U = T,
  ID = string
> implements Partial<CrudService<T, C, U, ID>> {
  /**
   * Nom du service (pour le débogage et les logs)
   */
  protected readonly serviceName: string;
  
  /**
   * Clé de base de données dans la configuration
   */
  protected readonly dbConfigKey: keyof Record<string, string>;
  
  /**
   * Constructeur
   * 
   * @param serviceName Nom du service pour le débogage
   * @param dbConfigKey Clé de la base de données dans la configuration
   */
  constructor(serviceName: string, dbConfigKey: string) {
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
  async getAll(options?: StandardFilterOptions<T>): Promise<NotionResponse<T[]>> {
    const configError = this.checkConfig();
    if (configError) return configError;
    
    try {
      if (this.isMockMode()) {
        // L'implémentation doit être dans les classes dérivées
        const entities = await this.getMockEntities();
        
        // Appliquer le filtrage si des options sont fournies
        const filteredEntities = options?.filter
          ? entities.filter(options.filter)
          : entities;
        
        return {
          success: true,
          data: filteredEntities
        };
      } else {
        // L'implémentation doit être dans les classes dérivées
        return await this.getAllImpl();
      }
    } catch (e: unknown) {
      console.error(`${this.serviceName}.getAll error:`, e);
      return {
        success: false,
        error: {
          message: `Erreur lors de la récupération des ${this.serviceName}`,
          details: e
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
    
    try {
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
      } else {
        return await this.getByIdImpl(id);
      }
    } catch (e: unknown) {
      console.error(`${this.serviceName}.getById error:`, e);
      return {
        success: false,
        error: {
          message: `Erreur lors de la récupération du ${this.serviceName} #${String(id)}`,
          details: e
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
    
    try {
      if (this.isMockMode()) {
        // Mode mock
        const newEntity = await this.mockCreate(data);
        
        return {
          success: true,
          data: newEntity
        };
      } else {
        // Mode API
        return await this.createImpl(data);
      }
    } catch (e: unknown) {
      console.error(`${this.serviceName}.create error:`, e);
      return {
        success: false,
        error: {
          message: `Erreur lors de la création du ${this.serviceName}: ${e instanceof Error ? e.message : String(e)}`,
          details: e
        }
      };
    }
  }
  
  /**
   * Met à jour une entité existante
   * 
   * @param entity Entité à mettre à jour
   * @returns Promesse résolvant vers une réponse contenant l'entité mise à jour
   */
  async update(entity: U): Promise<NotionResponse<T>> {
    const configError = this.checkConfig();
    if (configError) return configError;
    
    try {
      if (this.isMockMode()) {
        // Mode mock
        const updatedEntity = await this.mockUpdate(entity);
        
        return {
          success: true,
          data: updatedEntity
        };
      } else {
        // Mode API
        return await this.updateImpl(entity);
      }
    } catch (e: unknown) {
      console.error(`${this.serviceName}.update error:`, e);
      return {
        success: false,
        error: {
          message: `Erreur lors de la mise à jour du ${this.serviceName}: ${e instanceof Error ? e.message : String(e)}`,
          details: e
        }
      };
    }
  }
  
  /**
   * Supprime une entité
   * 
   * @param id Identifiant de l'entité à supprimer
   * @returns Promesse résolvant vers une réponse indiquant le succès ou l'échec
   */
  async delete(id: ID): Promise<NotionResponse<boolean>> {
    const configError = this.checkConfig();
    if (configError) return configError;
    
    try {
      if (this.isMockMode()) {
        // Mode mock - simuler une suppression réussie
        return {
          success: true,
          data: true
        };
      } else {
        // Mode API
        return await this.deleteImpl(id);
      }
    } catch (e: unknown) {
      console.error(`${this.serviceName}.delete error:`, e);
      return {
        success: false,
        error: {
          message: `Erreur lors de la suppression du ${this.serviceName} #${String(id)}: ${e instanceof Error ? e.message : String(e)}`,
          details: e
        }
      };
    }
  }
  
  /**
   * Méthodes abstraites qui doivent être implémentées par les sous-classes
   */
  protected abstract getMockEntities(): Promise<T[]>;
  protected abstract mockCreate(data: C): Promise<T>;
  protected abstract mockUpdate(entity: U): Promise<T>;
  protected abstract getAllImpl(): Promise<NotionResponse<T[]>>;
  protected abstract getByIdImpl(id: ID): Promise<NotionResponse<T>>;
  protected abstract createImpl(data: C): Promise<NotionResponse<T>>;
  protected abstract updateImpl(entity: U): Promise<NotionResponse<T>>;
  protected abstract deleteImpl(id: ID): Promise<NotionResponse<boolean>>;
}
