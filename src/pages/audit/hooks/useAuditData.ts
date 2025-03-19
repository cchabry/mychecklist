
import { useEffect, useCallback, useRef } from 'react';
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
 * Version prototype - utilise toujours des données mockées
 */
export const useAuditData = (projectId: string | undefined) => {
  console.log("useAuditData called with projectId:", projectId);
  
  // Référence pour savoir si l'initialisation a déjà été faite
  const initialized = useRef(false);
  
  // Force le mode démo pour le prototype, mais une seule fois
  useEffect(() => {
    if (!initialized.current && !notionApi.mockMode.isActive()) {
      console.log("Activation du mode démo pour le prototype");
      notionApi.mockMode.activate();
      initialized.current = true;
    }
  }, []);
  
  // Accéder au contexte Notion pour savoir si on utilise Notion
  const { usingNotion } = useNotion();
  
  // Utiliser le hook de gestion d'erreurs
  const { handleError, error: auditError } = useAuditError();
  
  // Utiliser des hooks spécialisés
  const { project, audit, loading, notionError, setAudit, loadProject } = useAuditProject(projectId, false); // Force usingNotion à false
  const { isSaving, saveAudit } = useAuditSave(false); // Force usingNotion à false
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
        isCritical: false // Changed to false to avoid redirection in prototype mode
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
    mockModeActive: notionApi.mockMode.isActive()
  });
  
  return {
    project,
    audit,
    loading,
    notionError: auditError || notionError,
    hasChecklistDb,
    isSaving,
    setAudit,
    loadProject,
    handleSaveAudit,
    mockModeActive: notionApi.mockMode.isActive()
  };
};
