
/**
 * Type pour l'API des exigences
 */

import { Exigence } from '@/types/domain';
import { ImportanceLevel } from '@/types/enums';

/**
 * Interface pour les données de création d'une exigence
 */
export interface CreateExigenceData {
  projectId: string;
  itemId: string;
  importance: ImportanceLevel;
  comment?: string;
}

/**
 * Interface pour les données de mise à jour d'une exigence
 */
export interface UpdateExigenceData {
  id: string;
  importance?: ImportanceLevel;
  comment?: string;
}

/**
 * Interface pour l'API des exigences
 */
export interface ExigenceApi {
  /**
   * Récupère toutes les exigences d'un projet
   */
  getExigences(projectId: string): Promise<Exigence[]>;
  
  /**
   * Récupère une exigence par son ID
   */
  getExigenceById(id: string): Promise<Exigence | null>;
  
  /**
   * Crée une nouvelle exigence
   */
  createExigence(data: CreateExigenceData): Promise<Exigence>;
  
  /**
   * Met à jour une exigence existante
   */
  updateExigence(exigence: Exigence): Promise<Exigence>;
  
  /**
   * Supprime une exigence
   */
  deleteExigence(id: string): Promise<boolean>;
}
