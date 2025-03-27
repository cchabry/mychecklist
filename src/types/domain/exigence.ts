
/**
 * Types pour les exigences de projet
 */

import { ImportanceLevel } from '../enums';

/**
 * Interface pour une exigence
 * 
 * Une exigence représente l'application d'un item de checklist à un projet spécifique,
 * avec un niveau d'importance défini.
 */
export interface Exigence {
  id: string;
  projectId: string;
  itemId: string;
  importance: ImportanceLevel;
  comment?: string;
}
