
import { useState, useEffect } from 'react';
import { Project } from '@/types/domain';
import { useOperationMode } from './useOperationMode';

/**
 * Hook pour récupérer les projets
 */
export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isDemoMode } = useOperationMode();

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // En mode démo, on génère des données fictives après un court délai
        setTimeout(() => {
          const mockProjects: Project[] = [
            {
              id: 'project-1',
              name: 'Site e-commerce',
              description: 'Plateforme de vente en ligne de produits électroniques',
              url: 'https://example-ecommerce.com',
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date().toISOString(),
              progress: 75
            },
            {
              id: 'project-2',
              name: 'Site corporate',
              description: 'Site vitrine pour une entreprise de services',
              url: 'https://example-corporate.com',
              createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              progress: 100
            },
            {
              id: 'project-3',
              name: 'Application mobile',
              description: 'Application de suivi d\'activité sportive',
              url: 'https://example-app.com',
              createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              progress: 30
            }
          ];
          
          setProjects(mockProjects);
          setIsLoading(false);
        }, 800);
        
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  return { projects, isLoading, error, isDemoMode };
};
