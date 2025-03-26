
/**
 * Utilitaires pour le service d'audits
 */

import { Audit } from '@/types/domain';

/**
 * Génère des audits fictifs pour le mode démo
 */
export const generateMockAudits = (projectId: string): Audit[] => {
  const now = new Date().toISOString();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  return [
    {
      id: 'audit-1',
      projectId,
      name: "Audit initial",
      description: "Premier audit du projet",
      createdAt: lastMonth.toISOString(),
      updatedAt: lastMonth.toISOString(),
      progress: 100,
      version: "1.0",
      itemsCount: 10
    },
    {
      id: 'audit-2',
      projectId,
      name: "Audit de suivi",
      description: "Vérification des corrections apportées",
      createdAt: now,
      updatedAt: now,
      progress: 50,
      version: "1.1",
      itemsCount: 15
    }
  ];
};

