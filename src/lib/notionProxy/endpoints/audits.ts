
import { notionApiRequest } from '../proxyFetch';
import { operationMode } from '@/services/operationMode';
import { Audit } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { cleanAuditId } from '@/lib/utils';

/**
 * Récupère tous les audits
 */
export const getAudits = async (): Promise<Audit[]> => {
  // Si nous sommes en mode démo, retourner des données simulées
  if (operationMode.isDemoMode) {
    console.log('Using demo audits data');
    return [
      {
        id: uuidv4(), // Utiliser un UUID standard
        projectId: 'project-1',
        name: 'Audit initial',
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        score: 75,
        version: '1.0'
      }
    ];
  }

  // Sinon, récupérer depuis Notion
  const apiKey = localStorage.getItem('notion_api_key');
  const dbId = localStorage.getItem('notion_audit_database_id');

  if (!apiKey || !dbId) {
    throw new Error('Configuration Notion manquante');
  }

  const response = await notionApiRequest(
    `/databases/${dbId}/query`,
    'POST',
    {},
    apiKey
  );

  // Mapper les résultats en audits
  return response.results.map((page: any) => {
    const properties = page.properties;
    
    return {
      id: page.id,
      projectId: properties.Project?.relation?.[0]?.id || '', // Récupérer l'ID depuis la relation
      name: properties.Name?.title?.[0]?.plain_text || 'Audit sans nom',
      createdAt: page.created_time,
      updatedAt: page.last_edited_time,
      score: properties.Score?.number || 0,
      items: [],
      version: properties.Version?.rich_text?.[0]?.plain_text || '1.0'
    };
  });
};

/**
 * Crée un nouvel audit
 */
export const createAudit = async (data: Partial<Audit>): Promise<Audit> => {
  // Si nous sommes en mode démo, créer un faux audit
  if (operationMode.isDemoMode) {
    console.log('Creating demo audit with name:', data.name);
    // Générer un UUID standard pour l'ID, même en mode démo
    // pour assurer la cohérence entre les modes
    const id = uuidv4();
    return {
      id: id, // UUID standard sans préfixe
      projectId: data.projectId || '',
      name: data.name || `Audit du ${new Date().toLocaleDateString()}`,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      score: 0,
      version: '1.0'
    };
  }

  // Sinon, créer dans Notion
  const apiKey = localStorage.getItem('notion_api_key');
  const dbId = localStorage.getItem('notion_audit_database_id');
  
  if (!apiKey || !dbId) {
    throw new Error('Configuration Notion manquante');
  }

  // Vérifier si on a un projectId valide
  if (!data.projectId) {
    console.error('❌ Erreur: ProjectId manquant pour la création d\'audit');
    throw new Error('ProjectId manquant pour la création d\'audit');
  }
  
  // Utiliser le champ relation "Project" au lieu de "ProjectId"
  const properties = {
    "Name": { title: [{ text: { content: data.name || `Audit du ${new Date().toLocaleDateString()}` } }] },
    "Project": { 
      relation: [{ id: data.projectId }]  // Format correct pour une relation Notion
    },
    "Score": { number: 0 },
    "Version": { rich_text: [{ text: { content: '1.0' } }] }
  };
  
  console.log('🔍 DIAGNOSTIC: Création d\'audit dans Notion');
  console.log('📊 Database ID utilisée:', dbId);
  console.log('📝 Propriétés envoyées:', JSON.stringify(properties, null, 2));
  
  try {
    // Récupérer la structure de la base pour diagnostiquer
    console.log('🔍 DIAGNOSTIC: Vérification de la structure de la base de données...');
    try {
      const dbStructure = await notionApiRequest(
        `/databases/${dbId}`,
        'GET',
        undefined,
        apiKey
      );
      console.log('📊 Structure de la base de données:', JSON.stringify(dbStructure.properties, null, 2));
    } catch (structureError) {
      console.error('❌ Impossible de récupérer la structure de la base:', structureError);
    }
    
    // Création de l'audit
    const response = await notionApiRequest(
      `/pages`,
      'POST',
      {
        parent: { database_id: dbId },
        properties
      },
      apiKey
    );

    console.log('✅ Réponse de création d\'audit:', JSON.stringify(response, null, 2));
    
    return {
      id: response.id,
      projectId: data.projectId || '',
      name: data.name || `Audit du ${new Date().toLocaleDateString()}`,
      items: [],
      createdAt: response.created_time,
      updatedAt: response.last_edited_time,
      score: 0,
      version: '1.0'
    };
  } catch (error) {
    console.error('❌ Erreur détaillée lors de la création de l\'audit:', error);
    
    if (error.response) {
      console.error('Réponse d\'erreur:', JSON.stringify(error.response, null, 2));
    }
    
    // En cas d'échec avec l'API, revenir au mode démo pour cet audit
    const id = uuidv4();
    console.log('Création d\'un audit de secours avec UUID standard:', id);
    return {
      id: id,
      projectId: data.projectId || '',
      name: data.name || `Audit du ${new Date().toLocaleDateString()}`,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      score: 0,
      version: '1.0'
    };
  }
};

