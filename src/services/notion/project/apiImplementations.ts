
/**
 * Implémentations concrètes des services liés aux projets
 * Ces implémentations utilisent l'API Notion pour accéder aux données.
 */

import { notionClient } from '../notionClient';
import { Project } from '@/types/domain';
import { CreateProjectData, UpdateProjectData } from '@/types/api/domain/projectApi';
import { NotionConfig, NotionResponse } from '../types';
import { ProjectStatus } from '@/types/enums';

/**
 * Service Notion de base pour les projets
 */
class ProjectNotionService {
  private databaseId: string;

  constructor(config: NotionConfig) {
    if (!config?.apiKey || !config?.databases?.projects) {
      throw new Error("Missing Notion configuration");
    }
    this.databaseId = config.databases.projects;
  }

  /**
   * Récupère tous les projets depuis la base de données Notion
   */
  async getProjects(): Promise<NotionResponse<Project[]>> {
    try {
      const response = await notionClient.queryDatabase({
        database_id: this.databaseId,
      });

      const projects = response.results.map((row: any) => this.mapProject(row));

      return { success: true, data: projects };
    } catch (error: any) {
      console.error("Erreur lors de la récupération des projets:", error);
      return { success: false, error };
    }
  }

  /**
   * Récupère un projet par son ID depuis la base de données Notion
   */
  async getProjectById(id: string): Promise<NotionResponse<Project>> {
    try {
      if (!id) {
        throw new Error("ID de projet manquant");
      }

      const response = await notionClient.getPage({
        page_id: id,
      });

      const project = this.mapProject(response);

      return { success: true, data: project };
    } catch (error: any) {
      console.error(`Erreur lors de la récupération du projet avec l'ID ${id}:`, error);
      return { success: false, error };
    }
  }

  /**
   * Crée un nouveau projet dans la base de données Notion
   */
  async createProject(data: CreateProjectData): Promise<NotionResponse<Project>> {
    try {
      const response = await notionClient.createPage({
        parent: { database_id: this.databaseId },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: data.name,
                },
              },
            ],
          },
          URL: {
            url: data.url || null,
          },
          Description: {
            rich_text: [
              {
                text: {
                  content: data.description || '',
                },
              },
            ],
          },
          Status: {
            select: {
              name: ProjectStatus.Active,
            },
          },
        },
      });

      const project = this.mapProject(response);
      return { success: true, data: project };
    } catch (error: any) {
      console.error("Erreur lors de la création du projet:", error);
      return { success: false, error };
    }
  }

  /**
   * Met à jour un projet existant dans la base de données Notion
   */
  async updateProject(project: Project, data: UpdateProjectData): Promise<NotionResponse<Project>> {
    try {
      const response = await notionClient.updatePage({
        page_id: project.id,
        properties: {
          ...(data.name ? {
            Name: {
              title: [
                {
                  text: {
                    content: data.name,
                  },
                },
              ],
            },
          } : {}),
          ...(data.url !== undefined ? {
            URL: {
              url: data.url || null,
            },
          } : {}),
          ...(data.description !== undefined ? {
            Description: {
              rich_text: [
                {
                  text: {
                    content: data.description || '',
                  },
                },
              ],
            },
          } : {}),
          ...(data.status ? {
            Status: {
              select: {
                name: data.status,
              },
            },
          } : {}),
        },
      });

      const updatedProject = this.mapProject(response);
      return { success: true, data: updatedProject };
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour du projet avec l'ID ${project.id}:`, error);
      return { success: false, error };
    }
  }

  /**
   * Supprime un projet de la base de données Notion
   */
  async deleteProject(id: string): Promise<NotionResponse<boolean>> {
    try {
      await notionClient.deleteBlock({
        block_id: id,
      });

      return { success: true, data: true };
    } catch (error: any) {
      console.error(`Erreur lors de la suppression du projet avec l'ID ${id}:`, error);
      return { success: false, error };
    }
  }

  /**
   * Map une réponse Notion en un objet Project
   */
  private mapProject(row: any): Project {
    return {
      id: row.id,
      name: row.properties.Name.title[0]?.plain_text || 'Sans nom',
      url: row.properties.URL.url || undefined,
      description: row.properties.Description.rich_text[0]?.plain_text || undefined,
      status: row.properties.Status.select?.name as ProjectStatus || ProjectStatus.Active,
      createdAt: row.created_time,
      updatedAt: row.last_edited_time,
    };
  }
}

