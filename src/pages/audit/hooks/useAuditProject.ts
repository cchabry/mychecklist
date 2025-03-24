
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Project } from '@/lib/types';
import { notionApi } from '@/lib/notionProxy';
import { useOperationMode } from '@/services/operationMode';

/**
 * Hook pour gérer les données d'un projet d'audit
 */
export const useAuditProject = (projectId: string | undefined) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDemoMode } = useOperationMode();

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      setError('ID de projet manquant');
      return;
    }

    const fetchProject = async () => {
      setLoading(true);
      setError(null);

      try {
        // Récupérer le projet - utiliser la méthode adéquate selon le module
        const fetchedProject = await notionApi.getProject(projectId);
        
        if (!fetchedProject) {
          setError('Projet non trouvé');
          return;
        }
        
        setProject(fetchedProject);
      } catch (err) {
        console.error('Erreur lors de la récupération du projet:', err);
        setError('Impossible de récupérer le projet');
        
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

    fetchProject();
  }, [projectId, isDemoMode]);

  return {
    project,
    loading,
    error
  };
};

export default useAuditProject;