/**
 * Met à jour un audit existant
 */
export const updateAudit = async (id: string, data: Partial<Audit>): Promise<Audit> => {
  // Nettoyer l'ID si nécessaire (retirer les préfixes)
  const cleanId = cleanAuditId(id);

  // Si nous sommes en mode démo, mettre à jour un faux audit
  if (operationMode.isDemoMode) {
    console.log('Updating demo audit with ID:', cleanId);
    return {
      id: cleanId,
      projectId: data.projectId || '',
      name: data.name || `Audit mis à jour`,
      items: data.items || [],
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      score: data.score || 0,
      version: data.version || '1.0'
    };
  }

  // Sinon, mettre à jour dans Notion
  const apiKey = localStorage.getItem('notion_api_key');
  
  if (!apiKey) {
    throw new Error('Clé API Notion manquante');
  }

  const properties: any = {};
  
  if (data.name) {
    properties.Name = { title: [{ text: { content: data.name } }] };
  }
  
  if (data.score !== undefined) {
    properties.Score = { number: data.score };
  }
  
  if (data.projectId) {
    properties.Project = { relation: [{ id: data.projectId }] };
  }
  
  if (data.version) {
    properties.Version = { rich_text: [{ text: { content: data.version } }] };
  }
  
  await notionApiRequest(
    `/pages/${cleanId}`,
    'PATCH',
    { properties },
    apiKey
  );

  // Récupérer l'audit mis à jour
  const updatedAudit = await getAudit(cleanId);
  return updatedAudit || {
    id: cleanId,
    projectId: data.projectId || '',
    name: data.name || '',
    items: data.items || [],
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    score: data.score || 0,
    version: data.version || '1.0'
  };
};

/**
 * Supprime un audit
 */
export const deleteAudit = async (id: string): Promise<boolean> => {
  // Nettoyer l'ID si nécessaire
  const cleanId = cleanAuditId(id);

  // Si nous sommes en mode démo, simuler une suppression
  if (operationMode.isDemoMode) {
    console.log('Deleting demo audit with ID:', cleanId);
    return true;
  }

  // Sinon, supprimer dans Notion (Notion archive les pages, ne les supprime pas vraiment)
  const apiKey = localStorage.getItem('notion_api_key');
  
  if (!apiKey) {
    throw new Error('Clé API Notion manquante');
  }

  try {
    await notionApiRequest(
      `/pages/${cleanId}`,
      'PATCH',
      {
        archived: true
      },
      apiKey
    );
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'audit #${cleanId}:`, error);
    return false;
  }
};

/**
 * Récupère un audit par son ID
 */
