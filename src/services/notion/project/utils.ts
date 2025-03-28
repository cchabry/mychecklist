
/**
 * Utilitaires pour les projets
 */

import { Project } from '@/types/domain';
import { ProjectStatus, PROJECT_STATUS_MAPPING } from '@/types/enums';
import { formatDate } from '@/utils/date';

/**
 * Convertit une page Notion en projet
 */
export function notionPageToProject(page: any): Project {
  const properties = page.properties || {};
  
  return {
    id: page.id,
    name: getPropertyValue(properties.Name, 'title') || '',
    url: getPropertyValue(properties.URL, 'url') || '',
    description: getPropertyValue(properties.Description, 'rich_text') || '',
    progress: getPropertyValue(properties.Progress, 'number') || 0,
    status: mapStringToProjectStatus(getPropertyValue(properties.Status, 'select') || 'NEW'),
    createdAt: formatDate(page.created_time) || '',
    updatedAt: formatDate(page.last_edited_time) || ''
  };
}

/**
 * Récupère la valeur d'une propriété Notion
 */
function getPropertyValue(property: any, type: string): any {
  if (!property) return null;

  switch (type) {
    case 'title':
    case 'rich_text':
      return property[type]?.[0]?.plain_text || '';
    case 'url':
      return property[type] || '';
    case 'number':
      return property[type] !== undefined ? property[type] : null;
    case 'select':
      return property[type]?.name || '';
    default:
      return null;
  }
}

/**
 * Transforme une chaîne de statut en enum ProjectStatus
 */
export function mapStringToProjectStatus(status: string): ProjectStatus {
  return PROJECT_STATUS_MAPPING[status] || 'NEW';
}

/**
 * Vérifie si un statut est valide pour ProjectStatus
 */
export function isValidProjectStatus(status: string): status is ProjectStatus {
  return status in PROJECT_STATUS_MAPPING;
}
