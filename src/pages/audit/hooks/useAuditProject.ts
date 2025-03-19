
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getProjectById, createMockAudit, createNewAudit } from '@/lib/mockData';
import { Audit, Project } from '@/lib/types';
import { notionApi } from '@/lib/notionProxy';

/**
 * Hook pour charger les données d'un projet et de son audit associé
 * Version prototype - utilise toujours des données mockées
 */
export const useAuditProject = (projectId: string | undefined, usingNotion: boolean) => {
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [notionError, setNotionError] = useState<{ error: string, context?: string } | null>(null);
  
  // Référence pour suivre si le mode démo a été activé
  const mockModeActivated = useRef(false);
  
  // Force le mode démo pour le prototype, mais une seule fois
  useEffect(() => {
    if (!mockModeActivated.current && !notionApi.mockMode.isActive()) {
      console.log("Activation du mode démo pour le prototype");
      notionApi.mockMode.activate();
      mockModeActivated.current = true;
    }
  }, []);
  
  // Référence pour suivre si le projet est en cours de chargement
  const isLoadingProject = useRef(false);
  
  /**
   * Charge les données du projet et de son audit depuis les données mockées
   */
  const loadProject = async () => {
    // Éviter les chargements simultanés
    if (isLoadingProject.current) {
      console.log("Chargement de projet déjà en cours, ignoré");
      return;
    }
    
    console.log("Starting loadProject() with projectId:", projectId);
    isLoadingProject.current = true;
    setLoading(true);
    setNotionError(null);
    
    if (!projectId) {
      toast.error('Projet non trouvé');
      // Ne pas rediriger pour le prototype
      setLoading(false);
      isLoadingProject.current = false;
      return;
    }
    
    try {
      // Toujours utiliser les données mockées pour le prototype
      console.log('Loading mock data for project', projectId);
      const projectData = getProjectById(projectId);
      
      if (projectData) {
        setProject(projectData);
        
        // Load mock audit with a slight delay for UX
        setTimeout(() => {
          const mockAudit = projectData.progress === 0 
            ? createNewAudit(projectId) 
            : createMockAudit(projectId);
          setAudit(mockAudit);
          setLoading(false);
          isLoadingProject.current = false;
        }, 300); // Réduit le délai pour le prototype
      } else {
        console.error("Le projet avec l'ID", projectId, "n'a pas été trouvé dans les données mock");
        
        // Pour le prototype, au lieu de rediriger, on crée un projet fictif
        const mockProject: Project = {
          id: projectId,
          name: "Projet Prototype",
          url: "https://example.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          progress: 0,
          itemsCount: 15
        };
        
        setProject(mockProject);
        
        setTimeout(() => {
          const mockAudit = createNewAudit(projectId);
          setAudit(mockAudit);
          setLoading(false);
          isLoadingProject.current = false;
        }, 300);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error("Erreur de chargement", {
        description: "Impossible de charger les données du projet"
      });
      
      // Créer un projet fictif en cas d'erreur pour le prototype
      const mockProject: Project = {
        id: projectId || 'fallback-id',
        name: "Projet de secours",
        url: "https://example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0,
        itemsCount: 15
      };
      
      setProject(mockProject);
      
      setTimeout(() => {
        const mockAudit = createNewAudit(mockProject.id);
        setAudit(mockAudit);
        setLoading(false);
        isLoadingProject.current = false;
      }, 300);
    }
  };
  
  return {
    project,
    audit,
    loading,
    notionError,
    setAudit,
    loadProject
  };
};
