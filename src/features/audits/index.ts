
/**
 * Fonctionnalités liées aux audits
 * 
 * Ce module fournit des fonctions pour interagir avec les audits
 * via le service Notion, en gérant les conversions de données et
 * les erreurs.
 */

import { auditsApi } from '@/services/notion/api/audits';
import { Audit, CreateAuditData, UpdateAuditData } from './types';

// Réexporter les composants, hooks et utilitaires pour faciliter l'accès
export * from './components';
export * from './hooks';
export * from './types';
export * from './utils';
export * from './constants';

/**
 * Récupère tous les audits d'un projet
 * 
 * @param projectId - Identifiant du projet
 * @returns Promise résolvant vers un tableau d'audits
 * @throws Error si la récupération échoue
 */
export async function getProjectAudits(projectId: string): Promise<Audit[]> {
  try {
    return await auditsApi.getAudits(projectId);
  } catch (error) {
    console.error(`Erreur lors de la récupération des audits du projet ${projectId}:`, error);
    throw new Error(`Impossible de récupérer les audits: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Récupère un audit par son identifiant
 * 
 * @param id - Identifiant unique de l'audit
 * @returns Promise résolvant vers l'audit ou null si non trouvé
 * @throws Error si la récupération échoue
 */
export async function getAuditById(id: string): Promise<Audit | null> {
  try {
    const audit = await auditsApi.getAuditById(id);
    return audit;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'audit ${id}:`, error);
    throw new Error(`Impossible de récupérer l'audit: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Crée un nouvel audit
 * 
 * @param data - Données de l'audit à créer
 * @returns Promise résolvant vers l'audit créé
 * @throws Error si la création échoue
 */
export async function createAudit(data: CreateAuditData): Promise<Audit> {
  try {
    return await auditsApi.createAudit(data);
  } catch (error) {
    console.error(`Erreur lors de la création de l'audit:`, error);
    throw new Error(`Impossible de créer l'audit: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Met à jour un audit existant
 * 
 * @param id - Identifiant unique de l'audit
 * @param data - Données à mettre à jour
 * @returns Promise résolvant vers l'audit mis à jour
 * @throws Error si la mise à jour échoue
 */
export async function updateAudit(id: string, data: UpdateAuditData): Promise<Audit> {
  try {
    return await auditsApi.updateAudit(id, data);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'audit ${id}:`, error);
    throw new Error(`Impossible de mettre à jour l'audit: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Supprime un audit
 * 
 * @param id - Identifiant unique de l'audit à supprimer
 * @returns Promise résolvant vers true si la suppression a réussi
 * @throws Error si la suppression échoue
 */
export async function deleteAudit(id: string): Promise<boolean> {
  try {
    return await auditsApi.deleteAudit(id);
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'audit ${id}:`, error);
    throw new Error(`Impossible de supprimer l'audit: ${error instanceof Error ? error.message : String(error)}`);
  }
}
