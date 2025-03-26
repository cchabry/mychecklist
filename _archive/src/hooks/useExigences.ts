
import { useState, useEffect, useCallback } from 'react';
import { Exigence, ImportanceLevel } from '@/lib/types';
import { exigencesService } from '@/services/notion/exigences';
import { toast } from 'sonner';

/**
 * Hook pour gérer les exigences d'un projet
 */
export const useExigences = (projectId?: string) => {
  const [exigences, setExigences] = useState<Exigence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Charger les exigences du projet
   */
  const loadExigences = useCallback(async (forceRefresh = false) => {
    if (!projectId) {
      setError(new Error('ID de projet manquant'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await exigencesService.getExigencesByProject(projectId, forceRefresh);
      setExigences(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      toast.error('Erreur de chargement', {
        description: 'Impossible de charger les exigences'
      });
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  /**
   * Sauvegarder une exigence
   */
  const saveExigence = useCallback(async (exigence: Exigence) => {
    if (!projectId) {
      setError(new Error('ID de projet manquant'));
      return null;
    }

    // S'assurer que l'exigence a le bon projectId
    const exigenceToSave = {
      ...exigence,
      projectId
    };

    setLoading(true);
    setError(null);

    try {
      const savedExigence = await exigencesService.saveExigence(exigenceToSave);
      
      // Mettre à jour l'état local
      setExigences(current => {
        const index = current.findIndex(e => e.id === savedExigence.id);
        if (index >= 0) {
          return [
            ...current.slice(0, index),
            savedExigence,
            ...current.slice(index + 1)
          ];
        } else {
          return [...current, savedExigence];
        }
      });

      toast.success('Exigence sauvegardée', {
        description: 'L\'exigence a été sauvegardée avec succès'
      });

      return savedExigence;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      toast.error('Erreur de sauvegarde', {
        description: 'Impossible de sauvegarder l\'exigence'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  /**
   * Supprimer une exigence
   */
  const deleteExigence = useCallback(async (exigenceId: string) => {
    if (!projectId) {
      setError(new Error('ID de projet manquant'));
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await exigencesService.deleteExigence(exigenceId, projectId);
      
      if (success) {
        // Mettre à jour l'état local
        setExigences(current => current.filter(e => e.id !== exigenceId));

        toast.success('Exigence supprimée', {
          description: 'L\'exigence a été supprimée avec succès'
        });
      }

      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      toast.error('Erreur de suppression', {
        description: 'Impossible de supprimer l\'exigence'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  /**
   * Mettre à jour le niveau d'importance d'une exigence
   */
  const updateImportance = useCallback(async (itemId: string, importance: ImportanceLevel) => {
    const existingExigence = exigences.find(e => e.itemId === itemId);
    
    if (existingExigence) {
      return saveExigence({
        ...existingExigence,
        importance
      });
    } else {
      // Créer une nouvelle exigence
      return saveExigence({
        id: 'new',
        projectId: projectId || '',
        itemId,
        importance,
        comment: ''
      });
    }
  }, [exigences, projectId, saveExigence]);

  // Charger les exigences au chargement du composant
  useEffect(() => {
    if (projectId) {
      loadExigences();
    }
  }, [projectId, loadExigences]);

  return {
    exigences,
    loading,
    error,
    loadExigences,
    saveExigence,
    deleteExigence,
    updateImportance
  };
};
