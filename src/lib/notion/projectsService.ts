
import { getNotionClient, testNotionConnection } from './notionClient';
import { ProjectData, ProjectsData } from './types';
import { mockProjects } from '../mockData';
import { notionApi } from '../notionProxy';

export const getProjectsFromNotion = async (): Promise<ProjectsData> => {
  console.info('Fetching projects from Notion, database ID:', localStorage.getItem('notion_database_id'));
  
  try {
    const { client, dbId } = getNotionClient();
    
    if (!client || !dbId) {
      console.error('Notion client or database ID is missing');
      return { projects: [] };
    }
    
    // Vérifier la connexion à l'API Notion
    if (!(await testNotionConnection(client))) {
      throw new Error('Failed to connect to Notion API');
    }
    
    // Si le mode mock est actif, retourner les données de test
    if (notionApi.mockMode.isActive()) {
      console.info('Using mock project data');
      return { projects: mockProjects };
    }
    
    // Récupérer la clé API
    const apiKey = localStorage.getItem('notion_api_key');
    if (!apiKey) {
      throw new Error('API key is missing');
    }
    
    // Utiliser notre proxy pour interroger la base de données
    const response = await notionApi.databases.query(dbId, {}, apiKey);
    
    if (!response || !response.results) {
      throw new Error('Invalid response from Notion API');
    }
    
    // Mapper les résultats en projets
    const projects: ProjectData[] = response.results.map((page: any) => {
      const properties = page.properties;
      
      return {
        id: page.id,
        title: properties.Name?.title?.[0]?.plain_text || 'Sans titre',
        description: properties.Description?.rich_text?.[0]?.plain_text || '',
        status: properties.Status?.select?.name || 'Non démarré',
        createdAt: new Date(page.created_time).toLocaleDateString(),
        updatedAt: new Date(page.last_edited_time).toLocaleDateString(),
        progress: properties.Progress?.number || 0
      };
    });
    
    return { projects };
  } catch (error) {
    console.error('Erreur lors de la récupération des projets depuis Notion:', error);
    
    // Si le mode mock est activé ou si c'est une erreur de type 'Failed to fetch', utiliser les données de test
    if (error.message?.includes('Failed to fetch') || notionApi.mockMode.isActive()) {
      console.info('Switching to mock data due to API error');
      notionApi.mockMode.activate();
      return { projects: mockProjects };
    }
    
    // Propager l'erreur pour d'autres types d'erreurs
    throw error;
  }
};
