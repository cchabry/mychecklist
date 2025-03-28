
/**
 * Utilitaires pour le service de projets
 */

/**
 * Extrait le texte d'une propriété Notion
 * @param property Propriété Notion
 * @returns Texte extrait ou chaîne vide
 */
export function extractTextProperty(property: any): string {
  if (!property) return '';
  
  if (property.title && Array.isArray(property.title)) {
    return property.title.map((t: any) => t.plain_text || '').join('');
  }
  
  if (property.rich_text && Array.isArray(property.rich_text)) {
    return property.rich_text.map((t: any) => t.plain_text || '').join('');
  }
  
  return '';
}

/**
 * Transforme une page Notion en projet
 * @param page Page Notion
 * @returns Objet projet
 */
export function notionPageToProject(page: any): Project {
  const properties = page.properties;
  
  return {
    id: page.id,
    name: extractTextProperty(properties.Name),
    url: extractTextProperty(properties.URL),
    description: extractTextProperty(properties.Description) || '',
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
    progress: properties.Progress?.number || 0
  };
}
