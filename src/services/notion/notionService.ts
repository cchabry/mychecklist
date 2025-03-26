
import { NotionConfig, ConnectionTestResult, NotionResponse, ProjectsResponse, ProjectResponse, DeleteResponse } from './types';
import { Project } from '@/types/domain';

/**
 * Service principal pour l'intégration avec Notion
 */
class NotionService {
  private config: NotionConfig = {};
  private mockMode = false;

  /**
   * Vérifie si le service est configuré
   */
  isConfigured(): boolean {
    // Vérifier la configuration stockée dans localStorage
    const apiKey = localStorage.getItem('notion_api_key');
    const projectsDbId = localStorage.getItem('notion_database_id');
    
    return Boolean(apiKey && projectsDbId);
  }

  /**
   * Configure le service avec les paramètres fournis
   */
  configure(config: NotionConfig): void {
    this.config = { ...config };
    
    // Stocker la configuration dans localStorage si les valeurs sont définies
    if (config.apiKey) {
      localStorage.setItem('notion_api_key', config.apiKey);
    }
    
    if (config.projectsDbId) {
      localStorage.setItem('notion_database_id', config.projectsDbId);
    }
    
    if (config.checklistsDbId) {
      localStorage.setItem('notion_checklists_database_id', config.checklistsDbId);
    }
    
    if (config.mockMode !== undefined) {
      this.mockMode = config.mockMode;
    }
  }

  /**
   * Récupère la configuration actuelle
   */
  getConfig(): NotionConfig {
    return {
      apiKey: localStorage.getItem('notion_api_key') || '',
      projectsDbId: localStorage.getItem('notion_database_id') || '',
      checklistsDbId: localStorage.getItem('notion_checklists_database_id') || '',
      mockMode: this.mockMode
    };
  }

  /**
   * Active ou désactive le mode mock
   */
  setMockMode(enabled: boolean): void {
    this.mockMode = enabled;
    localStorage.setItem('notion_mock_mode', enabled ? 'true' : 'false');
  }

  /**
   * Vérifie si le mode mock est actif
   */
  isMockMode(): boolean {
    return this.mockMode || localStorage.getItem('notion_mock_mode') === 'true';
  }

  /**
   * Teste la connexion à l'API Notion
   */
  async testConnection(): Promise<ConnectionTestResult> {
    if (this.isMockMode()) {
      console.log('Test de connexion en mode démo');
      return {
        success: true,
        user: 'Utilisateur démo',
        workspaceName: 'Espace de travail démo',
        projectsDbName: 'Projets (démo)',
        checklistsDbName: 'Checklists (démo)'
      };
    }

    const apiKey = localStorage.getItem('notion_api_key');
    
    if (!apiKey) {
      return {
        success: false,
        error: 'Clé API manquante'
      };
    }

    try {
      console.log('Test de connexion à l\'API Notion avec la clé:', apiKey.substring(0, 5) + '...');
      
      // Simulation d'une requête à l'API Notion
      // Dans une application réelle, vous feriez un appel à l'API Notion ici
      const mockResponse = await new Promise<{name: string}>((resolve) => {
        setTimeout(() => {
          resolve({ name: 'Utilisateur test' });
        }, 1000);
      });
      
      console.log('Connexion à l\'API Notion réussie');
      
      return {
        success: true,
        user: mockResponse.name,
        workspaceName: 'Espace de travail',
        projectsDbName: 'Base de données des projets',
        checklistsDbName: localStorage.getItem('notion_checklists_database_id') ? 'Base de données des checklists' : undefined
      };
    } catch (error) {
      console.error('Erreur lors du test de connexion:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion à l\'API Notion'
      };
    }
  }

  /**
   * Récupère tous les projets
   */
  async getProjects(): Promise<ProjectsResponse> {
    if (this.isMockMode()) {
      // Retourner des données de démo en mode mock
      return {
        success: true,
        data: [
          {
            id: 'proj_001',
            name: 'Site e-commerce (démo)',
            url: 'https://example.com',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            progress: 75
          },
          {
            id: 'proj_002',
            name: 'Portail intranet (démo)',
            url: 'https://intranet.example.com',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            progress: 30
          },
          {
            id: 'proj_003',
            name: 'Application mobile (démo)',
            url: 'https://app.example.com',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            progress: 50
          }
        ]
      };
    }

    // Ici, nous devrions faire un appel réel à l'API Notion
    // Pour l'instant, on simule la réponse
    return {
      success: true,
      data: []
    };
  }

  /**
   * Récupère un projet par son ID
   */
  async getProjectById(id: string): Promise<ProjectResponse> {
    if (this.isMockMode()) {
      // Retourner des données de démo en mode mock
      return {
        success: true,
        data: {
          id,
          name: `Projet ${id} (démo)`,
          url: 'https://example.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          progress: 50
        }
      };
    }

    // Ici, nous devrions faire un appel réel à l'API Notion
    // Pour l'instant, on simule la réponse
    return {
      success: false,
      error: {
        message: 'Projet non trouvé'
      }
    };
  }

  /**
   * Crée un nouveau projet
   */
  async createProject(data: Partial<Project>): Promise<ProjectResponse> {
    if (this.isMockMode()) {
      // Simuler la création en mode mock
      return {
        success: true,
        data: {
          id: `proj_${Date.now()}`,
          name: data.name || 'Nouveau projet',
          url: data.url || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          progress: 0
        }
      };
    }

    // Ici, nous devrions faire un appel réel à l'API Notion
    // Pour l'instant, on simule la réponse
    return {
      success: true,
      data: {
        id: `proj_${Date.now()}`,
        name: data.name || 'Nouveau projet',
        url: data.url || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0
      }
    };
  }

  /**
   * Met à jour un projet existant
   */
  async updateProject(project: Project): Promise<ProjectResponse> {
    if (this.isMockMode()) {
      // Simuler la mise à jour en mode mock
      return {
        success: true,
        data: {
          ...project,
          updatedAt: new Date().toISOString()
        }
      };
    }

    // Ici, nous devrions faire un appel réel à l'API Notion
    // Pour l'instant, on simule la réponse
    return {
      success: true,
      data: {
        ...project,
        updatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Supprime un projet
   */
  async deleteProject(id: string): Promise<DeleteResponse> {
    if (this.isMockMode()) {
      // Simuler la suppression en mode mock
      return {
        success: true,
        data: true
      };
    }

    // Ici, nous devrions faire un appel réel à l'API Notion
    // Pour l'instant, on simule la réponse
    return {
      success: true,
      data: true
    };
  }
}

// Exporter une instance singleton
export const notionService = new NotionService();
