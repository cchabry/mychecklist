
/**
 * Interface pour l'API des projets
 */

import { Project } from '@/types/domain';

export interface ProjectApi {
  getProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project>;
  createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>;
  updateProject(project: Project): Promise<Project>;
  deleteProject(id: string): Promise<boolean>;
}
