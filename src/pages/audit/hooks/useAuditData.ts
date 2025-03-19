
import { useEffect, useCallback } from 'react';
import { Audit } from '@/lib/types';
import { useAuditProject } from './useAuditProject';
import { useAuditSave } from './useAuditSave';
import { useChecklistDatabase } from './useChecklistDatabase';
import { useNotion } from '@/contexts/NotionContext';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';

/**
 * Hook principal pour gérer les données d'audit
 * Utilise des hooks spécialisés pour améliorer la séparation des responsabilités
 */
export const useAuditData = (projectId: string | undefined) => {
  console.log("useAuditData called with projectId:", projectId);
  
  // Accéder au contexte Notion pour savoir si on utilise Notion
  const { usingNotion } = useNotion();
  
  // Utiliser des hooks spécialisés
  const { project, audit, loading, notionError, setAudit, loadProject } = useAuditProject(projectId, usingNotion);
  const { isSaving, saveAudit } = useAuditSave(usingNotion);
  const { hasChecklistDb } = useChecklistDatabase();
  
  // Si nous avons une erreur Notion, activer automatiquement le mode mock
  useEffect(() => {
    if (notionError) {
      console.log("Activating mock mode due to Notion error in useAuditData");
      
      // Activer le mode mock s'il n'est pas déjà actif
      if (!notionApi.mockMode.isActive()) {
        notionApi.mockMode.activate();
        toast.info('Mode démonstration activé automatiquement', { 
          description: 'En raison d\'un problème de connexion à Notion, l\'application utilise des données fictives'
        });
      }
      
      // Force reload project with mock data after a short delay
      setTimeout(() => {
        console.log("Reloading project with mock data after Notion error");
        loadProject();
      }, 500);
    }
  }, [notionError, loadProject]);
  
  // Charger les données du projet au montage du composant
  useEffect(() => {
    console.log("useAuditData effect - calling loadProject with projectId:", projectId);
    if (projectId) {
      loadProject();
    } else {
      console.error("No projectId provided to useAuditData");
      toast.error("Erreur", {
        description: "Identifiant de projet manquant"
      });
    }
  }, [projectId, loadProject]);
  
  // Handler pour la sauvegarde de l'audit
  const handleSaveAudit = async () => {
    console.log("handleSaveAudit called for project:", projectId);
    if (!audit) {
      console.error("Cannot save audit: No audit data available");
      toast.error("Erreur de sauvegarde", {
        description: "Aucune donnée d'audit disponible"
      });
      return;
    }
    
    try {
      await saveAudit(audit);
      toast.success("Audit sauvegardé avec succès");
    } catch (error) {
      console.error("Error saving audit:", error);
      toast.error("Erreur de sauvegarde", {
        description: error.message || "Une erreur est survenue lors de la sauvegarde"
      });
      
      // Activer le mode mock en cas d'erreur de sauvegarde
      if (!notionApi.mockMode.isActive()) {
        notionApi.mockMode.activate();
        toast.info('Mode démonstration activé automatiquement', { 
          description: 'Suite à une erreur de sauvegarde, l\'application utilise des données fictives'
        });
      }
    }
  };
  
  console.log("useAuditData returning state:", { 
    hasProject: !!project, 
    hasAudit: !!audit, 
    loading, 
    hasError: !!notionError,
    mockModeActive: notionApi.mockMode.isActive()
  });
  
  return {
    project,
    audit,
    loading,
    notionError,
    hasChecklistDb,
    isSaving,
    setAudit,
    loadProject,
    handleSaveAudit,
    mockModeActive: notionApi.mockMode.isActive()
  };
};
