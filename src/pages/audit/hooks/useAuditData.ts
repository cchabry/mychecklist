
import { useState, useEffect } from 'react';
import { Audit } from '@/lib/types';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import useAuditProject from './useAuditProject';
import { getAuditForProject } from '@/lib/notion';
import { useOperationMode } from '@/services/operationMode';

/**
 * Hook pour charger et gérer les données d'audit
 */
export const useAuditData = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [notionError, setNotionError] = useState<string | null>(null);
  const { project, loading: projectLoading, error: projectError } = useAuditProject(projectId);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDemoMode } = useOperationMode();

  // Charger le projet et l'audit
  const loadProject = async () => {
    if (!projectId) return;
    
    setLoading(true);
    
    try {
      // Charger l'audit pour ce projet
      const auditData = await getAuditForProject(projectId);
      setAudit(auditData);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'audit:', error);
      setNotionError(error instanceof Error ? error.message : 'Erreur lors du chargement de l\'audit');
      
      // Afficher une notification d'erreur
      toast.error('Erreur de chargement', {
        description: 'Impossible de charger les données d\'audit.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    if (project) {
      loadProject();
    }
  }, [project, projectId]);

  return {
    project,
    audit,
    loading: loading || projectLoading,
    error: projectError || notionError,
    notionError,
    setAudit,
    loadProject,
    navigate,
    isDemoMode
  };
};

export default useAuditData;
