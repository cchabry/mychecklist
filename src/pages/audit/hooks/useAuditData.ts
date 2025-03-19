
import { useEffect } from 'react';
import { Audit } from '@/lib/types';
import { useAuditProject } from './useAuditProject';
import { useAuditSave } from './useAuditSave';
import { useChecklistDatabase } from './useChecklistDatabase';

/**
 * Hook principal pour gérer les données d'audit
 * Utilise des hooks spécialisés pour améliorer la séparation des responsabilités
 */
export const useAuditData = (projectId: string | undefined, usingNotion: boolean) => {
  // Utiliser des hooks spécialisés
  const { project, audit, loading, notionError, setAudit, loadProject } = useAuditProject(projectId, usingNotion);
  const { isSaving, saveAudit } = useAuditSave(usingNotion);
  const { hasChecklistDb } = useChecklistDatabase();
  
  // Charger les données du projet au montage du composant
  useEffect(() => {
    loadProject();
  }, [projectId, usingNotion]);
  
  // Handler pour la sauvegarde de l'audit
  const handleSaveAudit = async () => {
    await saveAudit(audit);
  };
  
  // Fonction pour mettre à jour l'audit
  const updateAudit = (newAudit: Audit) => {
    setAudit(newAudit);
  };
  
  return {
    project,
    audit,
    loading,
    notionError,
    hasChecklistDb,
    isSaving,
    setAudit: updateAudit,
    loadProject,
    handleSaveAudit
  };
};
