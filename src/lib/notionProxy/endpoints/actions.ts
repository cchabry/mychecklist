
import { CorrectiveAction, ActionPriority, ActionStatus } from '@/lib/types';
import { mockData } from '../mock/data';
import { mockMode } from '../mockMode';
import { notionApiRequest } from '../proxyFetch';

/**
 * Récupère toutes les actions correctives
 */
export async function getActions(): Promise<CorrectiveAction[]> {
  // En mode mock, retourner des données fictives
  if (mockMode.isActive()) {
    return mockData.getActions();
  }
  
  // Implémentation réelle avec l'API Notion
  try {
    const response = await notionApiRequest<{ results: any[] }>('/databases/actions/query', 'POST', {});
    
    // Mapper les résultats de Notion vers notre format d'action corrective
    return response.results.map(item => ({
      id: item.id,
      evaluationId: item.properties.evaluationId?.rich_text?.[0]?.text?.content || '',
      targetScore: item.properties.targetScore?.select?.name || '',
      priority: item.properties.priority?.select?.name as ActionPriority || ActionPriority.MEDIUM,
      dueDate: item.properties.dueDate?.date?.start || '',
      responsible: item.properties.responsible?.rich_text?.[0]?.text?.content || '',
      comment: item.properties.comment?.rich_text?.[0]?.text?.content || '',
      status: item.properties.status?.select?.name as ActionStatus || ActionStatus.TODO,
      progress: item.properties.progress?.number || 0
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des actions correctives:', error);
    throw error;
  }
}

/**
 * Récupère une action corrective par son ID
 */
export async function getAction(id: string): Promise<CorrectiveAction | null> {
  // En mode mock, retourner des données fictives
  if (mockMode.isActive()) {
    return mockData.getAction(id);
  }
  
  // Implémentation réelle avec l'API Notion
  try {
    const response = await notionApiRequest(`/pages/${id}`, 'GET');
    
    // Vérifier si la page existe
    if (!response) {
      return null;
    }
    
    // Mapper les résultats de Notion vers notre format d'action corrective
    return {
      id: response.id,
      evaluationId: response.properties.evaluationId?.rich_text?.[0]?.text?.content || '',
      targetScore: response.properties.targetScore?.select?.name || '',
      priority: response.properties.priority?.select?.name as ActionPriority || ActionPriority.MEDIUM,
      dueDate: response.properties.dueDate?.date?.start || '',
      responsible: response.properties.responsible?.rich_text?.[0]?.text?.content || '',
      comment: response.properties.comment?.rich_text?.[0]?.text?.content || '',
      status: response.properties.status?.select?.name as ActionStatus || ActionStatus.TODO,
      progress: response.properties.progress?.number || 0
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'action corrective ${id}:`, error);
    return null;
  }
}

/**
 * Récupère les actions correctives pour une évaluation spécifique
 */
export async function getActionsByEvaluationId(evaluationId: string): Promise<CorrectiveAction[]> {
  // En mode mock, retourner des données fictives
  if (mockMode.isActive()) {
    return mockData.getActions().filter(action => action.evaluationId === evaluationId);
  }
  
  // Implémentation réelle avec l'API Notion
  try {
    const response = await notionApiRequest<{ results: any[] }>('/databases/actions/query', 'POST', {
      filter: {
        property: 'evaluationId',
        rich_text: {
          equals: evaluationId
        }
      }
    });
    
    // Mapper les résultats de Notion vers notre format d'action corrective
    return response.results.map(item => ({
      id: item.id,
      evaluationId: item.properties.evaluationId?.rich_text?.[0]?.text?.content || '',
      targetScore: item.properties.targetScore?.select?.name || '',
      priority: item.properties.priority?.select?.name as ActionPriority || ActionPriority.MEDIUM,
      dueDate: item.properties.dueDate?.date?.start || '',
      responsible: item.properties.responsible?.rich_text?.[0]?.text?.content || '',
      comment: item.properties.comment?.rich_text?.[0]?.text?.content || '',
      status: item.properties.status?.select?.name as ActionStatus || ActionStatus.TODO,
      progress: item.properties.progress?.number || 0
    }));
  } catch (error) {
    console.error(`Erreur lors de la récupération des actions correctives pour l'évaluation ${evaluationId}:`, error);
    throw error;
  }
}

/**
 * Crée une nouvelle action corrective
 */
export async function createAction(data: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
  // En mode mock, retourner des données fictives
  if (mockMode.isActive()) {
    return mockData.createAction(data);
  }
  
  // Vérification des données obligatoires
  if (!data.evaluationId) {
    throw new Error('Le champ evaluationId est obligatoire');
  }
  
  // Implémentation réelle avec l'API Notion
  try {
    const response = await notionApiRequest('/pages', 'POST', {
      parent: { database_id: process.env.NOTION_ACTIONS_DATABASE_ID },
      properties: {
        evaluationId: {
          rich_text: [{ text: { content: data.evaluationId } }]
        },
        targetScore: {
          select: {
            name: data.targetScore || ''
          }
        },
        priority: {
          select: {
            name: data.priority || ActionPriority.MEDIUM
          }
        },
        dueDate: data.dueDate ? {
          date: {
            start: data.dueDate
          }
        } : null,
        responsible: {
          rich_text: [{ text: { content: data.responsible || '' } }]
        },
        comment: {
          rich_text: [{ text: { content: data.comment || '' } }]
        },
        status: {
          select: {
            name: data.status || ActionStatus.TODO
          }
        },
        progress: {
          number: data.progress || 0
        }
      }
    });
    
    return {
      id: response.id,
      evaluationId: data.evaluationId,
      targetScore: data.targetScore || '',
      priority: data.priority || ActionPriority.MEDIUM,
      dueDate: data.dueDate || '',
      responsible: data.responsible || '',
      comment: data.comment || '',
      status: data.status || ActionStatus.TODO,
      progress: data.progress || 0
    };
  } catch (error) {
    console.error('Erreur lors de la création de l\'action corrective:', error);
    throw error;
  }
}

/**
 * Met à jour une action corrective existante
 */
export async function updateAction(id: string, data: Partial<CorrectiveAction>): Promise<CorrectiveAction> {
  // En mode mock, retourner des données fictives
  if (mockMode.isActive()) {
    return mockData.updateAction(id, data);
  }
  
  // Implémentation réelle avec l'API Notion
  try {
    const properties: any = {};
    
    // Ne mettre à jour que les propriétés fournies
    if (data.evaluationId !== undefined) {
      properties.evaluationId = {
        rich_text: [{ text: { content: data.evaluationId } }]
      };
    }
    
    if (data.targetScore !== undefined) {
      properties.targetScore = {
        select: {
          name: data.targetScore
        }
      };
    }
    
    if (data.priority !== undefined) {
      properties.priority = {
        select: {
          name: data.priority
        }
      };
    }
    
    if (data.dueDate !== undefined) {
      properties.dueDate = {
        date: {
          start: data.dueDate
        }
      };
    }
    
    if (data.responsible !== undefined) {
      properties.responsible = {
        rich_text: [{ text: { content: data.responsible } }]
      };
    }
    
    if (data.comment !== undefined) {
      properties.comment = {
        rich_text: [{ text: { content: data.comment } }]
      };
    }
    
    if (data.status !== undefined) {
      properties.status = {
        select: {
          name: data.status
        }
      };
    }
    
    if (data.progress !== undefined) {
      properties.progress = {
        number: data.progress
      };
    }
    
    // Mettre à jour la page Notion
    const response = await notionApiRequest(`/pages/${id}`, 'PATCH', {
      properties
    });
    
    // Récupérer l'action corrective mise à jour
    const updatedAction = await getAction(id);
    if (!updatedAction) {
      throw new Error(`Impossible de récupérer l'action corrective mise à jour ${id}`);
    }
    
    return updatedAction;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'action corrective ${id}:`, error);
    throw error;
  }
}

/**
 * Supprime une action corrective
 */
export async function deleteAction(id: string): Promise<boolean> {
  // En mode mock, retourner des données fictives
  if (mockMode.isActive()) {
    return mockData.deleteAction(id);
  }
  
  // Implémentation réelle avec l'API Notion
  try {
    // Notion n'a pas de vraie suppression, donc on "archive" la page
    await notionApiRequest(`/pages/${id}`, 'PATCH', {
      archived: true
    });
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'action corrective ${id}:`, error);
    return false;
  }
}

