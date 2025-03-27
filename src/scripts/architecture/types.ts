
/**
 * Types pour le système de vérification d'architecture
 */

/**
 * Structure d'un indicateur de succès pour une phase
 */
export interface SuccessIndicator {
  name: string;
  description: string;
  check: () => Promise<boolean>;
  weight: number; // Importance relative de l'indicateur (1-10)
}

/**
 * Structure d'une phase d'architecture
 */
export interface PhaseDefinition {
  name: string;
  description: string;
  indicators: SuccessIndicator[];
}

/**
 * Résultats détaillés d'une vérification
 */
export interface IndicatorResult {
  name: string;
  passed: boolean;
  weight: number;
}

/**
 * Résultat complet d'une vérification de phase
 */
export interface PhaseVerificationResult {
  completed: boolean;
  score: number;
  maxScore: number;
  percentage: number;
  results: IndicatorResult[];
}
