
/**
 * Hooks spécifiques aux audits
 * 
 * Ce fichier exporte tous les hooks liés à la fonctionnalité de gestion des audits
 */

import { useAudits } from './useAudits';
import { useAuditById } from './useAuditById';
import { useCreateAudit } from './useCreateAudit';
import { useUpdateAudit } from './useUpdateAudit';
import { useDeleteAudit } from './useDeleteAudit';

export { 
  useAudits, 
  useAuditById, 
  useCreateAudit,
  useUpdateAudit,
  useDeleteAudit
};

// Re-export des hooks génériques utilisés par la feature audits
export { useProjectAudits } from '@/hooks/useProjectAudits';
