import { notionApi } from '@/lib/notionProxy';
import { operationMode } from '@/services/operationMode';

class ProjectsService {
  private async withRealMode<T>(operation: () => Promise<T>): Promise<T> {
    const wasDemoMode = operationMode.isDemoMode;
    
    try {
      if (wasDemoMode) {
        operationMode.enableRealMode();
      }
      
      const result = await operation();
      
      return result;
    } finally {
      if (wasDemoMode) {
        operationMode.enableDemoMode('Retour après opération');
      }
    }
  }

  async getProject(id: string) {
    return this.withRealMode(async () => {
      const response = await notionApi.request(`/pages/${id}`);
      return response;
    });
  }

  async listProjects() {
    return this.withRealMode(async () => {
      const dbId = localStorage.getItem('notion_database_id');
      if (!dbId) throw new Error('Database ID not configured');
      
      const response = await notionApi.databases.query(dbId, {
        sorts: [{ property: 'Nom', direction: 'ascending' }]
      });
      
      return response;
    });
  }

  async createProject(project: any) {
    return this.withRealMode(async () => {
      const dbId = localStorage.getItem('notion_database_id');
      if (!dbId) throw new Error('Database ID not configured');

      const response = await notionApi.pages.create({
        parent: { database_id: dbId },
        properties: {
          Nom: { title: [{ text: { content: project.name } }] },
          Description: { rich_text: [{ text: { content: project.description } }] },
          URL: { url: project.url },
          Statut: { select: { name: project.status } },
        },
      });
      return response;
    });
  }

  async updateProject(id: string, updates: any) {
    return this.withRealMode(async () => {
      const response = await notionApi.pages.update(id, {
        properties: updates,
      });
      return response;
    });
  }

  async deleteProject(id: string) {
    return this.withRealMode(async () => {
      const response = await notionApi.pages.update(id, { archived: true });
      return response;
    });
  }
}

export const projectsService = new ProjectsService();
