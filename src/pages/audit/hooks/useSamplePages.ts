
import { useState, useCallback } from 'react';
import { SamplePage } from '@/lib/types';
import { toast } from 'sonner';
import { getPagesByProjectId } from '@/lib/mockData';

export const useSamplePages = (projectId: string) => {
  const [pages, setPages] = useState<SamplePage[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Charger les pages à partir des données mockées
  const loadPages = useCallback(async () => {
    setLoading(true);
    try {
      // Pour l'instant, on utilise les données mockées
      const projectPages = getPagesByProjectId(projectId);
      setPages(projectPages);
    } catch (error) {
      console.error('Erreur lors du chargement des pages:', error);
      toast.error('Erreur lors du chargement des pages');
    } finally {
      setLoading(false);
    }
  }, [projectId]);
  
  // Ajouter une nouvelle page
  const addPage = useCallback((newPage: Omit<SamplePage, 'id'>) => {
    const id = `page-${Date.now()}`;
    const createdPage: SamplePage = {
      ...newPage,
      id,
      projectId,
      order: pages.length + 1
    };
    
    setPages(prev => [...prev, createdPage]);
    toast.success('Page ajoutée à l\'échantillon');
    return createdPage;
  }, [pages, projectId]);
  
  // Modifier une page existante
  const updatePage = useCallback((pageId: string, updates: Partial<SamplePage>) => {
    setPages(prev => prev.map(page => 
      page.id === pageId ? { ...page, ...updates } : page
    ));
    toast.success('Page mise à jour');
  }, []);
  
  // Supprimer une page
  const deletePage = useCallback((pageId: string) => {
    setPages(prev => {
      const updatedPages = prev.filter(page => page.id !== pageId);
      // Réorganiser l'ordre des pages restantes
      return updatedPages.map((page, index) => ({
        ...page,
        order: index + 1
      }));
    });
    toast.success('Page supprimée de l\'échantillon');
  }, []);
  
  // Réordonner les pages
  const reorderPages = useCallback((pageId: string, newOrder: number) => {
    setPages(prev => {
      const pageToMove = prev.find(p => p.id === pageId);
      if (!pageToMove) return prev;
      
      const currentOrder = pageToMove.order;
      if (currentOrder === newOrder) return prev;
      
      return prev.map(page => {
        if (page.id === pageId) {
          return { ...page, order: newOrder };
        }
        
        // Ajuster l'ordre des autres pages
        if (newOrder > currentOrder && page.order > currentOrder && page.order <= newOrder) {
          return { ...page, order: page.order - 1 };
        }
        if (newOrder < currentOrder && page.order >= newOrder && page.order < currentOrder) {
          return { ...page, order: page.order + 1 };
        }
        
        return page;
      });
    });
    toast.success('Ordre des pages mis à jour');
  }, []);
  
  return {
    pages,
    loading,
    loadPages,
    addPage,
    updatePage,
    deletePage,
    reorderPages
  };
};
