
/**
 * Adaptateurs pour convertir entre les différents formats de ChecklistItem
 */

import { ChecklistItem as DomainChecklistItem } from '@/types/domain/checklist';
import { ChecklistItem as FeatureChecklistItem } from './types';

/**
 * Convertit un item de checklist du domaine vers le format utilisé par les features
 */
export function adaptDomainToFeature(item: DomainChecklistItem): FeatureChecklistItem {
  return {
    id: item.id,
    consigne: item.title,
    description: item.description,
    category: item.category,
    subcategory: item.subcategory || '',
    reference: item.reference || [],
    profil: item.profil || [],
    phase: item.phase || [],
    effort: getEffortNumber(item.effort || 'MOYEN'),
    priority: getPriorityNumber(item.priority || 'MOYENNE')
  };
}

/**
 * Convertit un item de checklist du format feature vers le format domaine
 */
export function adaptFeatureToDomain(item: FeatureChecklistItem): DomainChecklistItem {
  return {
    id: item.id,
    title: item.consigne,
    description: item.description,
    category: item.category,
    subcategory: item.subcategory,
    reference: item.reference,
    profil: item.profil,
    phase: item.phase,
    effort: getEffortString(item.effort),
    priority: getPriorityString(item.priority)
  };
}

/**
 * Convertit une liste d'items de checklist du domaine vers le format feature
 */
export function adaptDomainListToFeature(items: DomainChecklistItem[]): FeatureChecklistItem[] {
  return items.map(adaptDomainToFeature);
}

/**
 * Convertit une chaîne d'effort en nombre
 */
function getEffortNumber(effortString: string): number {
  switch (effortString.toUpperCase()) {
    case 'FAIBLE':
      return 1;
    case 'MOYEN':
      return 3;
    case 'ÉLEVÉ':
      return 5;
    default:
      // Tenter de convertir directement en nombre
      const num = parseInt(effortString, 10);
      return isNaN(num) ? 3 : num;
  }
}

/**
 * Convertit un nombre d'effort en chaîne
 */
function getEffortString(effortNumber: number): string {
  if (effortNumber <= 1) return 'FAIBLE';
  if (effortNumber <= 3) return 'MOYEN';
  return 'ÉLEVÉ';
}

/**
 * Convertit une chaîne de priorité en nombre
 */
function getPriorityNumber(priorityString: string): number {
  switch (priorityString.toUpperCase()) {
    case 'BASSE':
      return 1;
    case 'MOYENNE':
      return 3;
    case 'HAUTE':
      return 5;
    default:
      // Tenter de convertir directement en nombre
      const num = parseInt(priorityString, 10);
      return isNaN(num) ? 3 : num;
  }
}

/**
 * Convertit un nombre de priorité en chaîne
 */
function getPriorityString(priorityNumber: number): string {
  if (priorityNumber <= 2) return 'BASSE';
  if (priorityNumber <= 3) return 'MOYENNE';
  return 'HAUTE';
}
