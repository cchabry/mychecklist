
import { useEffect, useCallback, useRef, useState } from 'react';
import { Audit } from '@/lib/types';
import { useAuditProject } from './useAuditProject';
import { useAuditSave } from './useAuditSave';
import { useChecklistDatabase } from './useChecklistDatabase';
import { useNotion } from '@/contexts/NotionContext';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { useAuditError, AuditError } from './useAuditError';

/**
 * Hook principal pour gérer les données d'audit
 */
export const useAuditData = (projectId: string | undefined) => {
  console.log("useAuditData called with projectId:", projectId);
  
  // Définir un état pour suivre si le mode mock est actif
  const [mockModeActive, setMockModeActive] = useState(notionApi.mockMode.isActive());
  
  // Mettre à jour l'état du mode mock périodiquement
  useEffect(() => {
    const updateMockMode = () => {
      setMockModeActive(notionApi.mockMode.isActive());
    };
    
    // Vérifier immédiatement
    updateMockMode();
    
    // Puis vérifier périodiquement
    const interval = setInterval(updateMockMode, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Accéder au contexte Notion pour savoir si on utilise Notion
  const { usingNotion } = useNotion();
  
  // Utiliser le hook de gestion d'erreurs
  const { handleError, error: auditError } = useAuditError();
  
  // Déterminer si on utilise Notion en fonction du mode mock
  const shouldUseNotion = usingNotion && !mockModeActive;
  
  // Utiliser des hooks spécialisés avec le mode réel si possible
  const { project, audit, loading, notionError, setAudit, loadProject } = useAuditProject(projectId, shouldUseNotion);
  const { isSaving, saveAudit } = useAuditSave(shouldUseNotion);
  const { hasChecklistDb } = useChecklistDatabase();
  
  // Si nous avons une erreur Notion, l'envoyer au gestionnaire d'erreurs
  useEffect(() => {
    if (notionError) {
      console.log("Handling Notion error in useAuditData:", notionError);
      // Convert the Notion error object to a format handleError can accept
      const auditError: AuditError = {
        message: notionError.error,
        details: notionError.context,
        source: "Chargement des données d'audit"
      };
      handleError(auditError);
    }
  }, [notionError, handleError]);
  
  // Référence pour suivre si le projet a été chargé
  const projectLoaded = useRef(false);
  
  // Charger les données du projet au montage du composant, une seule fois
  useEffect(() => {
    if (projectId && !projectLoaded.current) {
      console.log("useAuditData effect - calling loadProject with projectId:", projectId);
      loadProject();
      projectLoaded.current = true;
    } else if (!projectId) {
      console.error("No projectId provided to useAuditData");
      handleError({
        message: "Identifiant de projet manquant",
        isCritical: false
      });
    }
  }, [projectId, loadProject, handleError]);
  
  // Handler pour la sauvegarde de l'audit
  const handleSaveAudit = async () => {
    console.log("handleSaveAudit called for project:", projectId);
    if (!audit) {
      console.error("Cannot save audit: No audit data available");
      handleError({
        message: "Erreur de sauvegarde",
        details: "Aucune donnée d'audit disponible"
      });
      return;
    }
    
    try {
      await saveAudit(audit);
      toast.success("Audit sauvegardé avec succès");
    } catch (error) {
      console.error("Error saving audit:", error);
      handleError(error, "Sauvegarde de l'audit");
    }
  };
  
  console.log("useAuditData returning state:", { 
    hasProject: !!project, 
    hasAudit: !!audit, 
    loading, 
    hasError: !!auditError,
    mockModeActive
  });
  
  return {
    project,
    audit,
    loading,
    notionError: auditError || notionError,
    hasChecklistDb,
    isSaving,
    mockModeActive,
    setAudit,
    loadProject,
    handleSaveAudit
  };
};
