
import { useAuditState } from './useAuditState';

/**
 * Hook principal pour gérer les données d'audit
 * Utilise des hooks spécialisés pour améliorer la séparation des responsabilités
 */
export const useAuditData = (projectId: string | undefined) => {
  return useAuditState(projectId);
};