// Exportation des fonctions d'API
export function getAllProjectsNotionImplementation(): Promise<NotionResponse<Project[]>> {
  const config = notionClient.getConfig();
  if (!config) {
    return Promise.resolve({ success: false, error: new Error("Configuration Notion non disponible") });
  }
  
  const service = new ProjectNotionService(config);
  return service.getProjects();
}

export function getProjectByIdNotionImplementation(id: string): Promise<NotionResponse<Project>> {
  const config = notionClient.getConfig();
  if (!config) {
    return Promise.resolve({ success: false, error: new Error("Configuration Notion non disponible") });
  }
  
  const service = new ProjectNotionService(config);
  return service.getProjectById(id);
}

export function createProjectNotionImplementation(data: CreateProjectData): Promise<NotionResponse<Project>> {
  const config = notionClient.getConfig();
  if (!config) {
    return Promise.resolve({ success: false, error: new Error("Configuration Notion non disponible") });
  }
  
  const service = new ProjectNotionService(config);
  return service.createProject(data);
}

export function updateProjectNotionImplementation(entity: { id: string } & UpdateProjectData): Promise<NotionResponse<Project>> {
  const config = notionClient.getConfig();
  if (!config) {
    return Promise.resolve({ success: false, error: new Error("Configuration Notion non disponible") });
  }
  
  const service = new ProjectNotionService(config);
  const { id, ...data } = entity;
  
  // Obtenir d'abord le projet
  return service.getProjectById(id).then(response => {
    if (!response.success || !response.data) {
      return response;
    }
    
    return service.updateProject(response.data, data);
  });
}

export function deleteProjectNotionImplementation(id: string): Promise<NotionResponse<boolean>> {
  const config = notionClient.getConfig();
  if (!config) {
    return Promise.resolve({ success: false, error: new Error("Configuration Notion non disponible") });
  }
  
  const service = new ProjectNotionService(config);
  return service.deleteProject(id);
}

// Mock data functions
export function mockGetProjects(): Project[] {
  return [
    {
      id: 'project-1',
      name: 'Site Corporate',
      url: 'https://example.com',
      description: 'Site vitrine de l\'entreprise',
      status: ProjectStatus.Active,
      progress: 75,
      createdAt: new Date(2023, 0, 15).toISOString(),
      updatedAt: new Date(2023, 3, 10).toISOString(),
      lastAuditDate: new Date(2023, 2, 5).toISOString(),
    },
    {
      id: 'project-2',
      name: 'Application Mobile',
      url: 'https://app.example.com',
      description: 'Application mobile pour iOS et Android',
      status: ProjectStatus.Pending,
      progress: 25,
      createdAt: new Date(2023, 1, 1).toISOString(),
      updatedAt: new Date(2023, 2, 1).toISOString(),
    },
    {
      id: 'project-3',
      name: 'Plateforme E-commerce',
      url: 'https://shop.example.com',
      description: 'Plateforme de vente en ligne',
      status: ProjectStatus.Completed,
      progress: 100,
      createdAt: new Date(2022, 11, 1).toISOString(),
      updatedAt: new Date(2023, 4, 1).toISOString(),
      lastAuditDate: new Date(2023, 3, 15).toISOString(),
    },
  ];
}

export function mockGetProjectById(id: string): Project | undefined {
  return mockGetProjects().find(project => project.id === id);
}

export function mockCreateProject(data: CreateProjectData): Project {
  return {
    id: `project-${Date.now()}`,
    name: data.name,
    url: data.url,
    description: data.description,
    status: ProjectStatus.Active,
    progress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function mockUpdateProject(entity: { id: string } & UpdateProjectData): Project {
  const { id, ...data } = entity;
  const existingProject = mockGetProjectById(id);
  
  if (!existingProject) {
    throw new Error(`Projet non trouvé: ${id}`);
  }

  return {
    ...existingProject,
    ...data,
    updatedAt: new Date().toISOString(),
  };
}

export function mockDeleteProject(id: string): boolean {
  const projectExists = mockGetProjectById(id) !== undefined;
  return projectExists;
}

// Exporter la classe également pour les cas où elle est nécessaire
export default ProjectNotionService;
