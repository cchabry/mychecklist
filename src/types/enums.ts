
/**
 * Énumérations pour l'application
 */

/**
 * Niveaux d'importance pour les exigences
 * Doit correspondre à ImportanceLevel dans domain/exigence.ts
 */
export enum ImportanceLevel {
  NotApplicable = "Non applicable",
  Minor = "Mineur",
  Medium = "Moyen",
  Important = "Important",
  Major = "Majeur"
}

/**
 * Niveaux de conformité pour les évaluations
 * Doit correspondre à ComplianceStatus dans domain/evaluation.ts
 */
export enum ComplianceLevel {
  Compliant = "Conforme",
  PartiallyCompliant = "Partiellement conforme",
  NonCompliant = "Non conforme",
  NotApplicable = "Non applicable"
}

/**
 * Priorités pour les actions correctives
 * Doit correspondre à ActionPriority dans domain/action.ts
 */
export enum PriorityLevel {
  Low = "Faible",
  Medium = "Moyenne",
  High = "Haute",
  Critical = "Critique"
}

/**
 * Statuts pour les actions et progrès
 * Doit correspondre à ActionStatus dans domain/action.ts
 */
export enum StatusType {
  Todo = "À faire",
  InProgress = "En cours",
  Done = "Terminée"
}

/**
 * Profils utilisateurs
 */
export enum UserProfile {
  ProductOwner = "Product Owner",
  UXDesigner = "UX designer",
  UIDesigner = "UI designer",
  Developer = "Développeur",
  Contributor = "Contributeur"
}

/**
 * Phases de projet
 */
export enum ProjectPhase {
  Design = "Design",
  Development = "Développement",
  Testing = "Tests",
  Production = "Production"
}

/**
 * Types de référence
 */
export enum ReferenceType {
  RGAA = "RGAA",
  RGESN = "RGESN",
  OPQUAST = "OPQUAST"
}
