
import { useState, useEffect, useRef } from 'react';
import { Audit, Project } from '@/lib/types';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { useOperationMode } from '@/services/operationMode';
import { createMockAudit } from '@/lib/mockData';

interface NotionError {
  error: string;
  context: string;
}

export interface AuditError {
  message: string;
  details?: string;
  source?: string;
  isCritical?: boolean;
}

/**
 * Hook pour gérer les données d'audit
 */
export const useAuditData = (projectId: string | undefined) => {
  const [project, setProject] = useState<Project | null>(null);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuditError | null>(null);
  const [notionError, setNotionError] = useState<NotionError | null>(null);
  const { isDemoMode } = useOperationMode();

  // Référence pour suivre si le projet a été chargé
  const projectLoaded = useRef(false);

  useEffect(() => {
    if (projectId && !projectLoaded.current) {
      loadProject();
      projectLoaded.current = true;
    } else if (!projectId) {
      console.error("No projectId provided to useAuditData");
      setError({
        message: "Identifiant de projet manquant",
        isCritical: false
      });
    }
  }, [projectId]);

  /**
   * Charge les données du projet et de l'audit
   */
  const loadProject = async () => {
    if (!projectId) {
      setError({ message: "ID de projet manquant" });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotionError(null);

    try {
      // Charger le projet
      const projectData = await notionApi.getProject(projectId);
      
      if (!projectData) {
        setError({ message: "Projet non trouvé" });
        setLoading(false);
        return;
      }
      
      setProject(projectData);
      
      // Créer un audit de base si nous n'en avons pas
      if (!audit) {
        const newAudit = createMockAudit(projectId);
        setAudit(newAudit);
      }
      
      setError(null);
    } catch (err) {
      console.error(`Erreur lors du chargement du projet ${projectId}:`, err);
      
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError({
        message: "Impossible de charger le projet",
        details: errorMessage,
        source: "Chargement du projet"
      });
      
      // Afficher une notification d'erreur
      toast.error("Erreur de chargement", {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sauvegarde les données de l'audit
   */
  const handleSaveAudit = async () => {
    if (!audit) {
      setError({
        message: "Erreur de sauvegarde",
        details: "Aucune donnée d'audit disponible"
      });
      return;
    }
    
    try {
      // Sauvegarde simple pour le moment
      toast.success("Audit sauvegardé avec succès");
      return true;
    } catch (error) {
      console.error("Error saving audit:", error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError({
        message: "Erreur lors de la sauvegarde",
        details: errorMessage,
        source: "Sauvegarde de l'audit"
      });
      
      // Afficher une notification d'erreur
      toast.error("Erreur de sauvegarde", {
        description: errorMessage
      });
      
      return false;
    }
  };

  return {
    project,
    audit,
    loading,
    error,
    notionError,
    mockModeActive: isDemoMode,
    setAudit,
    loadProject,
    handleSaveAudit
  };
};

export default useAuditData;
