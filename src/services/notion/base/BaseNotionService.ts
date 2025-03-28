
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
import { CrudService } from './types';

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
> implements CrudService<T, C, U, ID> {
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
}
