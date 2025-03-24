
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Project, Audit } from '@/lib/types';
import { notionApi } from '@/lib/notionProxy';
import { useOperationMode } from '@/services/operationMode';

/**
 * Hook for managing audit project data
 */
export const useAuditProject = (projectId: string | undefined, useNotion = false) => {
  const [project, setProject] = useState<Project | null>(null);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notionError, setNotionError] = useState<{error: string, context: string} | null>(null);
  const { isDemoMode } = useOperationMode();

  // Load or reload the project data
  const loadProject = async () => {
    if (!projectId) {
      setLoading(false);
      setError('ID de projet manquant');
      return;
    }

    setLoading(true);
    setError(null);
    setNotionError(null);

    try {
      // Retrieve the project
      const fetchedProject = await notionApi.getProject(projectId);
      
      if (!fetchedProject) {
        setError('Projet non trouvé');
        return;
      }
      
      setProject(fetchedProject);
      
      // Load audit data if needed
      // This would be implemented here if we were loading audits
    } catch (err: any) {
      console.error('Erreur lors de la récupération du projet:', err);
      setError('Impossible de récupérer le projet');
      setNotionError({
        error: err.message || 'Erreur de connexion à Notion',
        context: 'Récupération du projet'
      });
      
      if (isDemoMode) {
        toast.error('Erreur lors de la récupération du projet', {
          description: 'Une erreur simulée s\'est produite en mode démonstration'
        });
      } else {
        toast.error('Erreur lors de la récupération du projet', {
          description: 'Vérifiez votre connexion ou la configuration Notion'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Load project data on mount
  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId, isDemoMode, useNotion]);

  return {
    project,
    audit,
    loading,
    error,
    notionError,
    setAudit,
    loadProject
  };
};

export default useAuditProject;
