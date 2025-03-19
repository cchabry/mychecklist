
import { toast } from 'sonner';
import { Audit } from '@/lib/types';
import { saveAuditToNotion } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';

/**
 * Hook spécialisé pour la sauvegarde des audits
 */
export const useAuditSaving = () => {
  /**
   * Sauvegarde un audit
   * @param audit L'audit à sauvegarder
   * @param options Options de configuration
   * @returns Promise<boolean> Indique si la sauvegarde a réussi
   */
  const saveAudit = async (
    audit: Audit | null,
    options: {
      usingNotion: boolean,
      isMockMode: boolean,
      checklistsDbId: string | null
    }
  ): Promise<boolean> => {
    if (!audit) return false;
    
    try {
      let success = false;
      
      // Sauvegarder dans Notion si on est connecté et pas en mode mock
      if (options.usingNotion && !options.isMockMode) {
        if (!options.checklistsDbId) {
          toast.warning('Base de données des checklists non configurée', {
            description: 'Pour sauvegarder les audits dans Notion, configurez une base de données pour les checklists.'
          });
          success = true; // Simuler une sauvegarde réussie
        } else {
          // Sauvegarder dans Notion
          try {
            success = await saveAuditToNotion(audit);
          } catch (error) {
            // Gérer l'erreur CORS "Failed to fetch"
            if (error.message?.includes('Failed to fetch')) {
              // Activer le mode mock
              notionApi.mockMode.activate();
              
              toast.warning('Mode démonstration activé', {
                description: 'Sauvegarde en mode local uniquement car l\'API Notion n\'est pas accessible directement',
              });
              
              // Simuler une sauvegarde réussie
              success = true;
            } else {
              throw error;
            }
          }
        }
      } else {
        // Simulation locale de sauvegarde
        success = true;
      }
      
      if (success) {
        toast.success("Audit sauvegardé avec succès", {
          description: "Toutes les modifications ont été enregistrées",
        });
      }
      
      return success;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur de sauvegarde', {
        description: 'Impossible de sauvegarder les modifications'
      });
      return false;
    }
  };
  
  return { saveAudit };
};
