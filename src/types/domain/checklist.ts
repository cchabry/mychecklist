
/**
 * Types pour les items de checklist
 * Représente les critères d'évaluation du référentiel de bonnes pratiques
 */

/**
 * Item de checklist (référentiel de bonnes pratiques)
 * Contient les critères d'évaluation servant de base aux exigences
 */
export interface ChecklistItem {
  /** Identifiant unique de l'item */
  id: string;
  /** Titre de l'item (règle ou consigne) */
  consigne: string;
  /** Nom court de l'item */
  name: string;
  /** Description détaillée de l'item */
  description: string;
  /** Catégorie principale (ex: médias, technique) */
  category: string;
  /** Sous-catégorie (ex: infographie, image administrable) */
  subcategory: string;
  /** Références à des règles dans des référentiels officiels (RGAA, RGESN, etc.) */
  reference: string[];
  /** Types d'intervenants concernés (PO, UX, Développeur, etc.) */
  profil: string[];
  /** Étapes du projet concernées par cette consigne */
  phase: string[];
  /** Niveau d'effort pour mettre en œuvre (1-5) */
  effort: number;
  /** Niveau de priorité (1-5) */
  priority: number;
  /** Identifiant du projet associé (si applicable) */
  projectId?: string;
  /** Date de création */
  createdAt?: string;
  /** Date de dernière mise à jour */
  updatedAt?: string;
}
