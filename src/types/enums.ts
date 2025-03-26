
/**
 * Énumérations et types constants pour l'application d'audit
 */

// Niveaux d'importance pour les exigences
export enum ImportanceLevel {
  NA = 'N/A',
  MINEUR = 'mineur',
  MOYEN = 'moyen',
  IMPORTANT = 'important',
  MAJEUR = 'majeur'
}

// Statuts de conformité pour les évaluations
export enum ComplianceStatus {
  CONFORME = 'conforme',
  PARTIEL = 'partiel',
  NON_CONFORME = 'non_conforme',
  NON_APPLICABLE = 'non_applicable'
}

// Priorités pour les actions correctives
export enum ActionPriority {
  FAIBLE = 'faible',
  MOYENNE = 'moyenne',
  HAUTE = 'haute',
  CRITIQUE = 'critique'
}

// Statuts pour les actions correctives
export enum ActionStatus {
  A_FAIRE = 'a_faire',
  EN_COURS = 'en_cours',
  TERMINEE = 'terminee'
}

// Types de profil utilisateur
export enum UserProfile {
  PRODUCT_OWNER = 'Product Owner',
  UX_DESIGNER = 'UX designer',
  UI_DESIGNER = 'UI designer',
  DEVELOPPEUR = 'Développeur',
  CONTRIBUTEUR = 'Contributeur'
}

// Phases de projet
export enum ProjectPhase {
  CONCEPTION = 'Conception',
  DESIGN = 'Design',
  DEVELOPPEMENT = 'Développement',
  TESTS = 'Tests',
  PRODUCTION = 'Production'
}

// Valeurs pour le calcul des scores
export const COMPLIANCE_VALUES: Record<ComplianceStatus, number> = {
  [ComplianceStatus.CONFORME]: 1,
  [ComplianceStatus.PARTIEL]: 0.5,
  [ComplianceStatus.NON_CONFORME]: 0,
  [ComplianceStatus.NON_APPLICABLE]: 0
};

// Type pour les références aux référentiels externes
export interface ReferenceType {
  code: string;
  name: string;
}
