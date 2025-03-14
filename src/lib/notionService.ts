
import { Client } from '@notionhq/client';
import { Audit, AuditItem, Project } from './types';
import { toast } from 'sonner';

// Initialiser le client Notion
const notionClient = new Client({
  auth: import.meta.env.VITE_NOTION_API_KEY || localStorage.getItem('NOTION_API_KEY'),
});

// ID de la base de données Notion contenant les projets
const databaseId = import.meta.env.VITE_NOTION_DATABASE_ID || localStorage.getItem('NOTION_DATABASE_ID');

export const getProjects = async (): Promise<Project[]> => {
  try {
    if (!databaseId) {
      throw new Error('ID de base de données Notion non configuré');
    }
    
    const response = await notionClient.databases.query({
      database_id: databaseId,
    });
    
    return response.results.map((page: any) => ({
      id: page.id,
      name: page.properties.Name?.title[0]?.plain_text || 'Projet sans nom',
      url: page.properties.URL?.url || '#',
      createdAt: page.created_time,
      updatedAt: page.last_edited_time,
      progress: page.properties.Progress?.number || 0,
      itemsCount: page.properties.ItemsCount?.number || 0,
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des projets depuis Notion:', error);
    toast.error('Erreur de connexion à Notion', { 
      description: 'Impossible de récupérer les projets'
    });
    return [];
  }
};

export const getProjectById = async (projectId: string): Promise<Project | null> => {
  try {
    if (!projectId) return null;
    
    const page = await notionClient.pages.retrieve({ page_id: projectId });
    
    return {
      id: page.id,
      name: (page as any).properties.Name?.title[0]?.plain_text || 'Projet sans nom',
      url: (page as any).properties.URL?.url || '#',
      createdAt: page.created_time,
      updatedAt: page.last_edited_time,
      progress: (page as any).properties.Progress?.number || 0,
      itemsCount: (page as any).properties.ItemsCount?.number || 0,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du projet depuis Notion:', error);
    toast.error('Erreur de connexion à Notion', { 
      description: 'Impossible de récupérer les détails du projet'
    });
    return null;
  }
};

export const getAuditForProject = async (projectId: string): Promise<Audit | null> => {
  try {
    // Récupérer les éléments d'audit depuis une sous-page ou un bloc enfant dans Notion
    const response = await notionClient.blocks.children.list({
      block_id: projectId,
    });
    
    // Extraire les données d'audit depuis les blocs enfants
    const auditItems: AuditItem[] = response.results
      .filter((block: any) => block.type === 'paragraph' || block.type === 'to_do')
      .map((block: any, index) => ({
        id: block.id,
        title: block.type === 'paragraph' 
          ? block.paragraph.rich_text[0]?.plain_text || `Item ${index + 1}` 
          : block.to_do.rich_text[0]?.plain_text || `Item ${index + 1}`,
        description: block.type === 'paragraph'
          ? block.paragraph.rich_text[1]?.plain_text || 'Description non disponible'
          : 'Élément à vérifier',
        category: 'Accessibilité', // Catégorie par défaut, à améliorer
        status: block.type === 'to_do' && block.to_do.checked 
          ? 'compliant' 
          : 'not-evaluated',
      }));
    
    return {
      id: `audit-${projectId}`,
      projectId,
      items: auditItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      score: 0,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'audit depuis Notion:', error);
    toast.error('Erreur de connexion à Notion', { 
      description: 'Impossible de récupérer les éléments d\'audit'
    });
    return null;
  }
};

export const saveAuditToNotion = async (audit: Audit): Promise<boolean> => {
  try {
    // Mettre à jour le statut des éléments dans Notion
    for (const item of audit.items) {
      if (item.id.includes('item-')) {
        // Pour les nouveaux éléments sans ID Notion valide, créer de nouveaux blocs
        await notionClient.blocks.children.append({
          block_id: audit.projectId,
          children: [{
            object: 'block',
            type: 'to_do',
            to_do: {
              rich_text: [{ type: 'text', text: { content: item.title } }],
              checked: item.status === 'compliant',
              color: 'default',
            },
          }],
        });
      } else {
        // Pour les éléments existants, mettre à jour
        await notionClient.blocks.update({
          block_id: item.id,
          type: 'to_do',
          to_do: {
            rich_text: [{ type: 'text', text: { content: item.title } }],
            checked: item.status === 'compliant',
          },
        });
      }
    }
    
    // Mettre à jour les propriétés de la page du projet
    await notionClient.pages.update({
      page_id: audit.projectId,
      properties: {
        Progress: { number: audit.score },
        UpdatedAt: { date: { start: new Date().toISOString() } },
      },
    });
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'audit dans Notion:', error);
    toast.error('Erreur de connexion à Notion', { 
      description: 'Impossible de sauvegarder les modifications'
    });
    return false;
  }
};

// Configuration initiale de l'intégration Notion
export const configureNotion = (apiKey: string, dbId: string): boolean => {
  try {
    localStorage.setItem('NOTION_API_KEY', apiKey);
    localStorage.setItem('NOTION_DATABASE_ID', dbId);
    
    // Réinitialiser le client avec la nouvelle clé API
    Object.assign(notionClient, new Client({ auth: apiKey }));
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la configuration de Notion:', error);
    return false;
  }
};

// Vérifier si Notion est configuré
export const isNotionConfigured = (): boolean => {
  return !!(import.meta.env.VITE_NOTION_API_KEY || localStorage.getItem('NOTION_API_KEY')) && 
         !!(import.meta.env.VITE_NOTION_DATABASE_ID || localStorage.getItem('NOTION_DATABASE_ID'));
};
