
/**
 * Types pour les hooks Notion
 * 
 * Ce module définit les types communs utilisés par les hooks Notion
 * pour assurer une interface cohérente.
 */

import { ConnectionStatus, NotionTestResponse } from '@/types/api/notionApi';
import { AppError } from '@/types/error';

/**
 * Résultat standardisé pour les hooks Notion
 * 
 * Interface générique pour normaliser les retours des hooks Notion
 * 
 * @template T - Type des données retournées par le hook
 */
export interface NotionHookResult<T = any> {
  /** Données retournées par le hook */
  data?: T;
  /** Indique si une requête est en cours */
  isLoading: boolean;
  /** Erreur survenue lors de la requête */
  error?: AppError;
  /** Indique si une erreur s'est produite */
  isError: boolean;
}

/**
 * Résultat du hook useNotionService
 */
export interface NotionServiceHookResult {
  /** Indique si le service Notion est configuré */
  isConfigured: boolean;
  /** Statut de connexion actuel */
  connectionStatus: ConnectionStatus;
  /** Indique si une requête est en cours */
  isLoading: boolean;
  /** Dernière erreur survenue */
  lastError?: AppError;
  /** Indique si le service est connecté à Notion */
  isConnected: boolean;
  /** Indique si le service est en mode mock */
  isMockMode: boolean;
  
  /** Configure le service Notion avec les paramètres fournis */
  setNotionConfig: (apiKey: string, projectsDbId: string, checklistsDbId?: string) => boolean;
  /** Teste la connexion à l'API Notion */
  testConnection: () => Promise<NotionTestResponse>;
  /** Récupère la configuration actuelle du service */
  getConfig: () => any;
  
  /** Service Notion sous-jacent */
  notion: any;
}
