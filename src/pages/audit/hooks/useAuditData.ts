
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getProjectById, createMockAudit, createNewAudit } from '@/lib/mockData';
import { Audit, Project } from '@/lib/types';
import {
  getProjectById as getNotionProject,
  getAuditForProject, 
  saveAuditToNotion
} from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';

export const useAuditData = (projectId: string | undefined, usingNotion: boolean) => {
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [notionError, setNotionError] = useState<{ error: string, context?: string } | null>(null);
  const [hasChecklistDb, setHasChecklistDb] = useState(!!localStorage.getItem('notion_checklists_database_id'));
  
  const loadProject = async () => {
    setLoading(true);
    setNotionError(null);
    
    if (!projectId) {
      toast.error('Projet non trouvé');
      navigate('/');
      return;
    }
    
    try {
      let projectData = null;
      let auditData = null;
      
      // Vérifier si la base de données des checklists est configurée
      const checklistsDbId = localStorage.getItem('notion_checklists_database_id');
      setHasChecklistDb(!!checklistsDbId);
      
      console.log('Loading project', projectId, 'usingNotion:', usingNotion, 'mockMode:', notionApi.mockMode.isActive(), 'checklistDb:', !!checklistsDbId);
      
      // Try to load from Notion if configured and not in mock mode
      if (usingNotion && !notionApi.mockMode.isActive()) {
        try {
          console.log('Attempting to load project from Notion');
          
          // Use notionProxy API instead of direct client calls
          const apiKey = localStorage.getItem('notion_api_key');
          const dbId = localStorage.getItem('notion_database_id');
          
          if (apiKey && dbId) {
            // Attempt to fetch project data using the proxy
            try {
              // First test the connection
              await notionApi.users.me(apiKey);
              console.log('Notion connection verified via proxy');
              
              // Then try to get project data
              projectData = await getNotionProject(projectId);
              console.log('Project data from Notion:', projectData);
              
              if (projectData) {
                // Si la base de données des checklists est configurée, essayer de charger l'audit
                if (checklistsDbId) {
                  try {
                    console.log('Tentative de chargement de l\'audit depuis Notion avec la base de checklists:', checklistsDbId);
                    auditData = await getAuditForProject(projectId);
                    console.log('Audit data from Notion:', auditData);
                    
                    // Vérifier si l'audit a des éléments
                    if (!auditData || !auditData.items || auditData.items.length === 0) {
                      console.log('Audit sans éléments, création d\'un nouveau audit');
                      auditData = createNewAudit(projectId);
                    }
                  } catch (checklistError) {
                    console.error('Erreur lors du chargement de l\'audit depuis Notion:', checklistError);
                    toast.error('Erreur de chargement des checklists', {
                      description: 'Impossible de charger les données d\'audit. Utilisation des données par défaut.'
                    });
                    
                    // Créer un nouvel audit en cas d'erreur
                    auditData = createNewAudit(projectId);
                  }
                } else {
                  console.log('Base de données des checklists non configurée, utilisation des données mock pour l\'audit');
                  auditData = createNewAudit(projectId);
                }
              }
            } catch (proxyError) {
              console.error('Notion proxy error:', proxyError);
              
              // Gérer l'erreur CORS "Failed to fetch"
              if (proxyError.message?.includes('Failed to fetch')) {
                setNotionError({
                  error: 'Échec de la connexion à Notion: Failed to fetch',
                  context: 'Les restrictions de sécurité du navigateur empêchent l\'accès direct à l\'API Notion'
                });
                
                // Activer le mode mock
                notionApi.mockMode.activate();
                
                toast.warning('Mode démonstration activé', {
                  description: 'Utilisation de données de test car l\'API Notion n\'est pas accessible directement',
                });
              } else {
                toast.error('Erreur d\'accès à Notion', {
                  description: 'Impossible de charger les données depuis Notion. Vérifiez votre connexion.',
                });
              }
            }
          }
        } catch (notionError) {
          console.error('Erreur Notion:', notionError);
          // Continue with mock data on Notion error
        }
      }
      
      // If no data from Notion or in mock mode, use mock data
      if (!projectData) {
        console.log('Loading mock data for project', projectId);
        projectData = getProjectById(projectId);
        
        if (projectData) {
          setProject(projectData);
          
          // Load mock audit with a slight delay for UX
          setTimeout(() => {
            const mockAudit = projectData.progress === 0 
              ? createNewAudit(projectId) 
              : createMockAudit(projectId);
            setAudit(mockAudit);
            setLoading(false);
          }, 800);
          return; // Exit early as we're handling loading state in setTimeout
        }
      } else {
        // Successfully loaded from Notion
        setProject(projectData);
        
        // Si pas d'audit chargé depuis Notion (pas de base de données de checklists configurée)
        // ou si l'audit est null, utiliser les données mock pour l'audit
        if (!auditData) {
          console.log('Utilisation des données mock pour l\'audit');
          setTimeout(() => {
            const mockAudit = projectData.progress === 0 
              ? createNewAudit(projectId) 
              : createMockAudit(projectId);
            setAudit(mockAudit);
            setLoading(false);
          }, 400);
          return; // Exit early as we're handling loading state in setTimeout
        }
        
        setAudit(auditData);
        console.log('Successfully loaded data from Notion:', { project: projectData, audit: auditData });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error("Erreur de chargement", {
        description: "Impossible de charger les données du projet"
      });
      
      // Fallback to mock data
      try {
        const mockProjectData = getProjectById(projectId);
        setProject(mockProjectData);
        
        if (mockProjectData) {
          const mockAudit = mockProjectData.progress === 0 
            ? createNewAudit(projectId) 
            : createMockAudit(projectId);
          setAudit(mockAudit);
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
      
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadProject();
  }, [projectId, usingNotion, navigate]);
  
  const handleSaveAudit = async () => {
    if (!audit) return;
    
    try {
      let success = false;
      
      if (usingNotion && !notionApi.mockMode.isActive()) {
        // Vérifier si la base de données des checklists est configurée
        const checklistsDbId = localStorage.getItem('notion_checklists_database_id');
        
        if (!checklistsDbId) {
          console.log('Base de données des checklists non configurée, sauvegarde en mode mock uniquement');
          toast.warning('Base de données des checklists non configurée', {
            description: 'Pour sauvegarder les audits dans Notion, configurez une base de données pour les checklists.'
          });
          success = true; // Simuler une sauvegarde réussie
        } else {
          // Sauvegarder dans Notion
          try {
            console.log('Attempting to save audit to Notion:', audit);
            success = await saveAuditToNotion(audit);
            console.log('Save to Notion result:', success);
          } catch (error) {
            console.error('Erreur lors de la sauvegarde dans Notion:', error);
            
            // Gérer l'erreur CORS "Failed to fetch"
            if (error.message?.includes('Failed to fetch')) {
              setNotionError({
                error: 'Échec de la connexion à Notion: Failed to fetch',
                context: 'Les restrictions de sécurité du navigateur empêchent l\'accès direct à l\'API Notion'
              });
              
              // Activer le mode mock
              notionApi.mockMode.activate();
              
              toast.warning('Mode démonstration activé', {
                description: 'Sauvegarde en mode local uniquement car l\'API Notion n\'est pas accessible directement',
              });
              
              // Simuler une sauvegarde réussie
              success = true;
            } else {
              throw error;
            }
          }
        }
      } else {
        console.log('Using mock save mode');
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
  
  return {
    project,
    audit,
    loading,
    notionError,
    hasChecklistDb,
    setAudit,
    loadProject,
    handleSaveAudit
  };
};
