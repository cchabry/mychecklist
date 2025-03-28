
/**
 * Utilitaires pour les projets
 */

import { Project } from '@/types/domain';
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
function mapStringToProjectStatus(status: string): 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'CANCELLED' {
  const statusMap: Record<string, 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'> = {
    'Nouveau': 'NEW',
    'En cours': 'IN_PROGRESS',
    'Terminé': 'COMPLETED',
    'En pause': 'PAUSED',
    'Annulé': 'CANCELLED',
    'NEW': 'NEW',
    'IN_PROGRESS': 'IN_PROGRESS',
    'COMPLETED': 'COMPLETED',
    'PAUSED': 'PAUSED',
    'CANCELLED': 'CANCELLED'
  };

  return statusMap[status] || 'NEW';
}
