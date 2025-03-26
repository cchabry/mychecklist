
import { useState, useEffect } from 'react';
import { SamplePage } from '@/lib/types';
import { getPagesByProjectId } from '@/lib/mockData';

/**
 * Hook pour gérer les échantillons de pages d'un projet
 */
export const useSamplePages = (projectId: string) => {
  const [pages, setPages] = useState<SamplePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les pages d'échantillon au montage du composant
  useEffect(() => {
    const loadPages = async () => {
      if (!projectId) {
        setError("ID de projet manquant");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Pour l'instant on utilise les données mockées
        // Cela sera remplacé par une requête réelle à l'API Notion
        const samplePages = getPagesByProjectId(projectId);
        setPages(samplePages);
        setError(null);
      } catch (err: any) {
        console.error(`Erreur lors du chargement des pages pour le projet ${projectId}:`, err);
        setError(err.message || "Impossible de charger les pages de l'échantillon");
      } finally {
        setLoading(false);
      }
    };

    loadPages();
  }, [projectId]);

  // Fonction pour ajouter une nouvelle page à l'échantillon
  const addPage = (page: Omit<SamplePage, 'id'>) => {
    const newPage: SamplePage = {
      id: `page-${Date.now()}`,
      projectId,
      ...page,
      order: pages.length + 1
    };
    
    setPages([...pages, newPage]);
    return newPage;
  };

  // Fonction pour supprimer une page de l'échantillon
  const removePage = (pageId: string) => {
    setPages(pages.filter(page => page.id !== pageId));
  };

  // Fonction pour mettre à jour une page existante
  const updatePage = (pageId: string, updates: Partial<SamplePage>) => {
    setPages(pages.map(page => 
      page.id === pageId ? { ...page, ...updates } : page
    ));
  };

  return {
    pages,
    loading,
    error,
    addPage,
    removePage,
    updatePage
  };
};
