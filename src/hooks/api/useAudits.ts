
import { useServiceWithCache } from './useServiceWithCache';
import { useServiceWithRetry } from './useServiceWithRetry';
import { auditsService } from '@/services/api/auditsService';
import { Audit } from '@/lib/types';
import { toast } from 'sonner';

/**
 * Hook pour récupérer tous les audits
 */
export function useAudits(options = {}) {
  return useServiceWithCache<Audit[]>(
    auditsService.getAll.bind(auditsService),
    [],
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
    async () => {
      const audits = await auditsService.getAll();
      return audits.filter(audit => audit.projectId === projectId);
    },
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
  const { execute, isLoading, error, result } = useServiceWithRetry<Audit, [Partial<Audit>]>(
    auditsService.create.bind(auditsService),
    'audit',
    'create',
    (result) => {
      toast.success('Audit créé avec succès');
    }
  );
  
  return { 
    createAudit: execute, 
    isCreating: isLoading, 
    error,
    result
  };
}

/**
 * Hook pour mettre à jour un audit
 */
export function useUpdateAudit() {
  const { execute, isLoading, error, result } = useServiceWithRetry<Audit, [string, Partial<Audit>]>(
    auditsService.update.bind(auditsService),
    'audit',
    'update',
    (result) => {
      toast.success('Audit mis à jour avec succès');
    }
  );
  
  return { 
    updateAudit: execute, 
    isUpdating: isLoading, 
    error,
    result
  };
}

/**
 * Hook pour supprimer un audit
 */
export function useDeleteAudit() {
  const { execute, isLoading, error, result } = useServiceWithRetry<boolean, [string]>(
    auditsService.delete.bind(auditsService),
    'audit',
    'delete',
    (result) => {
      toast.success('Audit supprimé avec succès');
    }
  );
  
  return { 
    deleteAudit: execute, 
    isDeleting: isLoading, 
    error,
    result
  };
}
