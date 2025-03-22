
import { notionApiRequest } from '../proxyFetch';
import { mockMode } from '../mockMode';
import { ChecklistItem, ComplianceStatus } from '@/lib/types';

/**
 * Récupère tous les items de checklist
 */
export const getChecklistItems = async (): Promise<ChecklistItem[]> => {
  // Si nous sommes en mode mock, retourner des données mock
  if (mockMode.isActive()) {
    console.log('Using mock checklist items data');
    return [
      {
        id: 'item-1',
        title: 'Accessibilité des images',
        description: 'Toutes les images doivent avoir un texte alternatif',
        category: 'Accessibilité',
        subcategory: 'Images',
        criteria: 'RGAA 1.1',
        profile: 'Développeur',
        phase: 'Développement',
        effort: 'Faible',
        priority: 'Élevée',
        requirementLevel: 'AA',
        scope: 'Technique',
        consigne: 'Vérifier que toutes les images ont un attribut alt',
        status: ComplianceStatus.NotEvaluated
      }
    ];
  }

  // Sinon, récupérer depuis Notion
  const apiKey = localStorage.getItem('notion_api_key');
  const dbId = localStorage.getItem('notion_checklist_database_id');

  if (!apiKey || !dbId) {
    throw new Error('Configuration Notion manquante');
  }

  const response = await notionApiRequest(
    `/databases/${dbId}/query`,
    'POST',
    {},
    apiKey
  );

  // Mapper les résultats en items de checklist
  return response.results.map((page: any) => {
    const properties = page.properties;
    
    return {
      id: page.id,
      title: properties.Title?.title?.[0]?.plain_text || '',
      description: properties.Description?.rich_text?.[0]?.plain_text || '',
      category: properties.Category?.select?.name || '',
      subcategory: properties.Subcategory?.select?.name || '',
      criteria: properties.Criteria?.rich_text?.[0]?.plain_text || '',
      profile: properties.Profile?.select?.name || '',
      phase: properties.Phase?.select?.name || '',
      effort: properties.Effort?.select?.name || '',
      priority: properties.Priority?.select?.name || '',
      requirementLevel: properties.RequirementLevel?.select?.name || '',
      scope: properties.Scope?.select?.name || '',
      consigne: properties.Consigne?.rich_text?.[0]?.plain_text || '',
      status: properties.Status?.select?.name as ComplianceStatus || ComplianceStatus.NotEvaluated
    };
  });
};

/**
 * Récupère un item de checklist par son ID
 */
