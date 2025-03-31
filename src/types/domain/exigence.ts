
/**
 * Niveau d'importance d'une exigence
 */
export enum ImportanceLevel {
  NotApplicable = "Non applicable",
  Minor = "Mineur",
  Medium = "Moyen",
  Important = "Important",
  Major = "Majeur"
}

/**
 * Type représentant une exigence
 */
export interface Exigence {
  id: string;
  projectId: string;
  itemId: string;
  importance: ImportanceLevel;
  comment?: string;
}
