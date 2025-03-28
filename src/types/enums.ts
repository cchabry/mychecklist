
/**
 * Énumérations utilisées dans l'application
 * 
 * Ce fichier centralise toutes les énumérations utilisées par l'application
 * pour garantir la cohérence et éviter les duplications.
 */

/**
 * Niveaux d'importance pour les exigences
 */
export enum ImportanceLevel {
  NA = "N/A",
  Minor = "Mineur",
  Medium = "Moyen",
  Important = "Important",
  Major = "Majeur",
  NotApplicable = "N/A" // Alias pour la compatibilité
}

/**
 * Niveaux de conformité pour les évaluations
 */
export enum ComplianceLevel {
  Compliant = "Conforme",
  PartiallyCompliant = "Partiellement conforme",
  NonCompliant = "Non conforme",
  NotApplicable = "Non applicable"
}

/**
 * Niveaux de priorité pour les actions
 */
export enum PriorityLevel {
  Low = "Faible",
  Medium = "Moyenne",
  High = "Haute",
  Critical = "Critique"
}

/**
 * Types de statut pour les actions et les progrès
 */
export enum StatusType {
  Todo = "À faire",
  InProgress = "En cours",
  Done = "Terminée"
}

/**
 * Statuts des projets
 */
export enum ProjectStatus {
  Active = "active",
  Pending = "pending",
  Completed = "completed",
  Archived = "archived"
}
