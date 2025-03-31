
/**
 * Hook réduit pour gérer seulement le statut de connexion Notion
 * Extrait de l'ancien useNotionIntegration
 */
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { notionApi } from '@/lib/notionProxy';
import { useNotion } from '@/contexts/NotionContext';

export const useNotionStatus = () => {
  const { status, testConnection, resetAndTest } = useNotion();
  
  // Vérifier l'état de la connexion Notion
  useEffect(() => {
    testConnection();
  }, [testConnection]);
  
  // Gérer la réinitialisation du mode mock et tester à nouveau
  const handleResetAndTest = () => {
    resetAndTest();
    toast.success('Configuration réinitialisée', {
      description: 'Tentative de connexion en mode réel...'
    });
  };
  
  return {
    isConnected: status.isConnected,
    isLoading: status.isLoading,
    error: status.error,
    isMockMode: status.isMockMode,
    handleResetAndTest
  };
};
