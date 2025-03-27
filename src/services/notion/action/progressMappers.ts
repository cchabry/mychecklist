
/**
 * Mappers pour les données de progrès d'actions
 */

import { v4 as uuidv4 } from 'uuid';
import { ActionProgress } from '@/types/domain';
import { ComplianceLevel, StatusType } from '@/types/enums';
import { CreateProgressInput } from './types';

/**
 * Fonctions utilitaires pour mapper les données de progrès
 */
export const progressMappers = {
  /**
   * Crée un progrès simulé avec l'ID spécifié
   */
  createMockProgress(id: string): ActionProgress {
    return {
      id,
      actionId: 'action-123',
      date: new Date().toISOString(),
      responsible: 'John Doe',
      comment: 'Progrès simulé',
      score: ComplianceLevel.PartiallyCompliant,
      status: StatusType.InProgress
    };
  },

  /**
   * Transforme les données d'entrée en objet ActionProgress
   */
  mapInputToProgress(input: CreateProgressInput): ActionProgress {
    return {
      id: `progress-${uuidv4()}`,
      actionId: input.actionId,
      date: input.date,
      responsible: input.responsible,
      comment: input.comment,
      score: input.score, // Utilisation du ComplianceLevel de l'entrée
      status: input.status
    };
  }
};

export default progressMappers;
