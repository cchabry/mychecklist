
/**
 * Types pour l'API Notion
 * 
 * Ce module définit les interfaces et types utilisés pour interagir avec l'API Notion
 * ainsi que les structures de données communes pour les opérations sur cette API.
 */

import {
  ProjectApi, 
  AuditApi, 
  ChecklistApi, 
  ExigenceApi, 
  SamplePageApi, 
  EvaluationApi, 
  ActionApi
} from './domain';

/**
 * Résultat d'une opération API Notion
 * 
 * Type générique qui représente la réponse standard des opérations d'API Notion,
 * incluant les données en cas de succès ou les détails d'erreur en cas d'échec.
 * 
 * @template T - Type des données retournées en cas de succès
 */
export interface NotionAPIResponse<T = any> {
  /** Indique si l'opération a réussi */
  success: boolean;
  /** Données retournées en cas de succès */
  data?: T;
  /** Informations d'erreur en cas d'échec */
  error?: {
    /** Message d'erreur lisible */
    message: string;
    /** Code d'erreur optionnel */
    code?: string;
    /** Code HTTP optionnel */
    status?: number;
    /** Détails supplémentaires sur l'erreur */
    details?: any;
  };
}

/**
 * Statut de connexion Notion
 * 
 * Énumération représentant les différents états possibles
 * de la connexion avec l'API Notion.
 */
export enum ConnectionStatus {
  /** Connecté à l'API Notion */
  Connected = 'connected',
  /** Déconnecté de l'API Notion */
  Disconnected = 'disconnected',
  /** Erreur de connexion avec l'API Notion */
  Error = 'error',
  /** Connexion en cours d'établissement */
  Loading = 'loading'
}

/**
 * Utilisateur Notion
 * 
 * Informations sur l'utilisateur connecté à Notion
 */
export interface NotionUser {
  /** Identifiant unique de l'utilisateur */
  id: string;
  /** Nom complet de l'utilisateur */
  name: string;
  /** URL de l'avatar de l'utilisateur */
  avatarUrl?: string;
  /** Type d'utilisateur (personne, bot, etc.) */
  type: string;
}

/**
 * Réponse de test de connexion Notion
 * 
 * Informations retournées lors d'un test de connexion à l'API Notion
 */
export interface NotionTestResponse {
  /** Informations sur l'utilisateur connecté */
  user?: NotionUser;
  /** Nom de l'espace de travail */
  workspace?: string;
  /** Horodatage du test de connexion */
  timestamp: number;
}

/**
 * Interface unifiée pour l'API Notion
 * 
 * Cette interface agrège toutes les APIs par domaine métier pour fournir
 * un point d'accès unique et cohérent à l'API Notion.
 */
export interface NotionAPI extends 
  ProjectApi,
  AuditApi,
  ChecklistApi,
  ExigenceApi,
  SamplePageApi,
  EvaluationApi,
  ActionApi {
  
  /**
   * Teste la connexion à l'API Notion
   * 
   * @returns Promise résolvant vers les informations de connexion
   * @throws Error si le test échoue
   */
  testConnection(): Promise<NotionTestResponse>;
}

/**
 * Options de configuration pour l'API Notion
 * 
 * Paramètres utilisés pour configurer l'accès à l'API Notion
 */
export interface NotionAPIOptions {
  /** Clé d'API Notion */
  apiKey?: string;
  /** ID de la base de données principale */
  databaseId?: string;
  /** ID de la base de données des items de checklist */
  checklistsDbId?: string;
  /** ID de la base de données des projets */
  projectsDbId?: string;
  /** ID de la base de données des audits */
  auditsDbId?: string;
  /** ID de la base de données des pages d'échantillon */
  pagesDbId?: string;
  /** ID de la base de données des exigences */
  exigencesDbId?: string;
  /** ID de la base de données des évaluations */
  evaluationsDbId?: string;
  /** ID de la base de données des actions correctives */
  actionsDbId?: string;
  /** ID de la base de données des progrès d'actions */
  progressDbId?: string;
  /** Activer le mode mock (données simulées) */
  mockMode?: boolean;
  /** Activer le mode debug (logs détaillés) */
  debug?: boolean;
}
