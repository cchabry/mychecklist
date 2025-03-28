
/**
 * Types pour le service d'évaluation
 * 
 * Ce module contient les définitions de types utilisés par le service d'évaluation
 * pour représenter les données d'évaluation et les paramètres des opérations.
 */

import { Evaluation } from '@/types/domain';
import { NotionResponse } from '../types';
import { ComplianceLevel } from '@/types/enums';

/**
 * Paramètres de filtrage des évaluations
 */
export interface EvaluationFilters {
  /**
   * Identifiant de l'audit à filtrer
   */
  auditId?: string;
  
  /**
   * Identifiant de la page échantillon à filtrer
   */
  pageId?: string;
  
  /**
   * Identifiant de l'exigence à filtrer
   */
  exigenceId?: string;
  
  /**
   * Niveau de conformité à filtrer
   */
  status?: number;
}

/**
 * Réponse API pour une liste d'évaluations
 */
export type EvaluationListResponse = NotionResponse<Evaluation[]>;

/**
 * Réponse API pour une seule évaluation
 */
export type EvaluationResponse = NotionResponse<Evaluation>;

/**
 * Réponse API pour la suppression d'une évaluation
 */
export type EvaluationDeleteResponse = NotionResponse<boolean>;

/**
 * Données minimales pour la création d'une évaluation
 */
export interface CreateEvaluationInput {
  /**
   * Identifiant de l'audit auquel appartient l'évaluation
   */
  auditId: string;
  
  /**
   * Identifiant de la page échantillon évaluée
   */
  pageId: string;
  
  /**
   * Identifiant de l'exigence évaluée
   */
  exigenceId: string;
  
  /**
   * Niveau de conformité attribué
   */
  score: ComplianceLevel;
  
  /**
   * Commentaire optionnel sur l'évaluation
   */
  comment?: string;
  
  /**
   * Liste des pièces jointes (captures d'écran, etc.)
   */
  attachments?: string[];
  
  /**
   * Date de création (générée automatiquement si non spécifiée)
   */
  createdAt?: string;
  
  /**
   * Date de dernière mise à jour (générée automatiquement si non spécifiée)
   */
  updatedAt?: string;
}
