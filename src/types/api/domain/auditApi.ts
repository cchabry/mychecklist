
/**
 * Interface pour l'API des audits
 */

import { Audit } from '@/types/domain';

/**
 * Données pour créer un audit
 */
export interface CreateAuditData {
  projectId: string;
  name: string;
  description?: string;
  status?: string;
}

/**
 * Données pour mettre à jour un audit
 */
export interface UpdateAuditData {
  name?: string;
  description?: string;
  status?: string;
}

export interface AuditApi {
  getAudits(projectId: string): Promise<Audit[]>;
  getAuditById(id: string): Promise<Audit | null>;
  createAudit(audit: CreateAuditData): Promise<Audit>;
  updateAudit(id: string, data: UpdateAuditData): Promise<Audit>;
  deleteAudit(id: string): Promise<boolean>;
}
