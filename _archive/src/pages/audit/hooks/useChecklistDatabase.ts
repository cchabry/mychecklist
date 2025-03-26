
import { useState, useEffect } from 'react';

/**
 * Hook pour vérifier la configuration de la base de données des checklists
 */
export const useChecklistDatabase = () => {
  const [hasChecklistDb, setHasChecklistDb] = useState(false);
  
  // Vérifier la configuration au chargement et quand le localStorage change
  useEffect(() => {
    const checkConfiguration = () => {
      const checklistsDbId = localStorage.getItem('notion_checklists_database_id');
      setHasChecklistDb(!!checklistsDbId);
    };
    
    // Vérifier immédiatement
    checkConfiguration();
    
    // Créer un listener pour les changements de localStorage
    const handleStorageChange = () => {
      checkConfiguration();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return { hasChecklistDb };
};
