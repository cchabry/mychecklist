
/**
 * Types pour les évaluations
 * 
 * Ce module définit les types de données pour représenter les évaluations
 * de conformité des pages échantillons par rapport aux exigences du projet.
 */

import { ComplianceLevel } from '../enums';
import { Attachment } from './attachment';

/**
 * Interface pour une évaluation
 * 
 * Une évaluation représente le résultat de l'audit d'une exigence pour une page spécifique.
 * Elle inclut un score de conformité, des commentaires, et des pièces jointes éventuelles.
 */
export interface Evaluation {
  /**
   * Identifiant unique de l'évaluation
   */
  id: string;
  
  /**
   * Identifiant de l'audit auquel appartient cette évaluation
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
   * Niveau de conformité attribué à la page pour cette exigence
   */
  score: ComplianceLevel;
  
  /**
   * Commentaire expliquant l'évaluation (observations, justifications, etc.)
   */
  comment?: string;
  
  /**
   * Liste des pièces jointes (captures d'écran, documents, etc.)
   */
  attachments?: Attachment[];
  
  /**
   * Date de création de l'évaluation (au format ISO)
   */
  createdAt: string;
  
  /**
   * Date de dernière modification de l'évaluation (au format ISO)
   */
  updatedAt: string;
}
