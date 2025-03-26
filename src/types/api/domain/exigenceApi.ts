
/**
 * Interface pour l'API des exigences
 */

import { Exigence } from '@/types/domain';

export interface ExigenceApi {
  getExigences(projectId: string): Promise<Exigence[]>;
  getExigenceById(id: string): Promise<Exigence>;
  createExigence(exigence: Omit<Exigence, 'id'>): Promise<Exigence>;
  updateExigence(exigence: Exigence): Promise<Exigence>;
  deleteExigence(id: string): Promise<boolean>;
}
