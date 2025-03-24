
import { useCallback, useEffect, useRef } from 'react';
import { Audit } from '@/lib/types';
import { useAuditProject } from './useAuditProject';
import { useAuditSave } from './useAuditSave';
import { useChecklistDatabase } from './useChecklistDatabase';
import { useNotion } from '@/contexts/NotionContext';
import { toast } from 'sonner';
import { useAuditError } from './useAuditError';
import { useOperationModeListener } from '@/hooks/useOperationModeListener';
import { operationMode } from '@/services/operationMode';

/**
 * Hook principal pour gérer les données d'audit
 */
export const useAuditData = (projectId: string | undefined) => {
  console.log("useAuditData called with projectId:", projectId);
  
  // Utiliser le hook d'écoute du mode opérationnel
  const { isDemoMode } = useOperationModeListener();
  
  // Accéder au contexte Notion
  const { usingNotion } = useNotion();
  
  // Utiliser le hook de gestion d'erreurs
  const { handleError, error: auditError } = useAuditError();
  
  // Déterminer si on utilise Notion en fonction du mode actif
  const shouldUseNotion = usingNotion && !isDemoMode;
  
  // Utiliser des hooks spécialisés avec le mode réel si possible
  const { project, audit, loading, notionError, setAudit, loadProject } = useAuditProject(projectId, shouldUseNotion);
  const { isSaving, saveAudit } = useAuditSave(shouldUseNotion);
  const { hasChecklistDb } = useChecklistDatabase();
  
  // Si nous avons une erreur Notion, l'envoyer au gestionnaire d'erreurs
  useEffect(() => {
    if (notionError) {
      console.log("Handling Notion error in useAuditData:", notionError);
      
      // Convertir l'erreur Notion en format AuditError
      const auditError = {
        message: notionError.error,
        details: notionError.context,
        source: "Chargement des données d'audit"
      };
      
      // Signaler l'erreur au hook d'audit
      handleError(auditError);
      
      // Signaler également l'erreur au système operationMode
      operationMode.handleConnectionError(
        new Error(notionError.error || "Erreur inconnue"), 
        notionError.context || "Chargement des données d'audit"
      );
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
      
      // Signaler l'opération réussie
      operationMode.handleSuccessfulOperation();
    } catch (error) {
      console.error("Error saving audit:", error);
      
      // Signaler l'erreur au hook d'audit
      handleError(error, "Sauvegarde de l'audit");
      
      // Signaler également l'erreur via operationMode
      operationMode.handleConnectionError(error, "Sauvegarde de l'audit");
    }
  };
  
  console.log("useAuditData returning state:", { 
    hasProject: !!project, 
    hasAudit: !!audit, 
    loading, 
    hasError: !!auditError,
    isDemoMode
  });
  
  return {
    project,
    audit,
    loading,
    notionError: auditError || notionError,
    hasChecklistDb,
    isSaving,
    mockModeActive: isDemoMode, // Gardé pour compatibilité
    setAudit,
    loadProject,
    handleSaveAudit
  };
};
