
import { useState, useEffect, useCallback } from 'react';
import { ChecklistItem, Exigence, ImportanceLevel } from '@/lib/types';
import { checklistService, exigencesService } from '@/services/notion';
import { useNotionRequest } from './useNotionRequest';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';

/**
 * Hook pour gérer la checklist et les exigences d'un projet
 */
export const useChecklistAndExigences = (projectId: string | undefined) => {
  const { executeRequest } = useNotionRequest();
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [exigences, setExigences] = useState<Exigence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Charge la checklist (référentiel de bonnes pratiques)
   */
  const loadChecklist = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const items = await checklistService.getItems(forceRefresh);
      setChecklistItems(items);
    } catch (err) {
      console.error('Erreur lors du chargement de la checklist:', err);
      setError('Impossible de charger la checklist');
      toast.error('Erreur de chargement', {
        description: 'La checklist n\'a pas pu être chargée'
      });
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Charge les exigences d'un projet spécifique
   */
  const loadExigences = useCallback(async (forceRefresh = false) => {
    if (!projectId) {
      setError('ID de projet manquant');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const items = await exigencesService.getExigencesByProject(projectId, forceRefresh);
      setExigences(items);
    } catch (err) {
      console.error(`Erreur lors du chargement des exigences pour le projet ${projectId}:`, err);
      setError('Impossible de charger les exigences');
      toast.error('Erreur de chargement', {
        description: 'Les exigences n\'ont pas pu être chargées'
      });
    } finally {
      setLoading(false);
    }
  }, [projectId]);
  
  /**
   * Charge la checklist et les exigences
   */
  const loadData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadChecklist(forceRefresh),
        projectId ? loadExigences(forceRefresh) : Promise.resolve()
      ]);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  }, [loadChecklist, loadExigences, projectId]);
  
  /**
   * Met à jour une exigence
   */
  const updateExigence = useCallback(async (
    itemId: string, 
    importance: ImportanceLevel, 
    comment: string = ''
  ): Promise<boolean> => {
    if (!projectId) {
      toast.error('Erreur', { description: 'ID du projet manquant' });
      return false;
    }
    
    try {
      // Chercher si l'exigence existe déjà
      const existingExigence = exigences.find(e => e.itemId === itemId);
      
      if (existingExigence) {
        // Mettre à jour l'exigence existante
        const updated = await exigencesService.updateExigence(existingExigence.id, {
          importance,
          comment
        });
        
        if (updated) {
          // Mettre à jour l'état local
          setExigences(prev => prev.map(e => 
            e.id === existingExigence.id ? { ...e, importance, comment } : e
          ));
          return true;
        }
      } else {
        // Créer une nouvelle exigence
        const newExigence = await exigencesService.createExigence({
          projectId,
          itemId,
          importance,
          comment
        });
        
        if (newExigence) {
          // Ajouter à l'état local
          setExigences(prev => [...prev, newExigence]);
          return true;
        }
      }
      
      return false;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'exigence:', err);
      toast.error('Erreur', {
        description: 'L\'exigence n\'a pas pu être mise à jour'
      });
      return false;
    }
  }, [projectId, exigences]);
  
  /**
   * Supprime une exigence
   */
  const deleteExigence = useCallback(async (itemId: string): Promise<boolean> => {
    if (!projectId) {
      toast.error('Erreur', { description: 'ID du projet manquant' });
      return false;
    }
    
    // Chercher l'exigence à supprimer
    const exigenceToDelete = exigences.find(e => e.itemId === itemId);
    
    if (!exigenceToDelete) {
      toast.error('Erreur', { description: 'Exigence introuvable' });
      return false;
    }
    
    try {
      const success = await exigencesService.deleteExigence(exigenceToDelete.id, projectId);
      
      if (success) {
        // Mettre à jour l'état local
        setExigences(prev => prev.filter(e => e.id !== exigenceToDelete.id));
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'exigence:', err);
      toast.error('Erreur', {
        description: 'L\'exigence n\'a pas pu être supprimée'
      });
      return false;
    }
  }, [projectId, exigences]);
  
  // Charger les données au montage du composant
  useEffect(() => {
    // Vérifier si l'API est configurée ou si on est en mode mock
    const isConfigured = localStorage.getItem('notion_api_key') !== null;
    const isMockMode = localStorage.getItem('notion_mock_mode') === 'true';
    
    if (isConfigured || isMockMode) {
      loadData();
    }
  }, [loadData]);
  
  return {
    checklistItems,
    exigences,
    loading,
    error,
    loadData,
    loadChecklist,
    loadExigences,
    updateExigence,
    deleteExigence
  };
};
