
/**
 * Hooks spécifiques aux audits
 * 
 * Ce fichier exporte tous les hooks liés à la fonctionnalité de gestion des audits
 */

export { useAudits } from './useAudits';
export { useAuditById } from './useAuditById';
export { useCreateAudit } from './useCreateAudit';
export { useUpdateAudit } from './useUpdateAudit';
export { useDeleteAudit } from './useDeleteAudit';

// Re-export des hooks génériques utilisés par la feature audits
export { useProjectAudits } from '@/hooks/useProjectAudits';
