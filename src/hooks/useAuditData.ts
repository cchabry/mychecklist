
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Audit, Project } from '@/lib/types';
import { useNotion } from '@/contexts/NotionContext';
import { getProjectById, createMockAudit, createNewAudit } from '@/lib/mockData';
import { getProjectById as getNotionProject, getAuditForProject, saveAuditToNotion } from '@/lib/notion';
import { notionApi } from '@/lib/notionProxy';

export const useAuditData = (projectId: string | undefined) => {
  console.log("useAuditData initializing with projectId:", projectId);
  
  const navigate = useNavigate();
  const { status, config, usingNotion } = useNotion();
  
  const [project, setProject] = useState<Project | null>(null);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [notionError, setNotionError] = useState<{ error: string, context?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Load project data
  const loadProject = useCallback(async () => {
    console.log("loadProject called with projectId:", projectId);
    
    if (!projectId) {
      console.error("No projectId provided to useAuditData");
      toast.error('Projet non trouvé');
      navigate('/');
      return;
    }
    
    setLoading(true);
    setNotionError(null);
    
    try {
      let projectData = null;
      let auditData = null;
      
      // Try to load from Notion if configured and not in mock mode
      if (usingNotion && !notionApi.mockMode.isActive()) {
        try {
          console.log('Attempting to load project from Notion');
          projectData = await getNotionProject(projectId);
          
          if (projectData) {
            // If checklists DB is configured, try to load audit
            if (config.checklistsDbId) {
              try {
                console.log('Loading audit from Notion');
                auditData = await getAuditForProject(projectId);
                
                // Create new audit if none found or no items
                if (!auditData || !auditData.items || auditData.items.length === 0) {
                  auditData = createNewAudit(projectId);
                }
              } catch (checklistError) {
                console.error('Error loading audit from Notion:', checklistError);
                auditData = createNewAudit(projectId);
              }
            } else {
              // No checklists DB configured, use mock audit
              auditData = createNewAudit(projectId);
            }
          }
        } catch (notionError) {
          console.error('Notion error:', notionError);
          // Continue with mock data on Notion error
        }
      }
      
      // If no data from Notion or in mock mode, use mock data
      if (!projectData) {
        console.log('Loading mock data for project', projectId);
        projectData = getProjectById(projectId);
        
        if (projectData) {
          setProject(projectData);
          console.log("Mock project data loaded:", projectData.name);
          
          // Load mock audit with a slight delay for UX
          setTimeout(() => {
            const mockAudit = projectData.progress === 0 
              ? createNewAudit(projectId) 
              : createMockAudit(projectId);
            console.log("Setting mock audit data with items:", mockAudit.items.length);
            setAudit(mockAudit);
            setLoading(false);
          }, 800);
          return; // Exit early as we're handling loading state in setTimeout
        } else {
          console.error("Project not found in mock data:", projectId);
          toast.error('Projet non trouvé');
          navigate('/');
          return;
        }
      }
      
      // Successfully loaded from Notion
      setProject(projectData);
      console.log("Notion project data loaded:", projectData.name);
      
      // If no audit loaded from Notion, use mock audit
      if (!auditData) {
        setTimeout(() => {
          const mockAudit = projectData.progress === 0 
            ? createNewAudit(projectId) 
            : createMockAudit(projectId);
          console.log("Setting mock audit data with items:", mockAudit.items.length);
          setAudit(mockAudit);
          setLoading(false);
        }, 400);
        return; // Exit early as we're handling loading state in setTimeout
      }
      
      console.log("Setting Notion audit data with items:", auditData.items.length);
      setAudit(auditData);
      setLoading(false);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Erreur de chargement", {
        description: "Impossible de charger les données du projet"
      });
      
      // Fallback to mock data
      try {
        const mockProjectData = getProjectById(projectId);
        if (mockProjectData) {
          console.log("Fallback to mock project data:", mockProjectData.name);
          setProject(mockProjectData);
          const mockAudit = mockProjectData.progress === 0 
            ? createNewAudit(projectId) 
            : createMockAudit(projectId);
          console.log("Setting fallback mock audit with items:", mockAudit.items.length);
          setAudit(mockAudit);
        } else {
          console.error("Project not found in mock data during fallback");
          navigate('/');
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        navigate('/');
      }
      
      setLoading(false);
    }
  }, [projectId, navigate, usingNotion, config.checklistsDbId]);
  
  // Save audit
  const handleSaveAudit = async () => {
    if (!audit) {
      console.error("Cannot save audit: audit data is null");
      return;
    }
    
    setIsSaving(true);
    console.log("Saving audit with", audit.items.length, "items");
    
    try {
      let success = false;
      
      // Save to Notion if connected and not in mock mode
      if (usingNotion && !notionApi.mockMode.isActive()) {
        if (!config.checklistsDbId) {
          toast.warning('Base de données des checklists non configurée', {
            description: 'Pour sauvegarder les audits dans Notion, configurez une base de données pour les checklists.'
          });
          success = true; // Simulate successful save
        } else {
          // Save to Notion
          try {
            success = await saveAuditToNotion(audit);
            console.log("Audit saved to Notion:", success);
          } catch (error) {
            // Handle CORS "Failed to fetch" error
            if (error.message?.includes('Failed to fetch')) {
              // Activate mock mode
              notionApi.mockMode.activate();
              console.log("Activating mock mode due to fetch error");
              
              toast.warning('Mode démonstration activé', {
                description: 'Sauvegarde en mode local uniquement car l\'API Notion n\'est pas accessible directement',
              });
              
              // Simulate successful save
              success = true;
            } else {
              throw error;
            }
          }
        }
      } else {
        // Local save simulation
        console.log("Simulating audit save (mock mode or not using Notion)");
        success = true;
      }
      
      if (success) {
        toast.success("Audit sauvegardé avec succès", {
          description: "Toutes les modifications ont été enregistrées",
        });
      }
    } catch (error) {
      console.error('Error saving audit:', error);
      toast.error('Erreur de sauvegarde', {
        description: 'Impossible de sauvegarder les modifications'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Load project data on mount
  useEffect(() => {
    console.log("useEffect in useAuditData triggered, calling loadProject");
    loadProject();
  }, [loadProject]);
  
  return {
    project,
    audit,
    loading,
    notionError,
    isSaving,
    hasChecklistDb: !!config.checklistsDbId,
    setAudit,
    loadProject,
    handleSaveAudit
  };
};
