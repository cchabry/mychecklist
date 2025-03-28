
/**
 * Types pour les entités de domaine Notion
 * 
 * Ce module définit les interfaces et types spécifiques aux entités
 * manipulées par les services Notion, avant transformation en modèles de domaine.
 */

/**
 * Types d'entités de domaine dans Notion
 * 
 * Énumération des différents types d'entités gérées par l'API Notion
 */
export enum NotionEntityType {
  /** Projet */
  Project = 'project',
  /** Checklist */
  Checklist = 'checklist',
  /** Audit */
  Audit = 'audit',
  /** Page d'échantillon */
  SamplePage = 'samplePage',
  /** Exigence */
  Exigence = 'exigence',
  /** Évaluation */
  Evaluation = 'evaluation',
  /** Action corrective */
  Action = 'action',
  /** Suivi de progression */
  Progress = 'progress'
}

/**
 * Interface de base pour toutes les entités Notion
 */
export interface BaseNotionEntity {
  /** Identifiant unique */
  id: string;
  /** Date de création */
  createdAt: string;
  /** Date de dernière modification */
  updatedAt: string;
}

/**
 * Entité Notion représentant un projet
 */
export interface NotionProjectEntity extends BaseNotionEntity {
  /** Nom du projet */
  name: string;
  /** URL du site web */
  url: string;
  /** Description du projet */
  description?: string;
  /** Progression de l'audit */
  progress: number;
  /** Statut du projet */
  status?: string;
}

/**
 * Entité Notion représentant un item de checklist
 */
export interface NotionChecklistItemEntity extends BaseNotionEntity {
  /** Titre de l'item */
  consigne: string;
  /** Description détaillée */
  description: string;
  /** Catégorie principale */
  category: string;
  /** Sous-catégorie */
  subcategory?: string;
  /** Références externes */
  reference?: string[];
  /** Profils concernés */
  profil?: string[];
  /** Phase du projet */
  phase?: string[];
  /** Effort de mise en œuvre */
  effort?: string;
  /** Priorité */
  priority?: string;
}
