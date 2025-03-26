
/**
 * Types du domaine de l'application
 * 
 * Ce module définit les types et interfaces représentant le modèle
 * de données métier de l'application d'audit.
 */

// Réexporter les types spécifiques
export * from './project';
export * from './audit';
export * from './checklist';

// Importer les énumérations depuis le fichier central
import { 
  ImportanceLevel,
  ComplianceLevel as ComplianceStatus,
  PriorityLevel as ActionPriority,
  StatusType as ActionStatus
} from '../enums';

// Re-exporter avec des alias pour maintenir la compatibilité
export { ImportanceLevel, ComplianceStatus, ActionPriority, ActionStatus };

/**
 * Exigence de projet
 * 
 * Représente une exigence spécifique à un projet, basée sur
 * un item de checklist avec un niveau d'importance personnalisé.
 */
export interface Exigence {
  /** Identifiant unique de l'exigence */
  id: string;
  /** Identifiant du projet auquel l'exigence est associée */
  projectId: string;
  /** Identifiant de l'item de checklist de référence */
  itemId: string;
  /** Niveau d'importance de l'exigence pour ce projet */
  importance: ImportanceLevel;
  /** Commentaire ou précision concernant l'exigence */
  comment?: string;
}

/**
 * Page d'échantillon
 * 
 * Représente une page web à auditer dans le cadre d'un projet.
 */
export interface SamplePage {
  /** Identifiant unique de la page */
  id: string;
  /** Identifiant du projet auquel la page appartient */
  projectId: string;
  /** URL de la page */
  url: string;
  /** Titre de la page */
  title: string;
  /** Description ou contexte de la page */
  description?: string;
  /** Ordre d'affichage dans l'échantillon */
  order: number;
}

/**
 * Évaluation d'une page pour une exigence
 * 
 * Représente le résultat de l'évaluation d'une page spécifique
 * au regard d'une exigence particulière dans le cadre d'un audit.
 */
export interface Evaluation {
  /** Identifiant unique de l'évaluation */
  id: string;
  /** Identifiant de l'audit auquel l'évaluation appartient */
  auditId: string;
  /** Identifiant de la page évaluée */
  pageId: string;
  /** Identifiant de l'exigence évaluée */
  exigenceId: string;
  /** Score de conformité attribué */
  score: ComplianceStatus;
  /** Commentaire justifiant l'évaluation */
  comment?: string;
  /** Pièces jointes (captures d'écran, fichiers de preuve) */
  attachments?: string[];
  /** Date de création de l'évaluation */
  createdAt: string;
  /** Date de dernière mise à jour de l'évaluation */
  updatedAt: string;
}

/**
 * Action corrective
 * 
 * Représente une action à entreprendre suite à une évaluation
 * non conforme, avec des informations sur la personne responsable
 * et l'échéance.
 */
export interface CorrectiveAction {
  /** Identifiant unique de l'action */
  id: string;
  /** Identifiant de l'évaluation concernée */
  evaluationId: string;
  /** Score cible à atteindre */
  targetScore: ComplianceStatus;
  /** Niveau de priorité de l'action */
  priority: ActionPriority;
  /** Date d'échéance */
  dueDate: string;
  /** Personne responsable de l'action */
  responsible: string;
  /** Commentaire ou description de l'action */
  comment?: string;
  /** État actuel de l'action */
  status: ActionStatus;
}

/**
 * Suivi des corrections
 * 
 * Représente une intervention ou un progrès réalisé
 * dans le cadre d'une action corrective.
 */
export interface ActionProgress {
  /** Identifiant unique du suivi */
  id: string;
  /** Identifiant de l'action concernée */
  actionId: string;
  /** Date de l'intervention */
  date: string;
  /** Personne ayant réalisé l'intervention */
  responsible: string;
  /** Commentaire ou description de l'intervention */
  comment?: string;
  /** Score atteint après l'intervention */
  score: ComplianceStatus;
  /** État de l'action après l'intervention */
  status: ActionStatus;
}
