
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
  
  // Si nous avons une erreur Notion et que nous ne sommes pas en mode mock, activer le mode mock
  useEffect(() => {
    if (notionError && !notionApi.mockMode.isActive()) {
      console.log("Activating mock mode due to Notion error in useAuditData");
      notionApi.mockMode.activate();
      toast.info('Mode démonstration activé automatiquement', { 
        description: 'En raison d\'un problème de connexion à Notion, l\'application utilise des données fictives'
      });
    }
  }, [notionError]);
  
  // Charger les données du projet au montage du composant
  useEffect(() => {
    console.log("useAuditData effect - calling loadProject with projectId:", projectId);
    if (projectId) {
      loadProject();
    } else {
      console.error("No projectId provided to useAuditData");
    }
  }, [projectId, loadProject]);
  
  // Handler pour la sauvegarde de l'audit
  const handleSaveAudit = async () => {
    console.log("handleSaveAudit called for project:", projectId);
    if (!audit) {
      console.error("Cannot save audit: No audit data available");
      return;
    }
    
    await saveAudit(audit);
  };
  
  console.log("useAuditData returning state:", { 
    hasProject: !!project, 
    hasAudit: !!audit, 
    loading, 
    hasError: !!notionError
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
    handleSaveAudit
  };
};
