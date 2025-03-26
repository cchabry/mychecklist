
/**
 * Implémentation de l'API Notion
 */

import { Project } from '@/types/domain';
import { notionService } from './notionService';

class NotionApiImplementation {
  /**
   * Récupère tous les projets
   */
  async getProjects(): Promise<Project[]> {
    const response = await notionService.getProjects();
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Erreur lors de la récupération des projets');
    }
    
    return response.data || [];
  }
  
  /**
   * Récupère un projet par son ID
   */
  async getProjectById(id: string): Promise<Project> {
    const response = await notionService.getProjectById(id);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || `Projet #${id} non trouvé`);
    }
    
    return response.data;
  }
  
  /**
   * Crée un nouveau projet
   */
  async createProject(data: Partial<Project>): Promise<Project> {
    const response = await notionService.createProject(data);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Erreur lors de la création du projet');
    }
    
    return response.data;
  }
  
  /**
   * Met à jour un projet existant
   */
  async updateProject(project: Project): Promise<Project> {
    const response = await notionService.updateProject(project);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || `Erreur lors de la mise à jour du projet #${project.id}`);
    }
    
    return response.data;
  }
  
  /**
   * Supprime un projet
   */
  async deleteProject(id: string): Promise<boolean> {
    const response = await notionService.deleteProject(id);
    
    if (!response.success) {
      throw new Error(response.error?.message || `Erreur lors de la suppression du projet #${id}`);
    }
    
    return true;
  }
}

// Exporter une instance singleton
export const notionApiImpl = new NotionApiImplementation();

// Export par défaut
export default notionApiImpl;
