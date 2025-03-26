
import { useState, useEffect } from 'react';
import { notionService } from '@/services/notion/notionService';
import { useLoadingState } from '@/hooks/form';
import { Audit } from '@/types/domain';

/**
 * Hook pour récupérer les audits d'un projet
 */
export function useProjectAudits(projectId?: string) {
  const [audits, setAudits] = useState<Audit[]>([]);
  const { isLoading, error, startLoading, stopLoading, setErrorMessage } = useLoadingState();
  
  useEffect(() => {
    if (!projectId) return;
    
    const fetchAudits = async () => {
      startLoading();
      
      try {
        const response = await notionService.getAudits(projectId);
        
        if (response.success && response.data) {
          // Trions les audits par date de mise à jour (du plus récent au plus ancien)
          const sortedAudits = [...response.data].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          
          setAudits(sortedAudits);
        } else {
          setErrorMessage(response.error?.message || 'Erreur lors du chargement des audits');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des audits:', error);
        setErrorMessage('Erreur lors du chargement des audits');
      } finally {
        stopLoading();
      }
    };
    
    fetchAudits();
  }, [projectId, startLoading, stopLoading, setErrorMessage]);
  
  // Fonction pour créer un nouvel audit
  const createAudit = async (name: string, description?: string) => {
    if (!projectId) return null;
    
    startLoading();
    
    try {
      const response = await notionService.createAudit({
        projectId,
        name,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      if (response.success && response.data) {
        setAudits(prev => [response.data, ...prev]);
        return response.data;
      } else {
        setErrorMessage(response.error?.message || 'Erreur lors de la création de l\'audit');
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'audit:', error);
      setErrorMessage('Erreur lors de la création de l\'audit');
      return null;
    } finally {
      stopLoading();
    }
  };
  
  return {
    audits,
    isLoading,
    error,
    createAudit
  };
}
