
import { useState, useEffect, useCallback } from 'react';
import { notionApi } from '@/lib/notionProxy';
import { Audit, Project, SamplePage, ChecklistItem } from '@/lib/types';
import { cleanProjectId } from '@/lib/utils';
import { operationModeUtils } from '@/services/operationMode/utils';

interface UseAuditProjectProps {
  projectId?: string;
  auditId?: string;
}

export interface UseAuditProjectCallbacks {
  onProjectLoaded?: (project: Project) => void;
  onAuditLoaded?: (audit: Audit) => void;
  onPagesLoaded?: (pages: SamplePage[]) => void;
  onChecklistLoaded?: (checklist: ChecklistItem[]) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook pour gérer le chargement des données d'un projet d'audit
 */
export const useAuditProject = ({ projectId, auditId }: UseAuditProjectProps) => {
  const [project, setProject] = useState<Project | null>(null);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [pages, setPages] = useState<SamplePage[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fonction pour charger le projet
  const loadProject = useCallback(async (callbacks?: UseAuditProjectCallbacks) => {
    if (!projectId) {
      setError(new Error('ID de projet manquant'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Nettoyer l'ID du projet
      const cleanedProjectId = cleanProjectId(projectId);
      console.log(`🔄 Chargement du projet: ${cleanedProjectId}`);

      // Charger le projet
      const projectData = await notionApi.getProject(cleanedProjectId);
      
      if (!projectData) {
        throw new Error(`Projet non trouvé: ${cleanedProjectId}`);
      }
      
      setProject(projectData);
      if (callbacks?.onProjectLoaded) {
        callbacks.onProjectLoaded(projectData);
      }
      
      console.log(`✅ Projet chargé: ${projectData.name}`);
      
      // Charger les pages de l'échantillon
      try {
        const pagesData = await notionApi.getSamplePages();
        setPages(pagesData);
        
        if (callbacks?.onPagesLoaded) {
          callbacks.onPagesLoaded(pagesData);
        }
        
        console.log(`✅ Pages chargées: ${pagesData.length}`);
      } catch (pagesError) {
        console.error('Erreur lors du chargement des pages:', pagesError);
        // Ne pas propager cette erreur, car ce n'est pas bloquant
      }
      
      // Charger la checklist
      try {
        const checklistData = await notionApi.getChecklistItems();
        setChecklist(checklistData);
        
        if (callbacks?.onChecklistLoaded) {
          callbacks.onChecklistLoaded(checklistData);
        }
        
        console.log(`✅ Checklist chargée: ${checklistData.length} items`);
      } catch (checklistError) {
        console.error('Erreur lors du chargement de la checklist:', checklistError);
        // Ne pas propager cette erreur, car ce n'est pas bloquant
      }
      
      // Si un auditId est fourni, charger l'audit
      if (auditId) {
        try {
          console.log(`🔄 Chargement de l'audit: ${auditId}`);
          const auditData = await notionApi.getAudit(auditId);
          
          if (!auditData) {
            console.error(`Audit non trouvé: ${auditId}`);
          } else {
            setAudit(auditData);
            
            if (callbacks?.onAuditLoaded) {
              callbacks.onAuditLoaded(auditData);
            }
            
            console.log(`✅ Audit chargé: ${auditData.name}`);
          }
        } catch (auditErr) {
          console.error(`Erreur lors du chargement de l'audit ${auditId}:`, auditErr);
          // Ne pas propager cette erreur, car ce n'est pas bloquant
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement du projet:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      if (callbacks?.onError) {
        callbacks.onError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      setIsLoading(false);
    }
  }, [projectId, auditId]);

  // Fonction pour créer un nouvel audit
  const createAudit = useCallback(async (name: string) => {
    if (!project) {
      throw new Error('Aucun projet sélectionné');
    }
    
    try {
      console.log(`🔄 Création d'un audit: "${name}" pour le projet ${project.id}`);
      
      const newAudit = await notionApi.createAudit({
        name,
        projectId: project.id
      });
      
      setAudit(newAudit);
      console.log(`✅ Audit créé: ${newAudit.name} (${newAudit.id})`);
      
      return newAudit;
    } catch (err) {
      console.error('Erreur lors de la création de l\'audit:', err);
      throw err;
    }
  }, [project]);

  // Fonction pour sauvegarder un audit existant
  const saveAudit = useCallback(async (auditData: Audit) => {
    if (!auditData || !auditData.id) {
      throw new Error('Audit invalide');
    }
    
    try {
      console.log(`🔄 Sauvegarde de l'audit: ${auditData.id}`);
      
      const updatedAudit = await notionApi.updateAudit(auditData.id, auditData);
      
      setAudit(updatedAudit);
      console.log(`✅ Audit sauvegardé: ${updatedAudit.name}`);
      
      return updatedAudit;
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de l\'audit:', err);
      throw err;
    }
  }, []);

  // Charger les données initiales au montage du composant
  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId, loadProject]);

  return {
    project,
    audit,
    pages,
    checklist,
    isLoading,
    error,
    loadProject,
    createAudit,
    saveAudit,
    setAudit,
    setPages
  };
};
