
/**
 * Classe de base pour les services Notion
 * 
 * Cette classe fournit des fonctionnalités et abstractions communes
 * pour les services spécifiques aux entités, facilitant l'accès à l'API Notion.
 */

import { notionClient } from '../client/notionClient';
import { generateMockId } from './utils';
import { StandardFilterOptions, CrudService, NotionResponse } from './types';

/**
 * Classe de base pour les services manipulant des ressources via Notion.
 * 
 * Fournit les fonctionnalités CRUD communes et la gestion des entités.
 * 
 * @template T - Type de l'entité manipulée
 * @template CreateDataType - Type pour les données de création (par défaut: T sans id)
 * @template UpdateDataType - Type pour les données de mise à jour (par défaut: T partiel)
 */
export abstract class BaseNotionService<T, CreateDataType = Omit<T, 'id'>, UpdateDataType = Partial<T>> 
  implements CrudService<T, CreateDataType, UpdateDataType> {
  
  /**
   * Nom de la ressource pour les logs et identifieurs
   */
  protected abstract resourceName: string;
  
  /**
   * ID de la base de données dans Notion
   */
  protected abstract get databaseId(): string;
  
  /**
   * Convertit une réponse brute de l'API Notion en objet du modèle
   * @param raw Données brutes
   * @returns Objet du modèle
   */
  protected abstract mapNotionResponseToModel(raw: any): T;
  
  /**
   * Convertit un objet du modèle en payload pour l'API Notion
   * @param model Objet du modèle
   * @returns Payload pour Notion
   */
  protected abstract mapModelToNotionPayload(model: T): any;
  
  /**
   * Obtient l'ID de la base de données Notion depuis la configuration
   * @param configKey Clé de la configuration
   * @returns ID de la base ou null si non configuré
   */
  protected getDatabaseIdFromConfig(configKey: string): string | null {
    const config = notionClient.getConfig();
    if (!config) return null;
    
    return (config as any)[configKey] || null;
  }
  
  /**
   * Récupère toutes les entités
   * @param filter Options de filtrage
   * @returns Tableau d'entités
   */
  async getAll(filter: StandardFilterOptions = {}): Promise<T[]> {
    // Si on est en mode mock, simuler les données
    if (notionClient.isMockMode()) {
      return this.generateMockData(10, filter);
    }
    
    try {
      // Construire la requête de filtrage pour Notion
      const payload = this.buildFilterPayload(filter);
      
      // Effectuer la requête à l'API Notion
      const response = await notionClient.post(`/databases/${this.databaseId}/query`, payload);
      
      if (!response.success) {
        console.error(`Erreur lors de la récupération des ${this.resourceName}s:`, response.error);
        return [];
      }
      
      // Récupérer et convertir les résultats
      const results = response.data ? (response.data as any).results || [] : [];
      
      return results.map((item: any) => this.mapNotionResponseToModel(item));
    } catch (error) {
      console.error(`Erreur lors de la récupération des ${this.resourceName}s:`, error);
      return [];
    }
  }
  
  /**
   * Récupère une entité par son ID
   * @param id ID de l'entité
   * @returns Entité ou null si non trouvée
   */
  async getById(id: string): Promise<T | null> {
    // Si on est en mode mock, simuler les données
    if (notionClient.isMockMode()) {
      return this.generateMockItem(id);
    }
    
    try {
      // Effectuer la requête à l'API Notion
      const response = await notionClient.get(`/pages/${id}`);
      
      if (!response.success) {
        console.error(`Erreur lors de la récupération du ${this.resourceName} ${id}:`, response.error);
        return null;
      }
      
      return this.mapNotionResponseToModel(response.data);
    } catch (error) {
      console.error(`Erreur lors de la récupération du ${this.resourceName} ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Crée une nouvelle entité
   * @param data Données pour la création
   * @returns Entité créée
   */
  async create(data: CreateDataType): Promise<T> {
    // Si on est en mode mock, simuler la création
    if (notionClient.isMockMode()) {
      const mockId = generateMockId(this.resourceName);
      const mockData = {
        id: mockId,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as unknown as T;
      
      return mockData;
    }
    
    try {
      // Convertir les données pour Notion
      const payload = {
        parent: {
          database_id: this.databaseId
        },
        properties: this.mapCreateDataToNotionPayload(data)
      };
      
      // Effectuer la requête à l'API Notion
      const response = await notionClient.post('/pages', payload);
      
      if (!response.success) {
        throw new Error(`Erreur lors de la création du ${this.resourceName}: ${response.error?.message}`);
      }
      
      return this.mapNotionResponseToModel(response.data);
    } catch (error) {
      console.error(`Erreur lors de la création du ${this.resourceName}:`, error);
      throw error;
    }
  }
  
  /**
   * Met à jour une entité existante
   * @param data Entité avec les modifications
   * @returns Entité mise à jour
   */
  async update(data: T): Promise<T> {
    // Si on est en mode mock, simuler la mise à jour
    if (notionClient.isMockMode()) {
      return {
        ...data,
        updatedAt: new Date().toISOString()
      } as T;
    }
    
    try {
      // Extraire l'ID
      const id = (data as any).id;
      
      if (!id) {
        throw new Error(`ID manquant pour la mise à jour du ${this.resourceName}`);
      }
      
      // Convertir les données pour Notion
      const payload = {
        properties: this.mapModelToNotionPayload(data)
      };
      
      // Effectuer la requête à l'API Notion
      const response = await notionClient.patch(`/pages/${id}`, payload);
      
      if (!response.success) {
        throw new Error(`Erreur lors de la mise à jour du ${this.resourceName}: ${response.error?.message}`);
      }
      
      return this.mapNotionResponseToModel(response.data);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du ${this.resourceName}:`, error);
      throw error;
    }
  }
  
  /**
   * Supprime une entité
   * @param id ID de l'entité à supprimer
   * @returns true si la suppression a réussi
   */
  async delete(id: string): Promise<boolean> {
    // Si on est en mode mock, simuler la suppression
    if (notionClient.isMockMode()) {
      return true;
    }
    
    try {
      // Effectuer la requête à l'API Notion
      // Note: Notion archive les pages plutôt que de les supprimer
      const response = await notionClient.patch(`/pages/${id}`, {
        archived: true
      });
      
      if (!response.success) {
        throw new Error(`Erreur lors de la suppression du ${this.resourceName}: ${response.error?.message}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du ${this.resourceName} ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Convertit les données de création en payload Notion
   * Cette méthode par défaut peut être surchargée par les classes dérivées
   * @param data Données de création
   * @returns Payload pour Notion
   */
  protected mapCreateDataToNotionPayload(data: CreateDataType): any {
    // Par défaut, on considère qu'on peut utiliser la même logique
    // que pour une entité complète
    return this.mapModelToNotionPayload(data as unknown as T);
  }
  
  /**
   * Construit un payload de filtrage pour Notion
   * @param filter Options de filtrage
   * @returns Payload pour l'API Notion
   */
  protected buildFilterPayload(filter: StandardFilterOptions = {}): any {
    // Payload par défaut
    const payload: any = {};
    
    // Pagination
    if (filter.limit) {
      payload.page_size = filter.limit;
    }
    
    // Filtres spécifiques à l'entité
    if (this.hasEntitySpecificFilters(filter)) {
      payload.filter = this.buildEntityFilters(filter);
    }
    
    // Tri
    if (filter.sortBy) {
      payload.sorts = [
        {
          property: filter.sortBy,
          direction: filter.sortOrder || 'desc'
        }
      ];
    }
    
    return payload;
  }
  
  /**
   * Vérifie si des filtres spécifiques à l'entité sont présents
   * @param filter Options de filtrage
   * @returns true si des filtres spécifiques sont présents
   */
  protected hasEntitySpecificFilters(_filter: StandardFilterOptions): boolean {
    // À surcharger dans les classes dérivées
    return false;
  }
  
  /**
   * Construit les filtres spécifiques à l'entité
   * @param filter Options de filtrage
   * @returns Filtres pour l'API Notion
   */
  protected buildEntityFilters(_filter: StandardFilterOptions): any {
    // À surcharger dans les classes dérivées
    return {};
  }
  
  /**
   * Génère des données mock pour tests et démo
   * @param count Nombre d'éléments à générer
   * @param filter Filtres à appliquer
   * @returns Tableau d'entités mock
   */
  protected abstract generateMockData(count: number, filter?: StandardFilterOptions): T[];
  
  /**
   * Génère un élément mock spécifique par ID
   * @param id ID de l'élément
   * @returns Entité mock ou null
   */
  protected abstract generateMockItem(id: string): T | null;
  
  /**
   * Crée une réponse Notion réussie
   * @param data Données de la réponse
   * @returns Réponse Notion
   */
  protected createSuccessResponse<R>(data: R): NotionResponse<R> {
    return {
      success: true,
      data
    };
  }
  
  /**
   * Crée une réponse Notion d'erreur
   * @param message Message d'erreur
   * @param code Code d'erreur (optionnel)
   * @param status Statut HTTP (optionnel)
   * @returns Réponse Notion
   */
  protected createErrorResponse<R>(
    message: string,
    code?: string,
    status?: number
  ): NotionResponse<R> {
    return {
      success: false,
      error: {
        message,
        code,
        status
      }
    };
  }
}
