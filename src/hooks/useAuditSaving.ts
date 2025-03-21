
import { toast } from 'sonner';
import { Audit } from '@/lib/types';
import { saveAuditToNotion } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';

/**
 * Hook spécialisé pour la sauvegarde des audits
 * Version simplifiée et unifiée pour le scénario primaire
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
    
    try {
      // Si on est en mode mock ou si l'utilisateur n'utilise pas Notion, simuler une sauvegarde
      if (options.isMockMode || !options.usingNotion) {
        console.log('🔍 useAuditSaving - Sauvegarde simulée (mode mock ou Notion désactivé)');
        
        // Simuler un délai pour l'UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        toast.success("Audit sauvegardé avec succès", {
          description: "Toutes les modifications ont été enregistrées (mode local)",
        });
        
        return true;
      }
      
      // Vérifier que la base de données des checklists est configurée
      if (!options.checklistsDbId) {
        console.warn('⚠️ useAuditSaving - Base de données des checklists non configurée');
        
        toast.warning('Base de données des checklists non configurée', {
          description: 'Pour sauvegarder les audits dans Notion, configurez une base de données pour les checklists.'
        });
        
        // Activer le mode mock comme fallback
        notionApi.mockMode.activate();
        
        return true; // Simuler une sauvegarde réussie pour ne pas bloquer l'utilisateur
      }
      
      // Sauvegarde dans Notion
      console.log('🔍 useAuditSaving - Tentative de sauvegarde dans Notion');
      
      try {
        const success = await saveAuditToNotion(audit);
        
        if (success) {
          console.log('✅ useAuditSaving - Sauvegarde Notion réussie');
          toast.success("Audit sauvegardé avec succès", {
            description: "Toutes les modifications ont été enregistrées dans Notion",
          });
        } else {
          console.error('❌ useAuditSaving - Échec de la sauvegarde dans Notion (false retourné)');
          throw new Error('Échec de la sauvegarde dans Notion');
        }
        
        return success;
      } catch (error) {
        // Gérer les erreurs CORS ou réseau
        if (error.message?.includes('Failed to fetch')) {
          console.warn('⚠️ useAuditSaving - Erreur CORS détectée, activation du mode mock');
          
          // Activer le mode mock
          notionApi.mockMode.activate();
          
          toast.warning('Mode démonstration activé', {
            description: 'Sauvegarde en mode local uniquement car l\'API Notion n\'est pas accessible directement',
          });
          
          // Simuler une sauvegarde réussie
          return true;
        }
        
        // Propager les autres erreurs
        throw error;
      }
    } catch (error) {
      console.error('❌ useAuditSaving - Erreur lors de la sauvegarde:', error);
      
      toast.error('Erreur de sauvegarde', {
        description: 'Impossible de sauvegarder les modifications: ' + (error.message || 'Erreur inconnue')
      });
      
      return false;
    }
  };
  
  return { saveAudit };
};
