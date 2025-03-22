
import { useEffect, useCallback, useRef, useState } from 'react';
import { Audit } from '@/lib/types';
import { useAuditProject } from './useAuditProject';
import { useAuditSave } from './useAuditSave';
import { useChecklistDatabase } from './useChecklistDatabase';
import { useNotion } from '@/contexts/NotionContext';
import { operationMode } from '@/services/operationMode';
import { toast } from 'sonner';
import { useAuditError, AuditError } from './useAuditError';

/**
 * Hook principal pour gérer les données d'audit
 */
export const useAuditData = (projectId: string | undefined) => {
  console.log("useAuditData called with projectId:", projectId);
  
  // Définir un état pour suivre si le mode démo est actif
  const [demoModeActive, setDemoModeActive] = useState(operationMode.isDemoMode);
  
  // Mettre à jour l'état du mode démo lors des changements
  useEffect(() => {
    const unsubscribe = operationMode.subscribe((newMode) => {
      setDemoModeActive(operationMode.isDemoMode);
    });
    
    // Nettoyer l'abonnement au démontage
    return unsubscribe;
  }, []);
  
  // Accéder au contexte Notion pour savoir si on utilise Notion
  const { usingNotion } = useNotion();
  
  // Utiliser le hook de gestion d'erreurs
  const { handleError, error: auditError } = useAuditError();
  
  // Déterminer si on utilise Notion en fonction du mode actif
  const shouldUseNotion = usingNotion && !demoModeActive;
  
  // Utiliser des hooks spécialisés avec le mode réel si possible
  const { project, audit, loading, notionError, setAudit, loadProject } = useAuditProject(projectId, shouldUseNotion);
  const { isSaving, saveAudit } = useAuditSave(shouldUseNotion);
  const { hasChecklistDb } = useChecklistDatabase();
  
  // Si nous avons une erreur Notion, l'envoyer au gestionnaire d'erreurs
  // et la signaler également à operationMode pour activer le mode démo si nécessaire
  useEffect(() => {
    if (notionError) {
      console.log("Handling Notion error in useAuditData:", notionError);
      
      // Convertir l'erreur Notion en format AuditError
      const auditError: AuditError = {
        message: notionError.error,
        details: notionError.context,
        source: "Chargement des données d'audit"
      };
      
      // Signaler l'erreur au hook d'audit
      handleError(auditError);
      
      // Signaler également l'erreur au système operationMode pour une éventuelle bascule en mode démo
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
      
      // Signaler l'opération réussie au système operationMode
      operationMode.handleSuccessfulOperation();
    } catch (error) {
      console.error("Error saving audit:", error);
      
      // Signaler l'erreur au hook d'audit
      handleError(error, "Sauvegarde de l'audit");
      
      // Signaler également l'erreur au système operationMode
      if (error instanceof Error) {
        operationMode.handleConnectionError(error, "Sauvegarde de l'audit");
      } else {
        operationMode.handleConnectionError(
          new Error("Erreur inconnue lors de la sauvegarde"), 
          "Sauvegarde de l'audit"
        );
      }
    }
  };
  
  console.log("useAuditData returning state:", { 
    hasProject: !!project, 
    hasAudit: !!audit, 
    loading, 
    hasError: !!auditError,
    demoModeActive
  });
  
  return {
    project,
    audit,
    loading,
    notionError: auditError || notionError,
    hasChecklistDb,
    isSaving,
    mockModeActive: demoModeActive, // Gardé pour compatibilité
    setAudit,
    loadProject,
    handleSaveAudit
  };
};
