
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getProjectById, createMockAudit, createNewAudit } from '@/lib/mockData';
import { Audit, Project } from '@/lib/types';
import { getProjectById as getNotionProject, getAuditForProject } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';
import { handleNotionError } from '@/lib/notionProxy/errorHandling';

/**
 * Hook spécialisé pour charger les données d'un projet et son audit associé
 */
export const useAuditProjectData = () => {
  const navigate = useNavigate();
  
  // Charger les données du projet
  const loadProject = useCallback(async (
    projectId: string, 
    usingNotion: boolean, 
    isMockMode: boolean,
    checklistsDbId: string | null,
    callbacks: {
      onProjectLoaded: (project: Project) => void,
      onAuditLoaded: (audit: Audit) => void,
      onLoadingChange: (loading: boolean) => void,
      onNotionError: (error: { error: string, context?: string } | null) => void
    }
  ) => {
    if (!projectId) {
      toast.error('Projet non trouvé');
      navigate('/');
      return;
    }
    
    callbacks.onLoadingChange(true);
    callbacks.onNotionError(null);
    
    try {
      let projectData = null;
      let auditData = null;
      
      // Utiliser les données de Notion si connecté et pas en mode mock
      if (usingNotion && !isMockMode) {
        try {
          // Charger le projet depuis Notion
          projectData = await getNotionProject(projectId);
          
          // Si le projet est trouvé et qu'on a une base de données de checklists
          if (projectData && checklistsDbId) {
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
          
          callbacks.onAuditLoaded(mockAudit);
          callbacks.onLoadingChange(false);
        }, 500);
        
        // Mettre à jour tout de suite le projet
        callbacks.onProjectLoaded(projectData);
        
        return; // Sortir tôt car le loading sera mis à false dans setTimeout
      }
      
      // Si on a des données de Notion
      callbacks.onProjectLoaded(projectData);
      callbacks.onAuditLoaded(auditData);
      callbacks.onLoadingChange(false);
      
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
          
          callbacks.onProjectLoaded(mockProjectData);
          callbacks.onAuditLoaded(mockAudit);
          callbacks.onLoadingChange(false);
        } else {
          navigate('/');
        }
      } catch (fallbackError) {
        navigate('/');
      }
    }
  }, [navigate]);
  
  return { loadProject };
};
