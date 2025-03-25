import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getProjectById, createMockAudit, createNewAudit, getPagesByProjectId, getAllProjects } from '@/lib/mockData';
import { Audit, Project, SamplePage } from '@/lib/types';
import { notionApi } from '@/lib/notionProxy';
import { operationMode, operationModeUtils } from '@/lib/operationMode';
import { useCriticalOperation } from '@/hooks/useCriticalOperation';

/**
 * Hook pour charger les données d'un projet et de son audit associé
 * Version prototype avec données mockées v2
 */
export const useAuditProject = (projectId: string | undefined, usingNotion: boolean) => {
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [pages, setPages] = useState<SamplePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [notionError, setNotionError] = useState<{ error: string, context?: string } | null>(null);
  
  const mockModeActivated = useRef(false);
  
  useEffect(() => {
    if (!mockModeActivated.current && !notionApi.mockMode.isActive()) {
      console.log("Activation du mode démo v2 pour le prototype");
      notionApi.mockMode.activate();
      mockModeActivated.current = true;
    }
  }, []);
  
  const isLoadingProject = useRef(false);
  
  const getCleanProjectId = (id: string | undefined): string | undefined => {
    if (!id) {
      console.error("getCleanProjectId: ID vide ou undefined");
      return undefined;
    }
    
    console.log(`useAuditProject - Tentative de nettoyage de l'ID: "${id}" (type: ${typeof id})`);
    
    if (typeof id === 'string' && !id.startsWith('"')) {
      console.log(`useAuditProject - ID déjà propre: "${id}"`);
      return id;
    }
    
    try {
      if (typeof id === 'string' && id.startsWith('"') && id.endsWith('"')) {
        const cleanedId = JSON.parse(id);
        console.log(`useAuditProject - ID nettoyé de JSON: "${id}" => "${cleanedId}"`);
        return cleanedId;
      }
    } catch (e) {
      console.error(`useAuditProject - Erreur lors du nettoyage de l'ID: "${id}"`, e);
    }
    
    return id;
  };
  
  const loadProject = async () => {
    if (isLoadingProject.current) {
      console.log("Chargement de projet déjà en cours, ignoré");
      return;
    }
    
    console.log(`useAuditProject - Starting loadProject() with projectId: "${projectId}"`);
    isLoadingProject.current = true;
    setLoading(true);
    setNotionError(null);
    
    if (!projectId) {
      toast.error('Projet non trouvé - ID manquant', {
        description: "Aucun identifiant de projet fourni"
      });
      setLoading(false);
      isLoadingProject.current = false;
      
      navigate(`/error/project-not-found?id=undefined&error=${encodeURIComponent("ID projet manquant")}`);
      return;
    }
    
    const cleanedProjectId = getCleanProjectId(projectId);
    console.log(`useAuditProject - ID du projet nettoyé: "${cleanedProjectId}" (type: ${typeof cleanedProjectId})`);
    
    if (!cleanedProjectId) {
      toast.error('Projet non trouvé - ID invalide', {
        description: `L'identifiant de projet "${projectId}" n'est pas valide après nettoyage`
      });
      setLoading(false);
      isLoadingProject.current = false;
      
      navigate(`/error/project-not-found?id=${encodeURIComponent(String(projectId))}&error=${encodeURIComponent("ID projet invalide après nettoyage")}`);
      return;
    }
    
    try {
      await operationModeUtils.applySimulatedDelay();
      
      if (operationModeUtils.shouldSimulateError()) {
        throw new Error("Erreur simulée par le mock mode v2");
      }
      
      const scenario = operationModeUtils.getScenario('');
      
      if (scenario === 'empty') {
        setProject({
          id: cleanedProjectId,
          name: "Projet vide",
          url: "https://example.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          progress: 0,
          itemsCount: 0,
          pagesCount: 0
        });
        setPages([]);
        setAudit(null);
        setLoading(false);
        isLoadingProject.current = false;
        return;
      }
      
      if (scenario === 'error') {
        const projectData = getProjectById(cleanedProjectId);
        
        if (projectData) {
          setProject(projectData);
          setPages(getPagesByProjectId(cleanedProjectId));
          
          setTimeout(() => {
            const mockAudit = projectData.progress === 0 
              ? createNewAudit(cleanedProjectId) 
              : createMockAudit(cleanedProjectId);
            setAudit(mockAudit);
            
            setNotionError({
              error: "Avertissement simulé",
              context: "Il s'agit d'une erreur non-bloquante simulée pour tester la gestion des erreurs."
            });
            
            setLoading(false);
            isLoadingProject.current = false;
          }, 300);
        } else {
          throw new Error(`Projet non trouvé dans le scénario 'error' (ID: "${cleanedProjectId}")`);
        }
        return;
      }
      
      console.log(`useAuditProject - Loading mock data for project ID: "${cleanedProjectId}" (type: ${typeof cleanedProjectId})`);
      
      const allProjects = getAllProjects();
      console.log("Tous les projets disponibles:", allProjects.map(p => ({ id: p.id, name: p.name })));
      
      console.log("Types d'IDs dans les projets disponibles:", allProjects.map(p => ({ id: p.id, type: typeof p.id })));
      
      let projectData = getProjectById(cleanedProjectId);
      
      if (projectData) {
        console.log(`useAuditProject - Projet trouvé: "${projectData.name}" (ID: "${projectData.id}")`);
        setProject(projectData);
        
        const projectPages = getPagesByProjectId(cleanedProjectId);
        console.log(`useAuditProject - ${projectPages.length} pages trouvées pour le projet`);
        setPages(projectPages);
        
        setTimeout(() => {
          const mockAudit = projectData.progress === 0 
            ? createNewAudit(cleanedProjectId) 
            : createMockAudit(cleanedProjectId);
          console.log(`useAuditProject - Audit créé/chargé pour projet ID: "${cleanedProjectId}"`);
          setAudit(mockAudit);
          setLoading(false);
          isLoadingProject.current = false;
        }, 300);
      } else {
        console.log(`useAuditProject - Le projet avec l'ID "${cleanedProjectId}" n'a pas été trouvé dans les données mock`);
        
        if (cleanedProjectId.toString().startsWith('mock-project-')) {
          console.log(`useAuditProject - Création d'un nouveau projet mock à partir de l'ID généré "${cleanedProjectId}"`);
          const mockProject: Project = {
            id: cleanedProjectId.toString(),
            name: `Projet ${cleanedProjectId.toString().substring(12)}`,
            url: "https://example.com",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            progress: 0,
            itemsCount: 15,
            pagesCount: 0
          };
          
          setProject(mockProject);
          setPages([]);
          
          setTimeout(() => {
            const mockAudit = createNewAudit(cleanedProjectId.toString());
            setAudit(mockAudit);
            setLoading(false);
            isLoadingProject.current = false;
          }, 300);
          return;
        }
        
        const errorMsg = `Projet non trouvé (ID: "${cleanedProjectId}")`;
        toast.error(errorMsg, {
          description: "Le projet que vous cherchez n'existe pas ou a été supprimé"
        });
        
        navigate(`/error/project-not-found?id=${encodeURIComponent(String(cleanedProjectId))}`);
        
        setLoading(false);
        isLoadingProject.current = false;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      
      const errorMsg = error instanceof Error 
        ? error.message 
        : `Erreur inconnue (ID: "${cleanedProjectId}")`;
      
      toast.error("Erreur de chargement", {
        description: errorMsg
      });
      
      navigate(`/error/project-not-found?id=${encodeURIComponent(String(cleanedProjectId))}&error=${encodeURIComponent(errorMsg)}`);
      
      setLoading(false);
      isLoadingProject.current = false;
    }
  };
  
  const { executeCritical } = useCriticalOperation('audit-project-operations');
  
  const createAuditWithSample = useCallback(async (auditName: string) => {
    setLoading(true);
    
    await executeCritical(async () => {
      try {
        if (operationMode.isDemoMode) {
          await operationModeUtils.applySimulatedDelay();
        }
        
        if (operationMode.isDemoMode && operationModeUtils.shouldSimulateError()) {
          throw new Error("Erreur simulée lors de la création de l'audit");
        }
        
        const demoScenario = operationModeUtils.getScenario('create-audit');
        
        if (demoScenario) {
          const mockAudit = createMockAudit(projectId || '');
          setAudit(mockAudit);
          setLoading(false);
          return;
        }
        
        const mockAudit = createNewAudit(projectId || '');
        setAudit(mockAudit);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la création de l\'audit:', error);
        
        const errorMsg = error instanceof Error 
          ? error.message 
          : `Erreur inconnue (ID: "${projectId}")`;
        
        toast.error("Erreur lors de la création de l'audit", {
          description: errorMsg
        });
        
        navigate(`/error/audit-not-created?id=${encodeURIComponent(String(projectId))}&error=${encodeURIComponent(errorMsg)}`);
        
        setLoading(false);
        
        throw error;
      }
    });
  }, [projectId, navigate, executeCritical]);
  
  return {
    project,
    audit,
    pages,
    loading,
    notionError,
    setAudit,
    loadProject,
    createAuditWithSample
  };
};
