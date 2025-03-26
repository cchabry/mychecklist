
import { Project } from '@/lib/types';
import { BaseServiceAbstract } from './BaseServiceAbstract';
import { notionApi } from '@/lib/notionProxy';
import { QueryFilters } from './types';
import { operationMode } from '@/services/operationMode';

/**
 * Service pour la gestion des projets
 */
export class ProjectsService extends BaseServiceAbstract<Project> {
  constructor() {
    super('projects', {
      cacheTTL: 10 * 60 * 1000, // 10 minutes
    });
  }
  
  /**
   * Récupère un projet par son ID
   */
  protected async fetchById(id: string): Promise<Project | null> {
    try {
      return await notionApi.getProject(id);
    } catch (error) {
      console.error(`Erreur lors de la récupération du projet #${id}:`, error);
      return null;
    }
  }
  
  /**
   * Récupère tous les projets
   */
  protected async fetchAll(filters?: QueryFilters): Promise<Project[]> {
    try {
      const projects = await notionApi.getProjects();
      
      // Appliquer les filtres si nécessaire
      if (filters && Object.keys(filters).length > 0) {
        return this.applyFilters(projects, filters);
      }
      
      return projects;
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      return [];
    }
  }
  
  /**
   * Crée un nouveau projet
   */
  protected async createItem(data: Partial<Project>): Promise<Project> {
    if (!data.name) {
      throw new Error('Le nom du projet est requis');
    }
    
    return await notionApi.createProject({
      name: data.name,
      url: data.url || ''
    });
  }
  
  /**
   * Met à jour un projet existant
   */
  protected async updateItem(id: string, data: Partial<Project>): Promise<Project> {
    const existingProject = await this.fetchById(id);
    
    if (!existingProject) {
      throw new Error(`Projet #${id} non trouvé`);
    }
    
    return await notionApi.updateProject(id, {
      name: data.name || existingProject.name,
      url: data.url || existingProject.url
    });
  }
  
  /**
   * Supprime un projet
   */
  protected async deleteItem(id: string): Promise<boolean> {
    return await notionApi.deleteProject(id);
  }
  
  /**
   * Récupère les projets actifs (non archivés)
   */
  async getActiveProjects(): Promise<Project[]> {
    return this.getAll(undefined, { archived: false });
  }
  
  /**
   * Récupère les projets archivés
   */
  async getArchivedProjects(): Promise<Project[]> {
    return this.getAll(undefined, { archived: true });
  }
  
  /**
   * Méthode privée pour appliquer des filtres aux projets
   */
  private applyFilters(projects: Project[], filters: QueryFilters): Project[] {
    return projects.filter(project => {
      // Vérifier chaque filtre
      return Object.entries(filters).every(([key, value]) => {
        // Si la valeur du filtre est undefined, ignorer ce filtre
        if (value === undefined) return true;
        
        // @ts-ignore - Nous savons que la clé peut exister sur l'objet
        const projectValue = project[key];
        
        // Gestion des différents types de valeurs
        if (Array.isArray(value)) {
          return value.includes(projectValue);
        }
        
        return projectValue === value;
      });
    });
  }
}

// Exporter une instance singleton du service
export const projectsService = new ProjectsService();
