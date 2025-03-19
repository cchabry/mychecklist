
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getProjectById, createMockAudit, createNewAudit } from '@/lib/mockData';
import { Audit, Project } from '@/lib/types';
import { getProjectById as getNotionProject, getAuditForProject, saveAuditToNotion } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';
import { useNotion } from '@/contexts/NotionContext';
import { handleNotionError } from '@/lib/notionProxy/errorHandling';

interface AuditDataState {
  project: Project | null;
  audit: Audit | null;
  loading: boolean;
  notionError: { error: string, context?: string } | null;
  hasChecklistDb: boolean;
}

export const useAuditData = (projectId: string | undefined) => {
  const navigate = useNavigate();
  const { status, config, usingNotion } = useNotion();
  
  // État
  const [state, setState] = useState<AuditDataState>({
    project: null,
    audit: null,
    loading: true,
    notionError: null,
    hasChecklistDb: !!config.checklistsDbId
  });
  
  // Charger les données du projet
  const loadProject = useCallback(async () => {
    if (!projectId) {
      toast.error('Projet non trouvé');
      navigate('/');
      return;
    }
    
    setState(prev => ({ ...prev, loading: true, notionError: null }));
    
    try {
      let projectData = null;
      let auditData = null;
      
      // Utiliser les données de Notion si connecté et pas en mode mock
      if (usingNotion && !status.isMockMode) {
        try {
          // Charger le projet depuis Notion
          projectData = await getNotionProject(projectId);
          
          // Si le projet est trouvé et qu'on a une base de données de checklists
          if (projectData && config.checklistsDbId) {
            try {
              // Charger l'audit
              auditData = await getAuditForProject(projectId);
              
              // Créer un nouvel audit si aucun n'est trouvé ou s'il n'a pas d'éléments
              if (!auditData || !auditData.items || auditData.items.length === 0) {
                auditData = createNewAudit(projectId);
              }
            } catch (checklistError) {
              toast.error('Erreur de chargement des checklists', {
                description: 'Utilisation des données par défaut.'
              });
              
              // Utiliser un nouvel audit par défaut
              auditData = createNewAudit(projectId);
            }
          } else {
            // Pas de base de données de checklists, utiliser les données par défaut
            auditData = createNewAudit(projectId);
          }
        } catch (notionError) {
          // Gérer l'erreur et passer aux données de mock
          handleNotionError(
            notionError instanceof Error ? notionError : new Error(String(notionError)),
            'Erreur lors du chargement du projet'
          );
        }
      }
      
      // Si on n'a pas pu charger depuis Notion, utiliser les données de mock
      if (!projectData) {
        projectData = getProjectById(projectId);
        
        if (!projectData) {
          toast.error('Projet non trouvé');
          navigate('/');
          return;
        }
        
        // Charger les données d'audit mock avec un léger délai pour l'UX
        setTimeout(() => {
          const mockAudit = projectData.progress === 0 
            ? createNewAudit(projectId) 
            : createMockAudit(projectId);
          
          setState(prev => ({ 
            ...prev, 
            audit: mockAudit,
            loading: false
          }));
        }, 500);
        
        // Mettre à jour tout de suite le projet
        setState(prev => ({ 
          ...prev, 
          project: projectData,
          hasChecklistDb: !!config.checklistsDbId
        }));
        
        return; // Sortir tôt car le loading sera mis à false dans setTimeout
      }
      
      // Si on a des données de Notion
      setState(prev => ({ 
        ...prev, 
        project: projectData,
        audit: auditData,
        loading: false,
        hasChecklistDb: !!config.checklistsDbId
      }));
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error("Erreur de chargement", {
        description: "Impossible de charger les données du projet"
      });
      
      // Fallback to mock data
      try {
        const mockProjectData = getProjectById(projectId);
        
        if (mockProjectData) {
          const mockAudit = mockProjectData.progress === 0 
            ? createNewAudit(projectId) 
            : createMockAudit(projectId);
          
          setState(prev => ({ 
            ...prev, 
            project: mockProjectData,
            audit: mockAudit,
            loading: false
          }));
        } else {
          navigate('/');
        }
      } catch (fallbackError) {
        navigate('/');
      }
    }
  }, [projectId, usingNotion, status.isMockMode, config.checklistsDbId, navigate]);
  
  // Charger les données au montage du composant
  useEffect(() => {
    loadProject();
  }, [loadProject]);
  
  // Sauvegarder l'audit
  const handleSaveAudit = async () => {
    if (!state.audit) return;
    
    try {
      let success = false;
      
      // Sauvegarder dans Notion si on est connecté et pas en mode mock
      if (usingNotion && !status.isMockMode) {
        if (!config.checklistsDbId) {
          toast.warning('Base de données des checklists non configurée', {
            description: 'Pour sauvegarder les audits dans Notion, configurez une base de données pour les checklists.'
          });
          success = true; // Simuler une sauvegarde réussie
        } else {
          // Sauvegarder dans Notion
          try {
            success = await saveAuditToNotion(state.audit);
          } catch (error) {
            throw error;
          }
        }
      } else {
        // Simulation locale de sauvegarde
        success = true;
      }
      
      if (success) {
        toast.success("Audit sauvegardé avec succès", {
          description: "Toutes les modifications ont été enregistrées",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur de sauvegarde', {
        description: 'Impossible de sauvegarder les modifications'
      });
    }
  };
  
  // Mettre à jour l'audit
  const setAudit = (newAudit: Audit) => {
    setState(prev => ({ ...prev, audit: newAudit }));
  };
  
  return {
    project: state.project,
    audit: state.audit,
    loading: state.loading,
    notionError: state.notionError,
    hasChecklistDb: state.hasChecklistDb,
    setAudit,
    loadProject,
    handleSaveAudit
  };
};
