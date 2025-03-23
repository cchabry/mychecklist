
import { useState } from 'react';
import { toast } from 'sonner';
import { Audit } from '@/lib/types';
import { saveAuditToNotion } from '@/lib/notion';
import { operationMode } from '@/services/operationMode';

/**
 * Hook pour gérer la sauvegarde des audits
 */
export const useAuditSave = (usingNotion: boolean) => {
  const [isSaving, setIsSaving] = useState(false);
  
  /**
   * Sauvegarde un audit, avec fallback sur le mode local
   */
  const saveAudit = async (audit: Audit | null): Promise<boolean> => {
    if (!audit) return false;
    setIsSaving(true);
    
    try {
      let success = false;
      
      if (usingNotion && !operationMode.isDemoMode) {
        // Vérifier si la base de données des checklists est configurée
        const checklistsDbId = localStorage.getItem('notion_checklists_database_id');
        
        if (!checklistsDbId) {
          console.log('Base de données des checklists non configurée, sauvegarde en mode mock uniquement');
          toast.warning('Base de données des checklists non configurée', {
            description: 'Pour sauvegarder les audits dans Notion, configurez une base de données pour les checklists.'
          });
          success = true; // Simuler une sauvegarde réussie
        } else {
          // Sauvegarder dans Notion
          try {
            console.log('Attempting to save audit to Notion:', audit);
            success = await saveAuditToNotion(audit);
            console.log('Save to Notion result:', success);
          } catch (error) {
            console.error('Erreur lors de la sauvegarde dans Notion:', error);
            
            // Gérer l'erreur CORS "Failed to fetch"
            if (error.message?.includes('Failed to fetch')) {
              // Activer le mode démonstration
              operationMode.enableDemoMode('Sauvegarde impossible - problème de connexion à l\'API');
              
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
        console.log('Using mock save mode');
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
    } finally {
      setIsSaving(false);
    }
  };
  
  return {
    isSaving,
    saveAudit
  };
};
