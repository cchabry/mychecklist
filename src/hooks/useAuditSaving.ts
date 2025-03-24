
import { useState } from 'react';
import { toast } from 'sonner';
import { Audit } from '@/lib/types';
import { notionWriteService } from '@/services/notion/notionWriteService';
import { notionApi } from '@/lib/notionProxy';

/**
 * Hook spécialisé pour la sauvegarde des audits
 */
export const useAuditSaving = () => {
  const [isSaving, setIsSaving] = useState(false);
  
  /**
   * Sauvegarde un audit de manière fiable
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
    
    setIsSaving(true);
    
    try {
      // Si on est en mode mock ou si l'utilisateur n'utilise pas Notion, simuler une sauvegarde
      if (options.isMockMode || !options.usingNotion) {
        console.log('🔍 useAuditSaving - Sauvegarde simulée (mode mock ou Notion désactivé)');
        
        // Simuler un délai pour l'UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        toast.success("Audit sauvegardé avec succès", {
          description: "Toutes les modifications ont été enregistrées (mode local)",
        });
        
        setIsSaving(false);
        return true;
      }
      
      // Vérifier que la base de données des checklists est configurée
      if (!options.checklistsDbId) {
        console.warn('⚠️ useAuditSaving - Base de données des checklists non configurée');
        
        toast.warning('Base de données des checklists non configurée', {
          description: 'Pour sauvegarder les audits dans Notion, configurez une base de données pour les checklists.'
        });
        
        setIsSaving(false);
        return true;
      }
      
      // Récupérer la clé API
      const apiKey = localStorage.getItem('notion_api_key');
      
      if (!apiKey) {
        console.error('❌ useAuditSaving - Clé API Notion non configurée');
        toast.error('Clé API Notion manquante', {
          description: 'Veuillez configurer votre clé API dans les paramètres.'
        });
        
        setIsSaving(false);
        return false;
      }
      
      // Utiliser le service d'écriture pour sauvegarder l'audit
      const success = await notionWriteService.saveAudit(audit, apiKey);
      
      setIsSaving(false);
      return success;
    } catch (error) {
      console.error('❌ useAuditSaving - Erreur lors de la sauvegarde:', error);
      
      toast.error('Erreur de sauvegarde', {
        description: 'Impossible de sauvegarder les modifications: ' + (error.message || 'Erreur inconnue')
      });
      
      setIsSaving(false);
      return false;
    }
  };
  
  return { saveAudit, isSaving };
};
