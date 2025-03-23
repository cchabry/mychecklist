
import { useState, useCallback } from 'react';
import { Audit } from '@/lib/types';
import { useServiceWithCache } from './useServiceWithCache';
import { auditsService } from '@/services/api/auditsService';

/**
 * Hook pour gérer les audits
 */
export function useAudits() {
  const {
    data: audits,
    isLoading,
    error,
    fetchData,
    invalidateCache,
    reload
  } = useServiceWithCache<Audit[]>(
    () => auditsService.getAll(),
    {
      cacheKey: 'audits',
      immediate: true
    }
  );

  const getAudit = useCallback(async (id: string) => {
    return auditsService.getById(id);
  }, []);

  const createAudit = useCallback(async (data: Partial<Audit>) => {
    const newAudit = await auditsService.create(data);
    invalidateCache();
    return newAudit;
  }, [invalidateCache]);

  const updateAudit = useCallback(async (id: string, data: Partial<Audit>) => {
    const updatedAudit = await auditsService.update(id, data);
    invalidateCache();
    return updatedAudit;
  }, [invalidateCache]);

  const deleteAudit = useCallback(async (id: string) => {
    const result = await auditsService.delete(id);
    invalidateCache();
    return result;
  }, [invalidateCache]);

  return {
    audits,
    isLoading,
    error,
    fetchData,
    reload,
    getAudit,
    createAudit,
    updateAudit,
    deleteAudit
  };
}
