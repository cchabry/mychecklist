
/**
 * Énumérations pour l'application
 */

/**
 * Niveaux d'importance pour les exigences
 */
export enum ImportanceLevel {
  NotApplicable = 'N/A',
  Minor = 'mineur',
  Medium = 'moyen',
  Important = 'important',
  Major = 'majeur',
  // Alias pour assurer la compatibilité avec le code existant
  N_A = 'N/A',
  MINOR = 'mineur',
  MEDIUM = 'moyen',
  IMPORTANT = 'important',
  MAJOR = 'majeur'
}

/**
 * Niveaux de conformité pour les évaluations
 */
export enum ComplianceLevel {
  Compliant = 'Conforme',
  PartiallyCompliant = 'Partiellement conforme',
  NonCompliant = 'Non conforme',
  NotApplicable = 'Non Applicable'
}

/**
 * Priorités pour les actions correctives
 */
export enum PriorityLevel {
  Low = 'faible',
  Medium = 'moyenne',
  High = 'haute',
  Critical = 'critique'
}

/**
 * Statuts pour les actions et progrès
 */
export enum StatusType {
  Todo = 'à faire',
  InProgress = 'en cours',
  Done = 'terminée'
}

/**
 * Profils utilisateurs
 */
export enum UserProfile {
  ProductOwner = 'Product Owner',
  UXDesigner = 'UX designer',
  UIDesigner = 'UI designer',
  Developer = 'Développeur',
  Contributor = 'Contributeur'
}

/**
 * Phases de projet
 */
export enum ProjectPhase {
  Design = 'Design',
  Development = 'Développement',
  Testing = 'Tests',
  Production = 'Production'
}

/**
 * Types de référence
 */
export enum ReferenceType {
  RGAA = 'RGAA',
  RGESN = 'RGESN',
  OPQUAST = 'OPQUAST'
}
