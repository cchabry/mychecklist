
import { ChecklistItem, ComplianceStatus } from '@/lib/types';
import { NotionChecklistProperties } from './types';

/**
 * Fonction utilitaire pour extraire un tableau de valeurs depuis une propriété multi-select ou multi-rich_text
 */
export const extractMultiValues = (prop: any, valueKey: string = 'name'): string[] => {
  if (!prop) return [];
  if (Array.isArray(prop)) return prop.map((item: any) => item[valueKey] || '');
  if (prop.multi_select) return prop.multi_select.map((item: any) => item.name || '');
  if (prop.rich_text) return prop.rich_text.map((item: any) => item.plain_text || '');
  return [];
};

/**
 * Transforme les propriétés Notion en un objet ChecklistItem
 */
export const mapNotionToChecklistItem = (id: string, properties: NotionChecklistProperties): ChecklistItem => {
  // Extraire les valeurs depuis les propriétés Notion
  const consigne = properties.Consigne?.title?.[0]?.plain_text || 
                  properties.consigne?.title?.[0]?.plain_text || 
                  properties.Title?.title?.[0]?.plain_text || 
                  properties.title?.title?.[0]?.plain_text || '';
                  
  const description = properties.Description?.rich_text?.[0]?.plain_text || 
                     properties.description?.rich_text?.[0]?.plain_text || '';
                     
  const category = properties.Category?.select?.name || 
                  properties.category?.select?.name || 
                  properties.Categorie?.select?.name || '';
                  
  const subcategory = properties.Subcategory?.select?.name || 
                     properties.subcategory?.select?.name || 
                     properties.SousCategorie?.select?.name || '';
                     
  const reference = extractMultiValues(properties.Reference?.multi_select || 
                                     properties.reference?.multi_select || 
                                     properties.References?.multi_select);
                                     
  const profil = extractMultiValues(properties.Profil?.multi_select || 
                                  properties.profil?.multi_select || 
                                  properties.Profiles?.multi_select);
                                  
  const phase = extractMultiValues(properties.Phase?.multi_select || 
                                 properties.phase?.multi_select);
                                 
  const effort = properties.Effort?.select?.name || 
                properties.effort?.select?.name || 'Moyen';
                
  const priority = properties.Priority?.select?.name || 
                  properties.priority?.select?.name || 
                  properties.Priorite?.select?.name || 'Moyenne';

  const criteria = properties.Criteria?.select?.name ||
                  properties.criteria?.select?.name || '';

  const requirementLevel = properties.RequirementLevel?.select?.name ||
                      properties.requirementLevel?.select?.name || '';

  const scope = properties.Scope?.select?.name ||
                properties.scope?.select?.name || '';
  
  // Créer l'item de checklist avec les propriétés requises
  return {
    id,
    title: consigne, // Map consigne to title for compatibility
    description,
    category,
    subcategory,
    consigne,
    reference: reference.join(', '), // Join array to string for compatibility
    profil: profil.join(', '), // Join array to string for compatibility
    phase: phase.join(', '), // Join array to string for compatibility
    effort,
    priority,
    profile: profil.join(', '), // Duplicate needed for type compatibility
    criteria,
    requirementLevel,
    scope,
    status: ComplianceStatus.NotEvaluated // Default status
  };
};
