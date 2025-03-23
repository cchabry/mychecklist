import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getProjectById, createMockAudit, createNewAudit, getPagesByProjectId, getAllProjects } from '@/lib/mockData';
import { Audit, Project, SamplePage } from '@/lib/types';
import { notionApi } from '@/lib/notionProxy';
import { operationMode, operationModeUtils } from '@/lib/operationMode';

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
  
  // Référence pour suivre si le mode démo a été activé
  const mockModeActivated = useRef(false);
  
  // Force le mode démo pour le prototype, mais une seule fois
  useEffect(() => {
    if (!mockModeActivated.current && !notionApi.mockMode.isActive()) {
      console.log("Activation du mode démo v2 pour le prototype");
      notionApi.mockMode.activate();
      mockModeActivated.current = true;
    }
  }, []);
  
  // Référence pour suivre si le projet est en cours de chargement
  const isLoadingProject = useRef(false);
  
  /**
   * Nettoie l'ID du projet si nécessaire (pour traiter les cas d'IDs sous forme de chaînes JSON)
   */
  const getCleanProjectId = (id: string | undefined): string | undefined => {
    if (!id) {
      console.error("getCleanProjectId: ID vide ou undefined");
      return undefined;
    }
    
    console.log(`useAuditProject - Tentative de nettoyage de l'ID: "${id}" (type: ${typeof id})`);
    
    // Si l'ID est une chaîne simple non-JSON, la retourner directement
    if (typeof id === 'string' && !id.startsWith('"')) {
      console.log(`useAuditProject - ID déjà propre: "${id}"`);
      return id;
    }
    
    // Si l'ID est une chaîne JSON, essayons de l'extraire
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
  
  /**
   * Charge les données du projet et de son audit depuis les données mockées
   */
  const loadProject = async () => {
    // Éviter les chargements simultanés
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
      
      // Naviguer vers la page d'erreur avec l'ID problématique
      navigate(`/error/project-not-found?id=undefined&error=${encodeURIComponent("ID projet manquant")}`);
      return;
    }
    
    // Nettoyer l'ID du projet si nécessaire
    const cleanedProjectId = getCleanProjectId(projectId);
    console.log(`useAuditProject - ID du projet nettoyé: "${cleanedProjectId}" (type: ${typeof cleanedProjectId})`);
    
    // Vérifier si l'ID est valide après nettoyage
    if (!cleanedProjectId) {
      toast.error('Projet non trouvé - ID invalide', {
        description: `L'identifiant de projet "${projectId}" n'est pas valide après nettoyage`
      });
      setLoading(false);
      isLoadingProject.current = false;
      
      // Naviguer vers la page d'erreur avec l'ID problématique
      navigate(`/error/project-not-found?id=${encodeURIComponent(String(projectId))}&error=${encodeURIComponent("ID projet invalide après nettoyage")}`);
      return;
    }
    
    try {
      // Simuler le délai configuré dans le mock mode
      await notionApi.mockMode.applySimulatedDelay();
      
      // Simuler une erreur aléatoire si le taux d'erreur est configuré
      if (notionApi.mockMode.shouldSimulateError()) {
        throw new Error("Erreur simulée par le mock mode v2");
      }
      
      // Adapter la réponse selon le scénario configuré
      const scenario = notionApi.mockMode.getScenario();
      
      if (scenario === 'empty') {
        // Scénario "vide" - projet minimal sans données
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
        // Scénario "erreur" - tout fonctionne mais avec un avertissement
        const projectData = getProjectById(cleanedProjectId);
        
        if (projectData) {
          setProject(projectData);
          setPages(getPagesByProjectId(cleanedProjectId));
          
          setTimeout(() => {
            const mockAudit = projectData.progress === 0 
              ? createNewAudit(cleanedProjectId) 
              : createMockAudit(cleanedProjectId);
            setAudit(mockAudit);
            
            // Ajouter une erreur non-bloquante
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
      
      // Scénarios "standard" ou "large" - chargement normal
      console.log(`useAuditProject - Loading mock data for project ID: "${cleanedProjectId}" (type: ${typeof cleanedProjectId})`);
      
      // Afficher tous les projets disponibles pour déboguer
      const allProjects = getAllProjects();
      console.log("Tous les projets disponibles:", allProjects.map(p => ({ id: p.id, name: p.name })));
      
      // Afficher les types d'IDs pour déboguer
      console.log("Types d'IDs dans les projets disponibles:", allProjects.map(p => ({ id: p.id, type: typeof p.id })));
      
      let projectData = getProjectById(cleanedProjectId);
      
      if (projectData) {
        console.log(`useAuditProject - Projet trouvé: "${projectData.name}" (ID: "${projectData.id}")`);
        setProject(projectData);
        
        // Charger les pages du projet
        const projectPages = getPagesByProjectId(cleanedProjectId);
        console.log(`useAuditProject - ${projectPages.length} pages trouvées pour le projet`);
        setPages(projectPages);
        
        // Load mock audit with a slight delay for UX
        setTimeout(() => {
          const mockAudit = projectData.progress === 0 
            ? createNewAudit(cleanedProjectId) 
            : createMockAudit(cleanedProjectId);
          console.log(`useAuditProject - Audit créé/chargé pour projet ID: "${cleanedProjectId}"`);
          setAudit(mockAudit);
          setLoading(false);
          isLoadingProject.current = false;
        }, 300); // Réduit le délai pour le prototype
      } else {
        console.log(`useAuditProject - Le projet avec l'ID "${cleanedProjectId}" n'a pas été trouvé dans les données mock`);
        
        // Vérifier si l'ID commence par 'mock-project-' (généré par NewProject.tsx)
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
        
        // Projet vraiment introuvable, afficher message détaillé et redirection
        const errorMsg = `Projet non trouvé (ID: "${cleanedProjectId}")`;
        toast.error(errorMsg, {
          description: "Le projet que vous cherchez n'existe pas ou a été supprimé"
        });
        
        // Naviguer vers la page d'erreur spécifique avec l'ID problématique
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
      
      // Naviguer vers la page d'erreur avec l'ID problématique
      navigate(`/error/project-not-found?id=${encodeURIComponent(String(cleanedProjectId))}&error=${encodeURIComponent(errorMsg)}`);
      
      setLoading(false);
      isLoadingProject.current = false;
    }
  };
  
  // Fonction pour créer un audit avec un échantillon de base
  const createAuditWithSample = useCallback(async (auditName: string) => {
    setIsLoading(true);
    
    try {
      // Délai simulé en mode démo
      if (operationMode.isDemoMode) {
        await operationModeUtils.applySimulatedDelay();
      }
      
      // Parfois simuler une erreur en mode démo
      if (operationMode.isDemoMode && operationModeUtils.shouldSimulateError()) {
        throw new Error("Erreur simulée lors de la création de l'audit");
      }
      
      // Récupérer un scénario de démo si disponible
      const demoScenario = operationModeUtils.getScenario('create-audit');
      
      if (demoScenario) {
        const mockAudit = createMockAudit(demoScenario.projectId);
        setAudit(mockAudit);
        setLoading(false);
        return;
      }
      
      // Créer un nouvel audit avec un échantillon de base
      const mockAudit = createNewAudit(projectId);
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
      
      // Naviguer vers la page d'erreur avec l'ID problématique
      navigate(`/error/audit-not-created?id=${encodeURIComponent(String(projectId))}&error=${encodeURIComponent(errorMsg)}`);
      
      setLoading(false);
    }
  }, [projectId, navigation]);
  
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
