
import { CorrectiveAction, ActionPriority, ActionStatus, ComplianceStatus } from '@/lib/types';
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
    const now = new Date().toISOString();
    
    // Mapper les résultats de Notion vers notre format d'action corrective
    return response.results.map(item => ({
      id: item.id,
      evaluationId: item.properties.evaluationId?.rich_text?.[0]?.text?.content || '',
      pageId: item.properties.pageId?.rich_text?.[0]?.text?.content || '', // Ajout du champ pageId
      targetScore: item.properties.targetScore?.select?.name as ComplianceStatus || ComplianceStatus.NotEvaluated,
      priority: item.properties.priority?.select?.name as ActionPriority || ActionPriority.Medium,
      dueDate: item.properties.dueDate?.date?.start || '',
      responsible: item.properties.responsible?.rich_text?.[0]?.text?.content || '',
      comment: item.properties.comment?.rich_text?.[0]?.text?.content || '',
      status: item.properties.status?.select?.name as ActionStatus || ActionStatus.ToDo,
      progress: item.properties.progress?.rich_text ? 
        JSON.parse(item.properties.progress.rich_text[0]?.text?.content || '[]') : [],
      createdAt: item.created_time || now,
      updatedAt: item.last_edited_time || now
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
    const now = new Date().toISOString();
    
    // Vérifier si la page existe
    if (!response) {
      return null;
    }
    
    // Mapper les résultats de Notion vers notre format d'action corrective
    return {
      id: response.id,
      evaluationId: response.properties.evaluationId?.rich_text?.[0]?.text?.content || '',
      pageId: response.properties.pageId?.rich_text?.[0]?.text?.content || '', // Ajout du champ pageId
      targetScore: response.properties.targetScore?.select?.name as ComplianceStatus || ComplianceStatus.NotEvaluated,
      priority: response.properties.priority?.select?.name as ActionPriority || ActionPriority.Medium,
      dueDate: response.properties.dueDate?.date?.start || '',
      responsible: response.properties.responsible?.rich_text?.[0]?.text?.content || '',
      comment: response.properties.comment?.rich_text?.[0]?.text?.content || '',
      status: response.properties.status?.select?.name as ActionStatus || ActionStatus.ToDo,
      progress: response.properties.progress?.rich_text ? 
        JSON.parse(response.properties.progress.rich_text[0]?.text?.content || '[]') : [],
      createdAt: response.created_time || now,
      updatedAt: response.last_edited_time || now
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
    
    const now = new Date().toISOString();
    
    // Mapper les résultats de Notion vers notre format d'action corrective
    return response.results.map(item => ({
      id: item.id,
      evaluationId: item.properties.evaluationId?.rich_text?.[0]?.text?.content || '',
      pageId: item.properties.pageId?.rich_text?.[0]?.text?.content || '', // Ajout du champ pageId
      targetScore: item.properties.targetScore?.select?.name as ComplianceStatus || ComplianceStatus.NotEvaluated,
      priority: item.properties.priority?.select?.name as ActionPriority || ActionPriority.Medium,
      dueDate: item.properties.dueDate?.date?.start || '',
      responsible: item.properties.responsible?.rich_text?.[0]?.text?.content || '',
      comment: item.properties.comment?.rich_text?.[0]?.text?.content || '',
      status: item.properties.status?.select?.name as ActionStatus || ActionStatus.ToDo,
      progress: item.properties.progress?.rich_text ? 
        JSON.parse(item.properties.progress.rich_text[0]?.text?.content || '[]') : [],
      createdAt: item.created_time || now,
      updatedAt: item.last_edited_time || now
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
    const now = new Date().toISOString();
    const progressString = JSON.stringify(data.progress || []);
    
    const response = await notionApiRequest('/pages', 'POST', {
      parent: { database_id: process.env.NOTION_ACTIONS_DATABASE_ID },
      properties: {
        evaluationId: {
          rich_text: [{ text: { content: data.evaluationId } }]
        },
        pageId: {
          rich_text: [{ text: { content: data.pageId || '' } }]
        },
        targetScore: {
          select: {
            name: data.targetScore || ComplianceStatus.NotEvaluated
          }
        },
        priority: {
          select: {
            name: data.priority || ActionPriority.Medium
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
            name: data.status || ActionStatus.ToDo
          }
        },
        progress: {
          rich_text: [{ text: { content: progressString } }]
        }
      }
    });
    
    return {
      id: response.id,
      evaluationId: data.evaluationId,
      pageId: data.pageId || '',
      targetScore: data.targetScore || ComplianceStatus.NotEvaluated,
      priority: data.priority || ActionPriority.Medium,
      dueDate: data.dueDate || '',
      responsible: data.responsible || '',
      comment: data.comment || '',
      status: data.status || ActionStatus.ToDo,
      progress: data.progress || [],
      createdAt: now,
      updatedAt: now
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
    
    if (data.pageId !== undefined) {
      properties.pageId = {
        rich_text: [{ text: { content: data.pageId } }]
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
        rich_text: [{ text: { content: JSON.stringify(data.progress) } }]
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
