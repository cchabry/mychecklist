
import { useState } from 'react';
import { useServiceWithCache } from './useServiceWithCache';
import { auditsService } from '@/services/api/auditsService';
import { Audit } from '@/lib/types';
import { QueryFilters } from '@/services/api/types';

/**
 * Hook pour récupérer tous les audits
 */
export function useAudits(filters?: QueryFilters, options = {}) {
  return useServiceWithCache<Audit[]>(
    auditsService.getAll.bind(auditsService),
    [undefined, filters],
    options
  );
}

/**
 * Hook pour récupérer un audit par son ID
 */
export function useAudit(id: string | undefined, options = {}) {
  return useServiceWithCache<Audit | null>(
    auditsService.getById.bind(auditsService),
    [id],
    {
      enabled: !!id,
      ...options
    }
  );
}

/**
 * Hook pour récupérer les audits pour un projet spécifique
 */
export function useAuditsByProject(projectId: string | undefined, options = {}) {
  return useServiceWithCache<Audit[]>(
    auditsService.getByProject.bind(auditsService),
    [projectId],
    {
      enabled: !!projectId,
      ...options
    }
  );
}

/**
 * Hook pour récupérer le dernier audit pour un projet
 */
export function useLatestAuditByProject(projectId: string | undefined, options = {}) {
  return useServiceWithCache<Audit | null>(
    auditsService.getLatestByProject.bind(auditsService),
    [projectId],
    {
      enabled: !!projectId,
      ...options
    }
  );
}

/**
 * Hook pour créer un nouvel audit
 */
export function useCreateAudit() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const createAudit = async (data: Partial<Audit>) => {
    setIsCreating(true);
    setError(null);
    
    try {
      const newAudit = await auditsService.create(data);
      return newAudit;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };
  
  return { createAudit, isCreating, error };
}

/**
 * Hook pour mettre à jour un audit
 */
export function useUpdateAudit() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const updateAudit = async (id: string, data: Partial<Audit>) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const updatedAudit = await auditsService.update(id, data);
      return updatedAudit;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };
  
  return { updateAudit, isUpdating, error };
}

/**
 * Hook pour supprimer un audit
 */
export function useDeleteAudit() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const deleteAudit = async (id: string) => {
    setIsDeleting(true);
    setError(null);
    
    try {
      const success = await auditsService.delete(id);
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };
  
  return { deleteAudit, isDeleting, error };
}
