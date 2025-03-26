
/**
 * Énumérations pour l'application
 */

// Niveaux d'importance pour les exigences
export type ImportanceLevel = 'N/A' | 'mineur' | 'moyen' | 'important' | 'majeur';

// Niveaux de conformité pour les évaluations
export type ComplianceLevel = 'Conforme' | 'Partiellement conforme' | 'Non conforme' | 'Non Applicable';

// Priorités pour les actions correctives
export type PriorityLevel = 'faible' | 'moyenne' | 'haute' | 'critique';

// Statuts pour les actions et progrès
export type StatusType = 'à faire' | 'en cours' | 'terminée';

// Profils utilisateurs
export enum UserProfile {
  ProductOwner = 'Product Owner',
  UXDesigner = 'UX designer',
  UIDesigner = 'UI designer',
  Developer = 'Développeur',
  Contributor = 'Contributeur'
}

// Phases de projet
export enum ProjectPhase {
  Design = 'Design',
  Development = 'Développement',
  Testing = 'Tests',
  Production = 'Production'
}

// Types de référence
export enum ReferenceType {
  RGAA = 'RGAA',
  RGESN = 'RGESN',
  OPQUAST = 'OPQUAST'
}
