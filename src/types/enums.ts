
/**
 * Définitions des énumérations utilisées dans l'application
 * 
 * Ce fichier centralise toutes les énumérations pour garantir
 * leur cohérence à travers l'application.
 */

/**
 * Niveau d'importance d'une exigence
 */
export enum ImportanceLevel {
  NotApplicable = "N/A", // Non applicable
  Minor = "Mineur",      // Importance mineure
  Medium = "Moyen",      // Importance moyenne
  Important = "Important", // Importance élevée
  Major = "Majeur"       // Importance majeure/critique
}

/**
 * Niveau de priorité d'une action corrective
 */
export enum PriorityLevel {
  Low = "Faible",       // Priorité basse
  Medium = "Moyenne",   // Priorité moyenne
  High = "Haute",       // Priorité élevée
  Critical = "Critique" // Priorité critique
}

/**
 * Statut d'une entité (action, tâche, etc.)
 */
export enum StatusType {
  Todo = "À faire",     // À faire
  InProgress = "En cours", // En cours de réalisation
  Done = "Terminé",     // Terminé
  Canceled = "Annulé"   // Annulé
}

/**
 * Niveau de conformité d'une évaluation
 */
export enum ComplianceLevel {
  NotApplicable = "Non applicable", // Non applicable pour cette page
  NonCompliant = "Non conforme",    // Ne respecte pas l'exigence
  PartiallyCompliant = "Partiellement conforme", // Respecte partiellement l'exigence
  Compliant = "Conforme"           // Respecte pleinement l'exigence
}

/**
 * Statut d'un projet
 */
export enum ProjectStatus {
  PENDING = "En attente",
  ACTIVE = "En cours",
  COMPLETED = "Terminé",
  ARCHIVED = "Archivé"
}

/**
 * Mapping des chaînes de caractères vers les statuts de projet
 */
export const PROJECT_STATUS_MAPPING: Record<string, ProjectStatus> = {
  "En attente": ProjectStatus.PENDING,
  "pending": ProjectStatus.PENDING,
  "PENDING": ProjectStatus.PENDING,
  
  "En cours": ProjectStatus.ACTIVE,
  "active": ProjectStatus.ACTIVE,
  "ACTIVE": ProjectStatus.ACTIVE,
  
  "Terminé": ProjectStatus.COMPLETED,
  "completed": ProjectStatus.COMPLETED,
  "COMPLETED": ProjectStatus.COMPLETED,
  
  "Archivé": ProjectStatus.ARCHIVED,
  "archived": ProjectStatus.ARCHIVED,
  "ARCHIVED": ProjectStatus.ARCHIVED
};

/**
 * Convertit une chaîne de caractères en ProjectStatus
 */
export function mapStringToProjectStatus(status: string): ProjectStatus {
  const mappedStatus = PROJECT_STATUS_MAPPING[status];
  return mappedStatus || ProjectStatus.ACTIVE; // Valeur par défaut
}
