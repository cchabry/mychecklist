import { Evaluation, ComplianceStatus } from '@/lib/types';
import { mockData } from '../mock/data';
import { mockMode } from '../mockMode';
import { notionApiRequest } from '../proxyFetch';

/**
 * Récupère toutes les évaluations
 */
export async function getEvaluations(): Promise<Evaluation[]> {
  // En mode mock, retourner des données fictives
  if (mockMode.isActive()) {
    return mockData.getEvaluations();
  }
  
  // Implémentation réelle avec l'API Notion
  try {
    const response = await notionApiRequest('/databases/evaluations/query', 'POST', {});
    
    // Mapper les résultats de Notion vers notre format d'évaluation
    return response.results.map(item => ({
      id: item.id,
      auditId: item.properties.auditId?.rich_text?.[0]?.text?.content || '',
      pageId: item.properties.pageId?.rich_text?.[0]?.text?.content || '',
      exigenceId: item.properties.exigenceId?.rich_text?.[0]?.text?.content || '',
      score: item.properties.score?.select?.name as ComplianceStatus || ComplianceStatus.NotEvaluated,
      comment: item.properties.comment?.rich_text?.[0]?.text?.content || '',
      attachments: item.properties.attachments?.files?.map(file => file.name) || [],
      createdAt: new Date(item.created_time).toISOString(),
      updatedAt: new Date(item.last_edited_time).toISOString()
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des évaluations:', error);
    throw error;
  }
}

/**
 * Récupère une évaluation par son ID
 */
export async function getEvaluation(id: string): Promise<Evaluation | null> {
  // En mode mock, retourner des données fictives
  if (mockMode.isActive()) {
    return mockData.getEvaluation(id);
  }
  
  // Implémentation réelle avec l'API Notion
  try {
    const response = await notionApiRequest(`/pages/${id}`, 'GET');
    
    // Vérifier si la page existe
    if (!response) {
      return null;
    }
    
    // Mapper les résultats de Notion vers notre format d'évaluation
    return {
      id: response.id,
      auditId: response.properties.auditId?.rich_text?.[0]?.text?.content || '',
      pageId: response.properties.pageId?.rich_text?.[0]?.text?.content || '',
      exigenceId: response.properties.exigenceId?.rich_text?.[0]?.text?.content || '',
      score: response.properties.score?.select?.name as ComplianceStatus || ComplianceStatus.NotEvaluated,
      comment: response.properties.comment?.rich_text?.[0]?.text?.content || '',
      attachments: response.properties.attachments?.files?.map(file => file.name) || [],
      createdAt: new Date(response.created_time).toISOString(),
      updatedAt: new Date(response.last_edited_time).toISOString()
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'évaluation ${id}:`, error);
    return null;
  }
}

/**
 * Récupère les évaluations pour un audit spécifique
 */
export async function getEvaluationsByAuditId(auditId: string): Promise<Evaluation[]> {
  // En mode mock, retourner des données fictives
  if (mockMode.isActive()) {
    return mockData.getEvaluations().filter(evaluation => evaluation.auditId === auditId);
  }
  
  // Implémentation réelle avec l'API Notion
  try {
    const response = await notionApiRequest('/databases/evaluations/query', 'POST', {
      filter: {
        property: 'auditId',
        rich_text: {
          equals: auditId
        }
      }
    });
    
    // Mapper les résultats de Notion vers notre format d'évaluation
    return response.results.map(item => ({
      id: item.id,
      auditId: item.properties.auditId?.rich_text?.[0]?.text?.content || '',
      pageId: item.properties.pageId?.rich_text?.[0]?.text?.content || '',
      exigenceId: item.properties.exigenceId?.rich_text?.[0]?.text?.content || '',
      score: item.properties.score?.select?.name as ComplianceStatus || ComplianceStatus.NotEvaluated,
      comment: item.properties.comment?.rich_text?.[0]?.text?.content || '',
      attachments: item.properties.attachments?.files?.map(file => file.name) || [],
      createdAt: new Date(item.created_time).toISOString(),
      updatedAt: new Date(item.last_edited_time).toISOString()
    }));
  } catch (error) {
    console.error(`Erreur lors de la récupération des évaluations pour l'audit ${auditId}:`, error);
    throw error;
  }
}

/**
 * Crée une nouvelle évaluation
 */
export async function createEvaluation(data: Partial<Evaluation>): Promise<Evaluation> {
  // En mode mock, retourner des données fictives
  if (mockMode.isActive()) {
    return mockData.createEvaluation(data);
  }
  
  // Vérification des données obligatoires
  if (!data.auditId || !data.pageId || !data.exigenceId) {
    throw new Error('Les champs auditId, pageId et exigenceId sont obligatoires');
  }
  
  // Implémentation réelle avec l'API Notion
  try {
    const now = new Date().toISOString();
    
    const response = await notionApiRequest('/pages', 'POST', {
      parent: { database_id: process.env.NOTION_EVALUATIONS_DATABASE_ID },
      properties: {
        auditId: {
          rich_text: [{ text: { content: data.auditId } }]
        },
        pageId: {
          rich_text: [{ text: { content: data.pageId } }]
        },
        exigenceId: {
          rich_text: [{ text: { content: data.exigenceId } }]
        },
        score: {
          select: {
            name: data.score || ComplianceStatus.NotEvaluated
          }
        },
        comment: {
          rich_text: [{ text: { content: data.comment || '' } }]
        }
        // Note: Les pièces jointes nécessitent un traitement spécial dans Notion
      }
    });
    
    return {
      id: response.id,
      auditId: data.auditId,
      pageId: data.pageId,
      exigenceId: data.exigenceId,
      score: data.score || ComplianceStatus.NotEvaluated,
      comment: data.comment || '',
      attachments: data.attachments || [],
      createdAt: now,
      updatedAt: now
    };
  } catch (error) {
    console.error('Erreur lors de la création de l\'évaluation:', error);
    throw error;
  }
}

/**
 * Met à jour une évaluation existante
 */
export async function updateEvaluation(id: string, data: Partial<Evaluation>): Promise<Evaluation> {
  // En mode mock, retourner des données fictives
  if (mockMode.isActive()) {
    return mockData.updateEvaluation(id, data);
  }
  
  // Implémentation réelle avec l'API Notion
  try {
    const properties: any = {};
    
    // Ne mettre à jour que les propriétés fournies
    if (data.auditId !== undefined) {
      properties.auditId = {
        rich_text: [{ text: { content: data.auditId } }]
      };
    }
    
    if (data.pageId !== undefined) {
      properties.pageId = {
        rich_text: [{ text: { content: data.pageId } }]
      };
    }
    
    if (data.exigenceId !== undefined) {
      properties.exigenceId = {
        rich_text: [{ text: { content: data.exigenceId } }]
      };
    }
    
    if (data.score !== undefined) {
      properties.score = {
        select: {
          name: data.score
        }
      };
    }
    
    if (data.comment !== undefined) {
      properties.comment = {
        rich_text: [{ text: { content: data.comment } }]
      };
    }
    
    // Mettre à jour la page Notion
    await notionApiRequest(`/pages/${id}`, 'PATCH', { properties });
    
    // Récupérer l'évaluation mise à jour
    const updatedEvaluation = await getEvaluation(id);
    if (!updatedEvaluation) {
      throw new Error(`Impossible de récupérer l'évaluation mise à jour ${id}`);
    }
    
    return updatedEvaluation;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'évaluation ${id}:`, error);
    throw error;
  }
}

/**
 * Supprime une évaluation
 */
export async function deleteEvaluation(id: string): Promise<boolean> {
  // En mode mock, retourner des données fictives
  if (mockMode.isActive()) {
    return mockData.deleteEvaluation(id);
  }
  
  // Implémentation réelle avec l'API Notion
  try {
    // Notion n'a pas de vraie suppression, donc on "archive" la page
    await notionApiRequest(`/pages/${id}`, 'PATCH', {
      archived: true
    });
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'évaluation ${id}:`, error);
    return false;
  }
}