export const getChecklistItem = async (id: string): Promise<ChecklistItem | null> => {
  // Si nous sommes en mode mock, retourner un faux item
  if (mockMode.isActive()) {
    console.log('Using mock checklist item data for ID:', id);
    return {
      id,
      title: 'Accessibilité des images',
      description: 'Toutes les images doivent avoir un texte alternatif',
      category: 'Accessibilité',
      subcategory: 'Images',
      criteria: 'RGAA 1.1',
      profile: 'Développeur',
      phase: 'Développement',
      effort: 'Faible',
      priority: 'Élevée',
      requirementLevel: 'AA',
      scope: 'Technique',
      consigne: 'Vérifier que toutes les images ont un attribut alt',
      status: ComplianceStatus.NotEvaluated
    };
  }

  // Sinon, récupérer depuis Notion
  const apiKey = localStorage.getItem('notion_api_key');
  
  if (!apiKey) {
    throw new Error('Clé API Notion manquante');
  }

  try {
    const response = await notionApiRequest(
      `/pages/${id}`,
      'GET',
      undefined,
      apiKey
    );

    if (!response) {
      return null;
    }

    const properties = response.properties;
    
    return {
      id: response.id,
      title: properties.Title?.title?.[0]?.plain_text || '',
      description: properties.Description?.rich_text?.[0]?.plain_text || '',
      category: properties.Category?.select?.name || '',
      subcategory: properties.Subcategory?.select?.name || '',
      criteria: properties.Criteria?.rich_text?.[0]?.plain_text || '',
      profile: properties.Profile?.select?.name || '',
      phase: properties.Phase?.select?.name || '',
      effort: properties.Effort?.select?.name || '',
      priority: properties.Priority?.select?.name || '',
      requirementLevel: properties.RequirementLevel?.select?.name || '',
      scope: properties.Scope?.select?.name || '',
      consigne: properties.Consigne?.rich_text?.[0]?.plain_text || '',
      status: properties.Status?.select?.name as ComplianceStatus || ComplianceStatus.NotEvaluated
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'item de checklist #${id}:`, error);
    return null;
  }
};

/**
 * Crée un nouvel item de checklist
 */
export const createChecklistItem = async (data: Partial<ChecklistItem>): Promise<ChecklistItem> => {
  // Si nous sommes en mode mock, créer un faux item
  if (mockMode.isActive()) {
    console.log('Creating mock checklist item with title:', data.title);
    return {
      id: `item-${Date.now()}`,
      title: data.title || '',
      description: data.description || '',
      category: data.category || '',
      subcategory: data.subcategory || '',
      criteria: data.criteria || '',
      profile: data.profile || '',
      phase: data.phase || '',
      effort: data.effort || '',
      priority: data.priority || '',
      requirementLevel: data.requirementLevel || '',
      scope: data.scope || '',
      consigne: data.consigne || '',
      status: ComplianceStatus.NotEvaluated
    };
  }

  // Sinon, créer dans Notion
  const apiKey = localStorage.getItem('notion_api_key');
  const dbId = localStorage.getItem('notion_checklist_database_id');
  
  if (!apiKey || !dbId) {
    throw new Error('Configuration Notion manquante');
  }

  const properties = {
    "Title": { title: [{ text: { content: data.title || '' } }] },
    "Description": { rich_text: [{ text: { content: data.description || '' } }] },
    "Category": { select: { name: data.category || '' } },
    "Subcategory": data.subcategory ? { select: { name: data.subcategory } } : null,
    "Criteria": { rich_text: [{ text: { content: data.criteria || '' } }] },
    "Profile": { select: { name: data.profile || '' } },
    "Phase": { select: { name: data.phase || '' } },
    "Effort": { select: { name: data.effort || '' } },
    "Priority": { select: { name: data.priority || '' } },
    "RequirementLevel": { select: { name: data.requirementLevel || '' } },
    "Scope": { select: { name: data.scope || '' } },
    "Consigne": { rich_text: [{ text: { content: data.consigne || '' } }] },
    "Status": { select: { name: ComplianceStatus.NotEvaluated } }
  };
  
  const response = await notionApiRequest(
    `/pages`,
    'POST',
    {
      parent: { database_id: dbId },
      properties
    },
    apiKey
  );

  return {
    id: response.id,
    title: data.title || '',
    description: data.description || '',
    category: data.category || '',
    subcategory: data.subcategory || '',
    criteria: data.criteria || '',
    profile: data.profile || '',
    phase: data.phase || '',
    effort: data.effort || '',
    priority: data.priority || '',
    requirementLevel: data.requirementLevel || '',
    scope: data.scope || '',
    consigne: data.consigne || '',
    status: ComplianceStatus.NotEvaluated
  };
};

/**
 * Met à jour un item de checklist existant
 */
export const updateChecklistItem = async (id: string, data: Partial<ChecklistItem>): Promise<ChecklistItem> => {
  // Si nous sommes en mode mock, mettre à jour un faux item
  if (mockMode.isActive()) {
    console.log('Updating mock checklist item with ID:', id);
    return {
      id,
      title: data.title || '',
      description: data.description || '',
      category: data.category || '',
      subcategory: data.subcategory || '',
      criteria: data.criteria || '',
      profile: data.profile || '',
      phase: data.phase || '',
      effort: data.effort || '',
      priority: data.priority || '',
      requirementLevel: data.requirementLevel || '',
      scope: data.scope || '',
      consigne: data.consigne || '',
      status: data.status || ComplianceStatus.NotEvaluated
    };
  }

  // Sinon, mettre à jour dans Notion
  const apiKey = localStorage.getItem('notion_api_key');
  
  if (!apiKey) {
    throw new Error('Clé API Notion manquante');
  }

  const properties: any = {};
  
  if (data.title) {
    properties.Title = { title: [{ text: { content: data.title } }] };
  }
  
  if (data.description !== undefined) {
    properties.Description = { rich_text: [{ text: { content: data.description } }] };
  }
  
  if (data.category) {
    properties.Category = { select: { name: data.category } };
  }
  
  if (data.subcategory) {
    properties.Subcategory = { select: { name: data.subcategory } };
  }
  
  if (data.status) {
    properties.Status = { select: { name: data.status } };
  }
  
  await notionApiRequest(
    `/pages/${id}`,
    'PATCH',
    { properties },
    apiKey
  );

  // Récupérer l'item mis à jour
  const updatedItem = await getChecklistItem(id);
  return updatedItem || {
    id,
    title: data.title || '',
    description: data.description || '',
    category: data.category || '',
    subcategory: data.subcategory || '',
    criteria: data.criteria || '',
    profile: data.profile || '',
    phase: data.phase || '',
    effort: data.effort || '',
    priority: data.priority || '',
    requirementLevel: data.requirementLevel || '',
    scope: data.scope || '',
    consigne: data.consigne || '',
    status: data.status || ComplianceStatus.NotEvaluated
  };
};

/**
 * Supprime un item de checklist
 */
export const deleteChecklistItem = async (id: string): Promise<boolean> => {
  // Si nous sommes en mode mock, simuler une suppression
  if (mockMode.isActive()) {
    console.log('Deleting mock checklist item with ID:', id);
    return true;
  }

  // Sinon, supprimer dans Notion (Notion archive les pages, ne les supprime pas vraiment)
  const apiKey = localStorage.getItem('notion_api_key');
  
  if (!apiKey) {
    throw new Error('Clé API Notion manquante');
  }

  try {
    await notionApiRequest(
      `/pages/${id}`,
      'PATCH',
      {
        archived: true
      },
      apiKey
    );
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'item de checklist #${id}:`, error);
    return false;
  }
};
