
import { Audit } from '@/lib/types';
import { notionWriteService } from '@/services/notion/notionWriteService';

/**
 * Hook spécialisé pour la sauvegarde des audits
 * Version simplifiée utilisant le service d'écriture centralisé
 */
export const useAuditSaving = () => {
  /**
   * Sauvegarde un audit de manière fiable
   * Gestion des cas mode mock et erreurs CORS
   */
  const saveAudit = async (
    audit: Audit | null,
    options: {
      usingNotion: boolean,
      isMockMode: boolean,
      checklistsDbId: string | null
    }
  ): Promise<boolean> => {
    console.log('🔍 useAuditSaving - Début de la sauvegarde d\'audit', { 
      auditId: audit?.id,
      projectId: audit?.projectId,
      options
    });
    
    if (!audit) {
      console.error('❌ useAuditSaving - Aucun audit à sauvegarder');
      return false;
    }
    
    // Utiliser le service centralisé pour l'écriture
    return await notionWriteService.saveAudit(audit);
  };
  
  return { saveAudit };
};
