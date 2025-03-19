
import { useState, useEffect, useCallback } from 'react';
import { Audit, Project } from '@/lib/types';
import { useAuditProjectData } from './useAuditProjectData';
import { useAuditSaving } from './useAuditSaving';
import { useNotion } from '@/contexts/NotionContext';

interface AuditDataState {
  project: Project | null;
  audit: Audit | null;
  loading: boolean;
  notionError: { error: string, context?: string } | null;
  hasChecklistDb: boolean;
}

/**
 * Hook central pour gérer l'état des données d'audit
 */
export const useAuditState = (projectId: string | undefined) => {
  const { status, config, usingNotion } = useNotion();
  const { loadProject } = useAuditProjectData();
  const { saveAudit } = useAuditSaving();
  
  // État
  const [state, setState] = useState<AuditDataState>({
    project: null,
    audit: null,
    loading: true,
    notionError: null,
    hasChecklistDb: !!config.checklistsDbId
  });
  
  // Mettre à jour l'audit
  const setAudit = useCallback((newAudit: Audit) => {
    setState(prev => ({ ...prev, audit: newAudit }));
  }, []);
  
  // Charger les données du projet
  const handleLoadProject = useCallback(async () => {
    if (!projectId) return;
    
    await loadProject(
      projectId,
      usingNotion,
      status.isMockMode,
      config.checklistsDbId,
      {
        onProjectLoaded: (project) => {
          setState(prev => ({
            ...prev,
            project,
            hasChecklistDb: !!config.checklistsDbId
          }));
        },
        onAuditLoaded: (audit) => {
          setState(prev => ({ ...prev, audit }));
        },
        onLoadingChange: (loading) => {
          setState(prev => ({ ...prev, loading }));
        },
        onNotionError: (notionError) => {
          setState(prev => ({ ...prev, notionError }));
        }
      }
    );
  }, [projectId, usingNotion, status.isMockMode, config.checklistsDbId, loadProject]);
  
  // Sauvegarder l'audit
  const handleSaveAudit = useCallback(async () => {
    if (!state.audit) return;
    
    await saveAudit(state.audit, {
      usingNotion,
      isMockMode: status.isMockMode,
      checklistsDbId: config.checklistsDbId
    });
  }, [state.audit, usingNotion, status.isMockMode, config.checklistsDbId, saveAudit]);
  
  // Charger les données au montage du composant
  useEffect(() => {
    handleLoadProject();
  }, [handleLoadProject]);
  
  return {
    ...state,
    setAudit,
    loadProject: handleLoadProject,
    handleSaveAudit
  };
};
