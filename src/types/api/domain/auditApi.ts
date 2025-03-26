
/**
 * Interface pour l'API des audits
 */

import { Audit } from '@/types/domain';

export interface AuditApi {
  getAudits(projectId: string): Promise<Audit[]>;
  getAuditById(id: string): Promise<Audit>;
  createAudit(audit: Omit<Audit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Audit>;
  updateAudit(audit: Audit): Promise<Audit>;
  deleteAudit(id: string): Promise<boolean>;
}
