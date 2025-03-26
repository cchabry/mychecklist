
import { v4 as uuidv4 } from 'uuid';
import { Project, Audit } from '@/types/domain';
import { NotionResponse, NotionConfig, ConnectionTestResult } from './types';
import { mockProjects, mockResponseForProjectId } from './mockData';

/**
 * Service principal de Notion pour l'application
 */
class NotionService {
  private apiKey: string | null = null;
  private mockMode: boolean = false;
  
  constructor() {
    this.mockMode = localStorage.getItem('notion_mock_mode') === 'true';
  }
  
  /**
   * Définit la clé API Notion
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    localStorage.setItem('notion_api_key', apiKey);
  }
  
  /**
   * Récupère la clé API Notion
   */
  getApiKey(): string | null {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('notion_api_key');
    }
    return this.apiKey;
  }
  
  /**
   * Définit le mode mock
   */
  setMockMode(enabled: boolean): void {
    this.mockMode = enabled;
    localStorage.setItem('notion_mock_mode', enabled.toString());
  }
  
  /**
   * Vérifie si le mode mock est activé
   */
  isMockMode(): boolean {
    return this.mockMode;
  }
  
  /**
   * Teste la connexion à l'API Notion
   */
  async testConnection(): Promise<ConnectionTestResult> {
    if (this.mockMode) {
      return {
        success: true,
        user: 'Utilisateur Demo',
        workspaceName: 'Espace de travail Demo',
        projectsDbName: 'Projets',
        checklistsDbName: 'Checklist'
      };
    }
    
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Clé API manquante'
      };
    }
    
    // Ici, nous ferions un vrai appel à l'API Notion
    return {
      success: true,
      user: 'Utilisateur Notion',
      workspaceName: 'Mon espace de travail'
    };
  }
  
  /**
   * Récupère tous les projets
   */
  async getProjects(): Promise<NotionResponse<Project[]>> {
    if (this.mockMode) {
      return {
        success: true,
        data: mockProjects
      };
    }
    
    if (!this.apiKey) {
      return {
        success: false,
        error: {
          message: 'API key not set'
        }
      };
    }
    
    // Ici, nous ferions un vrai appel à l'API Notion
    return {
      success: true,
      data: []
    };
  }
  
  /**
   * Récupère un projet par son ID
   */
  async getProjectById(id: string): Promise<NotionResponse<Project>> {
    if (this.mockMode) {
      return mockResponseForProjectId(id);
    }
    
    if (!this.apiKey) {
      return {
        success: false,
        error: {
          message: 'API key not set'
        }
      };
    }
    
    // Ici, nous ferions un vrai appel à l'API Notion
    return {
      success: false,
      error: {
        message: 'Project not found'
      }
    };
  }
  
  /**
   * Crée un nouveau projet
   */
  async createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotionResponse<Project>> {
    const newProject: Project = {
      id: uuidv4(),
      name: project.name,
      url: project.url,
      description: project.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      pagesCount: 0,
      itemsCount: 0
    };
    
    if (this.mockMode) {
      mockProjects.push(newProject);
      return {
        success: true,
        data: newProject
      };
    }
    
    if (!this.apiKey) {
      return {
        success: false,
        error: {
          message: 'API key not set'
        }
      };
    }
    
    // Ici, nous ferions un vrai appel à l'API Notion
    return {
      success: true,
      data: newProject
    };
  }
  
  /**
   * Met à jour un projet existant
   */
  async updateProject(project: Project): Promise<NotionResponse<Project>> {
    const updatedProject: Project = {
      ...project,
      updatedAt: new Date().toISOString()
    };
    
    if (this.mockMode) {
      const index = mockProjects.findIndex(p => p.id === project.id);
      if (index !== -1) {
        mockProjects[index] = updatedProject;
        return {
          success: true,
          data: updatedProject
        };
      }
      return {
        success: false,
        error: {
          message: 'Project not found'
        }
      };
    }
    
    if (!this.apiKey) {
      return {
        success: false,
        error: {
          message: 'API key not set'
        }
      };
    }
    
    // Ici, nous ferions un vrai appel à l'API Notion
    return {
      success: true,
      data: updatedProject
    };
  }
  
  /**
   * Supprime un projet
   */
  async deleteProject(id: string): Promise<NotionResponse<boolean>> {
    if (this.mockMode) {
      const index = mockProjects.findIndex(p => p.id === id);
      if (index !== -1) {
        mockProjects.splice(index, 1);
        return {
          success: true,
          data: true
        };
      }
      return {
        success: false,
        error: {
          message: 'Project not found'
        }
      };
    }
    
    if (!this.apiKey) {
      return {
        success: false,
        error: {
          message: 'API key not set'
        }
      };
    }
    
    // Ici, nous ferions un vrai appel à l'API Notion
    return {
      success: true,
      data: true
    };
  }
  
  /**
   * Récupère les audits d'un projet
   */
  async getAudits(projectId: string): Promise<NotionResponse<Audit[]>> {
    if (this.mockMode) {
      // Mock data pour les audits
      const mockAudits: Audit[] = [
        {
          id: `audit-${projectId}-1`,
          projectId,
          name: 'Audit initial',
          description: 'Premier audit du projet',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 68,
          itemsCount: 25
        },
        {
          id: `audit-${projectId}-2`,
          projectId,
          name: 'Audit de suivi',
          description: 'Audit de suivi après corrections',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          progress: 85,
          itemsCount: 25
        }
      ];
      
      return {
        success: true,
        data: mockAudits
      };
    }
    
    if (!this.apiKey) {
      return {
        success: false,
        error: {
          message: 'API key not set'
        }
      };
    }
    
    // Ici, nous ferions un vrai appel à l'API Notion
    return {
      success: true,
      data: []
    };
  }
  
  /**
   * Crée un nouvel audit
   */
  async createAudit(audit: Omit<Audit, 'id'>): Promise<NotionResponse<Audit>> {
    const newAudit: Audit = {
      id: uuidv4(),
      ...audit,
      progress: 0,
      itemsCount: 0
    };
    
    if (this.mockMode) {
      return {
        success: true,
        data: newAudit
      };
    }
    
    if (!this.apiKey) {
      return {
        success: false,
        error: {
          message: 'API key not set'
        }
      };
    }
    
    // Ici, nous ferions un vrai appel à l'API Notion
    return {
      success: true,
      data: newAudit
    };
  }
}

// Exporter une instance singleton
export const notionService = new NotionService();