export const getAudit = async (id: string): Promise<Audit | null> => {
  // Nettoyer l'ID si nécessaire
  const cleanId = cleanAuditId(id);
  
  if (id !== cleanId) {
    console.warn('ID d\'audit avec préfixe détecté, nettoyage pour l\'API Notion:', id);
    console.log(`ID d'audit nettoyé: ${id} -> ${cleanId}`);
  }
  
  // Si nous sommes en mode démo, retourner un faux audit
  if (operationMode.isDemoMode) {
    console.log('Using demo audit data for ID:', cleanId);
    return {
      id: cleanId,
      name: `Audit de test`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      score: 65,
      items: [],
      projectId: 'project-1234',
      version: '1.0'
    };
  }

  // Sinon, récupérer depuis Notion
  const apiKey = localStorage.getItem('notion_api_key');
  
  if (!apiKey) {
    throw new Error('Clé API Notion manquante');
  }

  try {
    const response = await notionApiRequest(
      `/pages/${cleanId}`,
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
      name: properties.Name?.title?.[0]?.plain_text || `Audit sans nom`,
      projectId: properties.Project?.relation?.[0]?.id || '', // Modifier pour utiliser la relation
      createdAt: response.created_time,
      updatedAt: response.last_edited_time,
      score: properties.Score?.number || 0,
      items: [],
      version: properties.Version?.rich_text?.[0]?.plain_text || '1.0'
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'audit #${cleanId}:`, error);
    return null;
  }
};

/**
 * Récupère tous les audits pour un projet spécifique
 */
export const getAuditsByProject = async (projectId: string): Promise<Audit[]> => {
  // Si nous sommes en mode démo, retourner des données simulées
  if (operationMode.isDemoMode) {
    console.log('Using demo audits data for project:', projectId);
    // Créer des données de démo adaptées au projet
    return [
      {
        id: uuidv4(), // Utiliser un UUID standard
        projectId: projectId,
        name: 'Audit initial',
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        score: 75,
        version: '1.0'
      },
      {
        id: uuidv4(), // Utiliser un UUID standard
        projectId: projectId,
        name: 'Audit de suivi',
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        score: 35,
        version: '1.0'
      }
    ];
  }

  // Récupérer depuis Notion avec filtre sur le projectId
  const apiKey = localStorage.getItem('notion_api_key');
  
  // Essayer d'abord avec la base de données d'audits dédiée
  let dbId = localStorage.getItem('notion_audit_database_id');
  
  // Si aucune base d'audits n'est configurée, utiliser la base de données principale
  if (!dbId) {
    console.log('⚠️ Base de données d\'audits non configurée, utilisation de la base principale');
    dbId = localStorage.getItem('notion_database_id');
  }

  if (!apiKey || !dbId) {
    console.warn('🚫 Configuration Notion incomplète pour récupérer les audits', {
      'API Key présente': !!apiKey,
      'Database ID présent': !!dbId,
      'Mode opérationnel': operationMode.isDemoMode ? 'démo' : 'réel'
    });
    return [];
  }

  try {
    console.log(`🔍 Récupération des audits pour le projet ${projectId} depuis Notion`);
    console.log(`📊 Utilisation de la base de données: ${dbId}`);
    
    // Tenter de récupérer la structure de la base pour diagnostiquer
    let propertyForProject = "Project"; // Nom par défaut
    try {
      console.log('🔍 Analyse de la structure de la base de données pour trouver le champ de relation projet...');
      const dbResponse = await notionApiRequest(`/databases/${dbId}`, 'GET', undefined, apiKey);
      
      // Parcourir les propriétés de la base pour trouver une relation
      const properties = dbResponse.properties || {};
      console.log('📊 Propriétés disponibles dans la base:', Object.keys(properties).join(', '));
      
      // Chercher une propriété de type relation qui pourrait correspondre au projet
      for (const [name, prop] of Object.entries(properties)) {
        if (prop.type === 'relation') {
          console.log(`✅ Propriété relation trouvée: ${name}`);
          propertyForProject = name;
          break;
        } else if (prop.type === 'rich_text' && (name === 'ProjectId' || name.toLowerCase().includes('projet'))) {
          console.log(`✅ Propriété texte liée au projet trouvée: ${name}`);
          propertyForProject = name;
        }
      }
      
      console.log(`🔧 Utilisation de la propriété "${propertyForProject}" pour le filtre`);
    } catch (structureError) {
      console.warn('⚠️ Impossible d\'analyser la structure de la base:', structureError);
      console.log('🔄 Utilisation du filtre générique...');
    }
    
    // Préparer le filtre en fonction du type de propriété détecté
    let filter;
    
    if (propertyForProject === "Project") {
      // Si c'est "Project", on suppose que c'est une relation (format standard)
      filter = {
        property: propertyForProject,
        relation: {
          contains: projectId
        }
      };
    } else {
      // Sinon, on essaie avec un filtre de texte
      filter = {
        property: propertyForProject,
        rich_text: {
          equals: projectId
        }
      };
    }
    
    console.log('🔍 Filtre utilisé:', JSON.stringify(filter, null, 2));
    
    // Requête à la base de données Notion avec le filtre déterminé
    const response = await notionApiRequest(
      `/databases/${dbId}/query`,
      'POST',
      {
        filter: filter
      },
      apiKey
    );

    console.log(`✅ Réponse reçue de Notion pour les audits du projet ${projectId}:`, {
      'Nombre de résultats': response.results?.length || 0
    });
    
    // Mapper les résultats en audits
    const audits = response.results.map((page: any) => {
      const properties = page.properties;
      
      return {
        id: page.id,
        projectId: projectId,
        name: properties.Name?.title?.[0]?.plain_text || 'Audit sans nom',
        createdAt: page.created_time,
        updatedAt: page.last_edited_time,
        score: properties.Score?.number || 0,
        items: [],
        version: properties.Version?.rich_text?.[0]?.plain_text || '1.0'
      };
    });
    
    console.log(`✅ ${audits.length} audits récupérés pour le projet ${projectId}`);
    return audits;
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération des audits pour le projet ${projectId}:`, error);
    // En cas d'erreur, on active le mode démo pour cet appel spécifique
    console.log('⚠️ Passage en données de démonstration après erreur');
    
    return [
      {
        id: uuidv4(),
        projectId: projectId,
        name: 'Audit de secours (après erreur)',
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        score: 50,
        version: '1.0'
      }
    ];
  }
};
