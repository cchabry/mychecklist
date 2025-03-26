
import { useState, useEffect, useCallback } from 'react';
import { ChecklistItem } from '@/lib/types';
import { checklistService } from '@/services/notion/checklist';
import { toast } from 'sonner';

/**
 * Hook pour gérer la checklist (référentiel de bonnes pratiques)
 */
export const useChecklist = () => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Charger les items de la checklist
   */
  const loadItems = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const data = await checklistService.getItems(forceRefresh);
      setItems(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      toast.error('Erreur de chargement', {
        description: 'Impossible de charger la checklist'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les items au chargement du composant
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return {
    items,
    loading,
    error,
    loadItems
  };
};
